"use client"

import { useState, useEffect } from "react"
import type { ConnectionStatus } from "@/types/chat"

export function useConnectionStatus(): ConnectionStatus {
  const [status, setStatus] = useState<ConnectionStatus>({
    isConnected: true,
    lastSeen: new Date(),
  })

  useEffect(() => {
    // Simulate connection status changes
    const interval = setInterval(() => {
      // Randomly simulate connection issues (5% chance)
      const shouldDisconnect = Math.random() < 0.05

      if (shouldDisconnect && status.isConnected) {
        setStatus({
          isConnected: false,
          reconnecting: true,
          lastSeen: new Date(),
        })

        // Simulate reconnection after 2-5 seconds
        setTimeout(
          () => {
            setStatus({
              isConnected: true,
              lastSeen: new Date(),
              reconnecting: false,
            })
          },
          2000 + Math.random() * 3000,
        )
      } else if (status.isConnected) {
        setStatus((prev) => ({
          ...prev,
          lastSeen: new Date(),
        }))
      }
    }, 10000) // Check every 10 seconds

    return () => clearInterval(interval)
  }, [status.isConnected])

  return status
}
