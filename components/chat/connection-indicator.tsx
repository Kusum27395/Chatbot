"use client"

import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff, Loader2 } from "lucide-react"
import type { ConnectionStatus } from "@/types/chat"

interface ConnectionIndicatorProps {
  status: ConnectionStatus
}

export function ConnectionIndicator({ status }: ConnectionIndicatorProps) {
  if (status.isConnected && !status.reconnecting) {
    return (
      <Badge variant="outline" className="text-xs">
        <Wifi className="h-3 w-3 mr-1" />
        Connected
      </Badge>
    )
  }

  if (status.reconnecting) {
    return (
      <Badge variant="secondary" className="text-xs">
        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
        Reconnecting...
      </Badge>
    )
  }

  return (
    <Badge variant="destructive" className="text-xs">
      <WifiOff className="h-3 w-3 mr-1" />
      Disconnected
    </Badge>
  )
}
