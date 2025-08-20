export interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  isTyping?: boolean
  status?: "sending" | "sent" | "delivered" | "failed"
}

export interface ChatSession {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

export interface ConnectionStatus {
  isConnected: boolean
  lastSeen?: Date
  reconnecting?: boolean
}
