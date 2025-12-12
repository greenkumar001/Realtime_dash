"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, Mail, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // AJAX XMLHttpRequest validation and login
    const xhr = new XMLHttpRequest()
    xhr.open("POST", `${API_URL}/login`, true)
    xhr.setRequestHeader("Content-Type", "application/json")

    xhr.onload = () => {
      setIsLoading(false)
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText)
        localStorage.setItem("access_token", response.access_token)
        router.push("/forum")
      } else {
        try {
          const error = JSON.parse(xhr.responseText)
          setError(error.detail || "Login failed")
        } catch {
          setError("Login failed. Please try again.")
        }
      }
    }

    xhr.onerror = () => {
      setIsLoading(false)
      setError("Network error. Please check if backend is running.")
    }

    xhr.send(JSON.stringify({ username, password }))
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 animate-slide-down">
          <Link
            href="/"
            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold mb-2 text-balance">Admin Login</h1>
          <p className="text-muted-foreground text-lg leading-relaxed">Sign in to manage questions and dashboard</p>
        </div>

        <Card className="p-8 animate-slide-up border-2 hover:border-primary/50 transition-colors">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-100 text-red-800 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="username" className="text-base font-semibold">
                Username or Email
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="admin"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value)
                  setError("")
                }}
                className="h-12 text-base"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-base font-semibold">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError("")
                  }}
                  className="pl-10 h-12 text-base"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold text-base"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              {"Don't have an account? "}
              <Link href="/register" className="text-primary hover:underline font-semibold">
                Register here
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
