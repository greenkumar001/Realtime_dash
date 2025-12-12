"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, Mail, User, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    adminCode: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match")
      return
    }
    setIsLoading(true)

    const xhr = new XMLHttpRequest()
    xhr.open("POST", `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/register`, true)
    xhr.setRequestHeader("Content-Type", "application/json")

    xhr.onload = () => {
      setIsLoading(false)
      if (xhr.status === 200) {
        try {
          const res = JSON.parse(xhr.responseText)
          localStorage.setItem("access_token", res.access_token)
          window.location.href = "/forum"
        } catch (err) {
          alert("Registration succeeded but response parsing failed")
        }
      } else {
        try {
          const err = JSON.parse(xhr.responseText)
          alert(err.detail || "Registration failed")
        } catch {
          alert("Registration failed. Please try again.")
        }
      }
    }

    xhr.onerror = () => {
      setIsLoading(false)
      alert("Network error. Check backend is running.")
    }

    const payload = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      admin_code: formData.adminCode || undefined,
    }

    xhr.send(JSON.stringify(payload))
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
          <h1 className="text-4xl font-bold mb-2 text-balance">Create Account</h1>
          <p className="text-muted-foreground text-lg leading-relaxed">Join as an admin to manage the Q&A dashboard</p>
        </div>

        <Card className="p-8 animate-slide-up border-2 hover:border-primary/50 transition-colors">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-base font-semibold">
                Username
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="johndoe"
                  value={formData.username}
                  onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                  className="pl-10 h-12 text-base"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-semibold">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  className="pl-10 h-12 text-base"
                  required
                />
              </div>
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
                  value={formData.password}
                  onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                  className="pl-10 h-12 text-base"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-base font-semibold">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  className="pl-10 h-12 text-base"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminCode" className="text-base font-semibold">
                Admin Code (optional)
              </Label>
              <div className="relative">
                <Input
                  id="adminCode"
                  type="text"
                  placeholder="Enter admin code if you have one"
                  value={formData.adminCode}
                  onChange={(e) => setFormData((prev) => ({ ...prev, adminCode: e.target.value }))}
                  className="pl-3 h-12 text-base"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold text-base"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline font-semibold">
                Sign in here
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
