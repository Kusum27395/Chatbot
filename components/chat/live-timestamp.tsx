"use client"

import { useState, useEffect } from "react"

interface LiveTimestampProps {
  timestamp: Date
}

export function LiveTimestamp({ timestamp }: LiveTimestampProps) {
  const [displayTime, setDisplayTime] = useState("")

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const diff = now.getTime() - timestamp.getTime()
      const seconds = Math.floor(diff / 1000)
      const minutes = Math.floor(seconds / 60)
      const hours = Math.floor(minutes / 60)
      const days = Math.floor(hours / 24)

      if (seconds < 60) {
        setDisplayTime("just now")
      } else if (minutes < 60) {
        setDisplayTime(`${minutes}m ago`)
      } else if (hours < 24) {
        setDisplayTime(`${hours}h ago`)
      } else if (days < 7) {
        setDisplayTime(`${days}d ago`)
      } else {
        setDisplayTime(timestamp.toLocaleDateString())
      }
    }

    updateTime()
    const interval = setInterval(updateTime, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [timestamp])

  return <span className="text-xs text-muted-foreground">{displayTime}</span>
}
