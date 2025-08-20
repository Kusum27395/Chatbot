"use client"

import { useState, useEffect } from "react"
import { Bot } from "lucide-react"

interface EnhancedTypingIndicatorProps {
  isVisible: boolean
}

export function EnhancedTypingIndicator({ isVisible }: EnhancedTypingIndicatorProps) {
  const [dots, setDots] = useState(1)
  const [typingText, setTypingText] = useState("AI is thinking")

  useEffect(() => {
    if (!isVisible) return

    const messages = ["AI is thinking", "Processing your message", "Generating response", "Almost ready"]

    let messageIndex = 0
    const messageInterval = setInterval(() => {
      setTypingText(messages[messageIndex])
      messageIndex = (messageIndex + 1) % messages.length
    }, 2000)

    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev % 3) + 1)
    }, 500)

    return () => {
      clearInterval(messageInterval)
      clearInterval(dotsInterval)
    }
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div className="flex gap-3 p-4">
      <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full bg-muted">
        <Bot className="h-4 w-4" />
      </div>
      <div className="flex flex-col gap-2">
        <div className="rounded-lg px-4 py-2 text-sm bg-muted text-muted-foreground max-w-fit">
          <div className="flex items-center gap-2">
            <span>{typingText}</span>
            <div className="flex gap-1">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-1 w-1 bg-current rounded-full transition-opacity duration-300 ${
                    i <= dots ? "opacity-100" : "opacity-30"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
