"use client"

import { Check, CheckCheck, Clock, AlertCircle } from "lucide-react"
import type { Message } from "@/types/chat"

interface MessageStatusProps {
  message: Message
}

export function MessageStatus({ message }: MessageStatusProps) {
  if (message.role !== "user") return null

  const getStatusIcon = () => {
    switch (message.status) {
      case "sending":
        return <Clock className="h-3 w-3 text-muted-foreground animate-pulse" />
      case "sent":
        return <Check className="h-3 w-3 text-muted-foreground" />
      case "delivered":
        return <CheckCheck className="h-3 w-3 text-primary" />
      case "failed":
        return <AlertCircle className="h-3 w-3 text-destructive" />
      default:
        return <Check className="h-3 w-3 text-muted-foreground" />
    }
  }

  return <div className="flex items-center gap-1 mt-1">{getStatusIcon()}</div>
}
