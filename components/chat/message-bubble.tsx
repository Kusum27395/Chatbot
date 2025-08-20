"use client"

import { cn } from "@/lib/utils"
import { Bot, User } from "lucide-react"
import type { Message } from "@/types/chat"
import { MessageStatus } from "./message-status"
import { LiveTimestamp } from "./live-timestamp"

interface MessageBubbleProps {
  message: Message
  isLatest?: boolean
}

export function MessageBubble({ message, isLatest }: MessageBubbleProps) {
  const isUser = message.role === "user"

  return (
    <div
      className={cn(
        "flex gap-3 p-4 transition-all duration-300 ease-in-out",
        isUser ? "flex-row-reverse" : "flex-row",
        isLatest && "animate-in slide-in-from-bottom-2 duration-300",
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full transition-colors",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted",
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      <div className={cn("flex flex-col gap-2 max-w-[80%]", isUser ? "items-end" : "items-start")}>
        <div
          className={cn(
            "rounded-lg px-4 py-2 text-sm transition-all duration-200",
            isUser ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground border",
            message.status === "failed" && "border-destructive bg-destructive/10",
          )}
        >
          {message.isTyping ? (
            <div className="flex items-center gap-1">
              <div className="flex gap-1">
                <div className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="h-2 w-2 bg-current rounded-full animate-bounce" />
              </div>
            </div>
          ) : (
            <p className="whitespace-pre-wrap">{message.content}</p>
          )}
        </div>

        <div className={cn("flex items-center gap-2", isUser ? "flex-row-reverse" : "flex-row")}>
          <LiveTimestamp timestamp={message.timestamp} />
          <MessageStatus message={message} />
        </div>
      </div>
    </div>
  )
}
