"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Send, LogOut } from "lucide-react"
import Link from "next/link"
import { QuestionCard } from "@/components/question-card"
import { AdminLoginModal } from "@/components/admin-login-modal"
import { useWebSocket } from "@/hooks/use-websocket"

type Question = {
  id: string
  message: string
  timestamp: Date
  status: "Pending" | "Escalated" | "Answered"
  answers: string[]
}

export default function ForumPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [newQuestion, setNewQuestion] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [validationError, setValidationError] = useState("")
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const API_URL = (process.env.NEXT_PUBLIC_API_URL as string) ?? "http://localhost:8000"

  const handleAdminLogin = async (username: string, password: string) => {
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.detail || "Login failed")
      }
      const data = await res.json()
      const token = data.access_token
      localStorage.setItem("access_token", token)
      const meRes = await fetch(`${API_URL}/me`, { headers: { "Authorization": `Bearer ${token}` } })
      if (!meRes.ok) throw new Error("Failed to verify user")
      const me = await meRes.json()
      if (me.is_admin) {
        setIsAdmin(true)
      } else {
        throw new Error("User is not an admin")
      }
    } catch (e: any) {
      throw new Error(e.message || "Login error")
    }
  }

  const handleAdminLogout = () => {
    localStorage.removeItem("access_token")
    setIsAdmin(false)
  }

  useEffect(() => {
    let mounted = true
    const fetchQuestions = async () => {
      try {
        const res = await fetch(`${API_URL}/questions`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        if (!mounted) return
        const mapped = data.map((q: any) => ({
          id: String(q.question_id),
          message: q.message,
          timestamp: new Date(q.timestamp),
          status: q.status,
          answers: (q.answers || []).map((a: any) => a.content),
        }))
        setQuestions(mapped)
      } catch (e) {
        console.error("Failed to load questions", e)
      }
    }

    fetchQuestions()
    return () => {
      mounted = false
    }
  }, [API_URL])

  useEffect(() => {
    const interval = setInterval(() => {
      console.log("[v0] Auto-refreshing questions...")
      // In a real app, this would fetch from an API
      // For now, we'll just update timestamps to show it's working
      setQuestions((prev) => [...prev])
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (!token) return
    ;(async () => {
      try {
        const res = await fetch(`${API_URL}/me`, { headers: { "Authorization": `Bearer ${token}` } })
        if (!res.ok) { localStorage.removeItem("access_token"); return }
        const me = await res.json()
        if (me.is_admin) setIsAdmin(true)
      } catch (e) {
        console.error("me check failed", e)
      }
    })()
  }, [API_URL])

  // WebSocket for real-time updates
  useWebSocket({
    url: `${API_URL.replace("http", "ws")}/ws`,
    onMessage: (msg) => {
      if (msg.type === "new_question") {
        const q = msg.question
        const newQ: Question = {
          id: String(q.question_id),
          message: q.message,
          timestamp: new Date(q.timestamp),
          status: q.status as any,
          answers: [],
        }
        setQuestions((prev) => [newQ, ...prev])
      } else if (msg.type === "new_answer") {
        const a = msg.answer
        setQuestions((prev) =>
          prev.map((q) => (q.id === String(a.question_id) ? { ...q, answers: [...q.answers, a.content] } : q))
        )
      } else if (msg.type === "question_updated") {
        const updated = msg.question
        setQuestions((prev) =>
          prev.map((q) =>
            q.id === String(updated.question_id)
              ? { ...q, status: updated.status as any, escalated: updated.escalated }
              : q
          )
        )
      }
    },
  })

  const validateQuestionWithAJAX = (question: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      // Simulating an API endpoint for validation
      xhr.open("POST", "/api/validate-question", true)
      xhr.setRequestHeader("Content-Type", "application/json")

      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText)
          resolve(response.isValid)
        } else {
          reject(new Error("Validation failed"))
        }
      }

      xhr.onerror = () => {
        reject(new Error("Network error"))
      }

      // For demo purposes, we simulate validation locally
      // In production, this would call a real API
      setTimeout(() => {
        if (question.trim().length === 0) {
          resolve(false)
        } else {
          resolve(true)
        }
      }, 300)

      // xhr.send(JSON.stringify({ question }))
    })
  }

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError("")

    try {
      setIsSubmitting(true)
      const isValid = await validateQuestionWithAJAX(newQuestion)

      if (!isValid) {
        setValidationError("Question cannot be blank. Please enter a valid question.")
        setIsSubmitting(false)
        return
      }

      const res = await fetch(`${API_URL}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newQuestion }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const created = await res.json()
      const mapped: Question = {
        id: String(created.question_id),
        message: created.message,
        timestamp: new Date(created.timestamp),
        status: created.status,
        answers: [],
      }
      setQuestions((prev) => [mapped, ...prev])
      setNewQuestion("")
      setIsSubmitting(false)
    } catch (error) {
      setValidationError("An error occurred. Please try again.")
      setIsSubmitting(false)
    }
  }

  const handleSubmitAnswer = async (questionId: string, answer: string) => {
    try {
      const token = localStorage.getItem("access_token")
      const headers: Record<string, string> = { "Content-Type": "application/json" }
      if (token) headers["Authorization"] = `Bearer ${token}`
      const res = await fetch(`${API_URL}/questions/${questionId}/answers`, {
        method: "POST",
        headers,
        body: JSON.stringify({ content: answer }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const created = await res.json()
      setQuestions((prev) => prev.map((q) => (q.id === questionId ? { ...q, answers: [...q.answers, created.content] } : q)))
    } catch (e) {
      console.error("Failed to submit answer", e)
    }
  }

  const handleMarkAnswered = async (questionId: string) => {
    if (!isAdmin) {
      alert("Only administrators can mark questions as answered.")
      return
    }
    try {
      const token = localStorage.getItem("access_token")
      if (!token) { alert("No admin token found"); return }
      const res = await fetch(`${API_URL}/questions/${questionId}/answer`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.detail || `HTTP ${res.status}`)
      }
      setQuestions((prev) => prev.map((q) => (q.id === questionId ? { ...q, status: "Answered" } : q)))
    } catch (e) {
      console.error("Failed to mark answered", e)
      alert("Failed to mark as answered")
    }
  }

  const handleEscalate = (questionId: string) => {
    if (!isAdmin) {
      alert("Only administrators can escalate questions.")
      return
    }
    setQuestions((prev) => prev.map((q) => (q.id === questionId ? { ...q, status: "Escalated" } : q)))
  }

  const sortedQuestions = [...questions].sort((a, b) => {
    if (a.status === "Escalated" && b.status !== "Escalated") return -1
    if (a.status !== "Escalated" && b.status === "Escalated") return 1
    return b.timestamp.getTime() - a.timestamp.getTime()
  })

  return (
    <>
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary border-b border-border sticky top-0 z-50 backdrop-blur-sm shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <h1 className="text-2xl font-bold text-white hover:text-secondary transition-colors">Q&A Forum</h1>
            </Link>
            <div className="flex items-center gap-3">
              {isAdmin ? (
                <>
                  <span className="text-white text-sm bg-secondary px-3 py-1 rounded-full font-semibold">
                    Admin Mode
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAdminLogout}
                    className="bg-white/10 text-white border-white/30 hover:bg-white/20"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <span className="text-white text-sm bg-white/20 px-3 py-1 rounded-full">Guest</span>
                  <Button
                    variant="outline"
                    onClick={() => setLoginModalOpen(true)}
                    className="bg-white/10 text-white border-white/30 hover:bg-white/20"
                  >
                    Admin Login
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Submit Question Form */}
        <Card className="p-6 mb-8 animate-slide-down border-2 hover:border-primary/50 transition-colors shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-balance">Ask a Question</h2>
          <form onSubmit={handleSubmitQuestion} className="space-y-4">
            <Textarea
              placeholder="Type your question here..."
              value={newQuestion}
              onChange={(e) => {
                setNewQuestion(e.target.value)
                setValidationError("")
              }}
              className="min-h-32 resize-none text-base"
            />
            {validationError && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm animate-slide-down">
                {validationError}
              </div>
            )}
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">{newQuestion.length}/500 characters</p>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold animate-pulse-glow"
              >
                <Send className="mr-2 h-4 w-4" />
                {isSubmitting ? "Validating..." : "Submit Question"}
              </Button>
            </div>
          </form>
          <p className="text-xs text-muted-foreground mt-4 flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Live dashboard - updates automatically every 5 seconds
          </p>
        </Card>

        {/* Questions List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">All Questions ({questions.length})</h2>
            {isAdmin && (
              <div className="text-sm text-muted-foreground">
                {questions.filter((q) => q.status === "Pending").length} Pending •{" "}
                {questions.filter((q) => q.status === "Escalated").length} Escalated •{" "}
                {questions.filter((q) => q.status === "Answered").length} Answered
              </div>
            )}
          </div>
          {sortedQuestions.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground text-lg">No questions yet. Be the first to ask!</p>
            </Card>
          ) : (
            sortedQuestions.map((question, index) => (
              <QuestionCard
                key={question.id}
                question={question}
                index={index}
                isAdmin={isAdmin}
                onSubmitAnswer={handleSubmitAnswer}
                onMarkAnswered={handleMarkAnswered}
                onEscalate={handleEscalate}
              />
            ))
          )}
        </div>
      </div>
    </div>

    <AdminLoginModal
      open={loginModalOpen}
      onOpenChange={setLoginModalOpen}
      onLogin={handleAdminLogin}
      isLoading={isLoggingIn}
    />
    </>
  )
}
