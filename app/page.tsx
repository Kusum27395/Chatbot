"use client"

import { useAuth } from "@/contexts/auth-context"
import { AuthPage } from "@/components/auth/auth-page"
import { ChatInterface } from "@/components/chat/chat-interface"
import { Loader2 } from "lucide-react"

export default function HomePage() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <AuthPage />
  }

  return <ChatInterface />
}
