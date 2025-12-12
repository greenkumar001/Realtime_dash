import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MessageSquare, Zap, Users, Bell } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-primary">
        <div className="absolute inset-0 shimmer opacity-20" />
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center animate-slide-down">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 text-balance">Real-Time Q&A Dashboard</h1>
            <p className="text-xl text-white/90 mb-8 leading-relaxed text-pretty">
              Ask questions, get answers instantly. Connect with your community in real-time.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/forum">
                <Button
                  size="lg"
                  className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold px-8 animate-pulse-glow"
                >
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Enter Forum
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/10 text-white border-white/30 hover:bg-white/20 font-semibold px-8"
                >
                  Admin Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-card p-6 rounded-xl border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="bg-primary rounded-2xl p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 shimmer opacity-10" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-balance">Ready to get started?</h2>
            <p className="text-white/90 text-lg mb-8 text-pretty">
              Join our community and start asking questions today.
            </p>
            <Link href="/forum">
              <Button
                size="lg"
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold px-8"
              >
                Get Started Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

const features = [
  {
    icon: Zap,
    title: "Real-Time Updates",
    description: "See questions and answers appear instantly as they happen.",
  },
  {
    icon: MessageSquare,
    title: "Easy to Use",
    description: "Simple interface for asking and answering questions quickly.",
  },
  {
    icon: Users,
    title: "Community Driven",
    description: "Everyone can participate and contribute to the discussion.",
  },
  {
    icon: Bell,
    title: "Admin Notifications",
    description: "Admins get notified instantly when new questions arrive.",
  },
]
