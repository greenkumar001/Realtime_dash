"use client"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Clock, ArrowUp, Check, Send, CheckCircle } from "lucide-react"

type Question = {
  id: string
  message: string
  timestamp: Date
  status: "Pending" | "Escalated" | "Answered"
  answers: string[]
}

type QuestionCardProps = {
  question: Question
  index: number
  isAdmin?: boolean
  onSubmitAnswer: (questionId: string, answer: string) => void
  onMarkAnswered?: (questionId: string) => void
  onEscalate?: (questionId: string) => void
}

export function QuestionCard({
  question,
  index,
  isAdmin = false,
  onSubmitAnswer,
  onMarkAnswered,
  onEscalate,
}: QuestionCardProps) {
  const [answerText, setAnswerText] = useState("")
  const API_URL = (process.env.NEXT_PUBLIC_API_URL as string) ?? "http://localhost:8000"
  const [suggestions, setSuggestions] = useState<Array<{id: string; text: string; confidence?: number; source?: string}>>([])
  const [isSuggesting, setIsSuggesting] = useState(false)
  const [suggestError, setSuggestError] = useState<string | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)

  const handleSubmit = () => {
    if (!answerText.trim()) return
    onSubmitAnswer(question.id, answerText)
    setAnswerText("")
  }

  const fetchSuggestions = async () => {
    setSuggestError(null)
    setIsSuggesting(true)
    setShowSuggestions(true)
    try {
      const res = await fetch(`${API_URL}/suggest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question.message }),
      })

      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}))
        throw new Error(errorBody.detail || `HTTP ${res.status}`)
      }

      const data = await res.json()
      setSuggestions(data.suggestions || [])
    } catch (err: any) {
      setSuggestError(err?.message || "Failed to generate suggestions")
      setSuggestions([])
    } finally {
      setIsSuggesting(false)
    }
  }

  return (
    <Card
      className={`p-6 animate-slide-up transition-all duration-300 hover:shadow-lg ${
        question.status === "Escalated" ? "border-2 border-secondary ring-2 ring-secondary/20" : ""
      }`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Question Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-lg leading-relaxed mb-3">{question.message}</p>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {formatTimestamp(question.timestamp)}
            </div>
          </div>
        </div>
        <Badge
          variant={
            question.status === "Answered" ? "default" : question.status === "Escalated" ? "secondary" : "outline"
          }
          className={`${
            question.status === "Escalated"
              ? "bg-secondary text-secondary-foreground animate-pulse-glow"
              : question.status === "Answered"
                ? "bg-primary text-primary-foreground"
                : ""
          }`}
        >
          {question.status === "Answered" && <Check className="mr-1 h-3 w-3" />}
          {question.status === "Escalated" && <ArrowUp className="mr-1 h-3 w-3" />}
          {question.status}
        </Badge>
      </div>

      {/* Admin Actions */}
      {isAdmin && question.status !== "Answered" && (
        <div className="flex gap-2 mb-4">
          {question.status === "Pending" && onEscalate && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEscalate(question.id)}
              className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground"
            >
              <ArrowUp className="mr-1 h-3 w-3" />
              Escalate
            </Button>
          )}
          {onMarkAnswered && (
            <Button
              size="sm"
              onClick={() => onMarkAnswered(question.id)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <CheckCircle className="mr-1 h-3 w-3" />
              Mark as Answered
            </Button>
          )}
        </div>
      )}

      {/* Answers */}
      {question.answers.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border space-y-3">
          <h4 className="font-semibold text-sm text-muted-foreground">
            {question.answers.length} {question.answers.length === 1 ? "Answer" : "Answers"}:
          </h4>
          {question.answers.map((answer, idx) => (
            <div key={idx} className="bg-muted p-4 rounded-lg animate-slide-down">
              <p className="leading-relaxed">{answer}</p>
            </div>
          ))}
        </div>
      )}

      {/* Answer Form */}
      {question.status !== "Answered" && (
        <div className="mt-4 pt-4 border-t border-border">
          {/* Suggestion assistant */}
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Answer Assistant</div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => { setShowSuggestions((s) => !s); if (!showSuggestions) fetchSuggestions() }}>
                {isSuggesting ? "Thinking..." : showSuggestions ? "Hide" : "Suggest Answer"}
              </Button>
            </div>
          </div>

          {showSuggestions && (
            <div className="mb-4 space-y-3">
              {isSuggesting && <div className="text-sm text-muted-foreground">Generating suggestions…</div>}
              {suggestError && <div className="text-sm text-red-500">{suggestError}</div>}
              {suggestions.length === 0 && !isSuggesting && !suggestError && (
                <div className="text-sm text-muted-foreground">No suggestions available.</div>
              )}
              {suggestions.map((sugg) => (
                <div key={sugg.id} className="p-3 bg-muted rounded-lg">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <p className="leading-relaxed text-sm">{sugg.text}</p>
                      <div className="text-xs text-muted-foreground mt-2">Source: {sugg.source || "RAG"} • Confidence: {(sugg.confidence || 0).toFixed(2)}</div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setAnswerText(sugg.text)}>
                        Insert
                      </Button>
                      <Button size="sm" onClick={() => { onSubmitAnswer(question.id, sugg.text); setAnswerText("") }}>
                        Publish
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <Textarea
              placeholder="Type your answer..."
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              className="min-h-20 resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault()
                  handleSubmit()
                }
              }}
            />
            <Button
              onClick={handleSubmit}
              disabled={!answerText.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Press Cmd/Ctrl + Enter to submit</p>
        </div>
      )}
    </Card>
  )
}

function formatTimestamp(date: Date) {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const hours = Math.floor(diff / 3600000)
  const minutes = Math.floor(diff / 60000)

  if (hours > 24) {
    return date.toLocaleDateString()
  } else if (hours > 0) {
    return `${hours}h ago`
  } else if (minutes > 0) {
    return `${minutes}m ago`
  } else {
    return "Just now"
  }
}
