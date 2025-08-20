"use client"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { LogOut, MessageSquare, Plus } from "lucide-react"

interface ChatHeaderProps {
  onNewChat: () => void
}

export function ChatHeader({ onNewChat }: ChatHeaderProps) {
  const { user, logout } = useAuth()

  return (
    <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-semibold">AI Assistant</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onNewChat}>
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Welcome, {user?.name}</span>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
