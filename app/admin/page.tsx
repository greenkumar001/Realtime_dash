"use client"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Bell, CheckCircle, AlertCircle, MessageSquare } from "lucide-react"
import Link from "next/link"

type Stats = {
  totalQuestions: number
  pending: number
  escalated: number
  answered: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalQuestions: 12,
    pending: 5,
    escalated: 2,
    answered: 5,
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <Link href="/forum">
              <Button variant="outline" className="bg-white/10 text-white border-white/30 hover:bg-white/20">
                Go to Forum
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <Link
            href="/forum"
            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Forum
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 animate-slide-up border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Total Questions</h3>
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <p className="text-3xl font-bold">{stats.totalQuestions}</p>
          </Card>

          <Card
            className="p-6 animate-slide-up border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
            style={{ animationDelay: "100ms" }}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Pending</h3>
              <AlertCircle className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-3xl font-bold">{stats.pending}</p>
          </Card>

          <Card
            className="p-6 animate-slide-up border-2 hover:border-secondary/50 transition-all duration-300 hover:shadow-lg"
            style={{ animationDelay: "200ms" }}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Escalated</h3>
              <Bell className="h-5 w-5 text-secondary" />
            </div>
            <p className="text-3xl font-bold text-secondary">{stats.escalated}</p>
          </Card>

          <Card
            className="p-6 animate-slide-up border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
            style={{ animationDelay: "300ms" }}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Answered</h3>
              <CheckCircle className="h-5 w-5 text-primary" />
            </div>
            <p className="text-3xl font-bold text-primary">{stats.answered}</p>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="p-6 animate-slide-down">
          <h2 className="text-2xl font-semibold mb-6">Quick Actions</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Link href="/forum">
              <Button className="w-full h-16 bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold text-base">
                <MessageSquare className="mr-2 h-5 w-5" />
                View All Questions
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="w-full h-16 font-semibold text-base bg-transparent">
                Manage Admin Users
              </Button>
            </Link>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6 mt-8 animate-slide-up">
          <h2 className="text-2xl font-semibold mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {[
              { action: "New question submitted", time: "2 minutes ago", status: "Pending" },
              { action: "Question marked as answered", time: "15 minutes ago", status: "Answered" },
              { action: "Question escalated", time: "1 hour ago", status: "Escalated" },
              { action: "New answer posted", time: "2 hours ago", status: "Pending" },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-muted/70 transition-colors"
              >
                <div>
                  <p className="font-medium">{activity.action}</p>
                  <p className="text-sm text-muted-foreground">{activity.time}</p>
                </div>
                <Badge
                  variant={
                    activity.status === "Answered"
                      ? "default"
                      : activity.status === "Escalated"
                        ? "secondary"
                        : "outline"
                  }
                  className={activity.status === "Escalated" ? "bg-secondary text-secondary-foreground" : ""}
                >
                  {activity.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
