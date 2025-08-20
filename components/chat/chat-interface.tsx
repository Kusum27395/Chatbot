"use client"

import { useState, useRef, useEffect } from "react"
import { MessageBubble } from "./message-bubble"
import { ChatInput } from "./chat-input"
import { PersonalitySelector } from "./personality-selector"
import { EnhancedTypingIndicator } from "./enhanced-typing-indicator"
import { ConnectionIndicator } from "./connection-indicator"
import type { Message, ChatSession } from "@/types/chat"
import { useAuth } from "@/contexts/auth-context"
import { useConnectionStatus } from "@/hooks/use-connection-status"
import { aiService } from "@/lib/ai-service"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"

export function ChatInterface() {
  const { user } = useAuth()
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [showPersonalitySelector, setShowPersonalitySelector] = useState(false)
  const [currentPersonality, setCurrentPersonality] = useState("helpful")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const connectionStatus = useConnectionStatus()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [currentSession?.messages, isTyping])

  useEffect(() => {
    // Create initial chat session
    createNewChat()
  }, [])

  const createNewChat = () => {
    const personalities = aiService.getPersonalities()
    const currentPersonalityData = personalities[currentPersonality] ||
      personalities["helpful"] || { name: "Assistant", description: "Helpful AI assistant" }

    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: "New Chat",
      messages: [
        {
          id: "welcome",
          content: `Hello ${user?.name || "there"}! I'm your AI assistant in ${currentPersonalityData.name} mode. I can help you with questions, provide information, or just have a friendly conversation. 

Try typing "/help" to see what I can do, or "/personality [name]" to change my response style!`,
          role: "assistant",
          timestamp: new Date(),
          status: "delivered",
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setCurrentSession(newSession)
  }

  const handlePersonalityChange = (personality: string) => {
    setCurrentPersonality(personality)
    aiService.setPersonality(personality as any)
    setShowPersonalitySelector(false)

    const personalities = aiService.getPersonalities()
    const personalityData = personalities[personality] || { name: "Assistant", description: "AI assistant" }

    // Add a message about the personality change
    if (currentSession) {
      const personalityMessage: Message = {
        id: Date.now().toString(),
        content: `I've switched to ${personalityData.name} mode! ${personalityData.description}. How can I help you now?`,
        role: "assistant",
        timestamp: new Date(),
        status: "delivered",
      }

      setCurrentSession((prev) =>
        prev
          ? {
              ...prev,
              messages: [...prev.messages, personalityMessage],
              updatedAt: new Date(),
            }
          : null,
      )
    }
  }

  const updateMessageStatus = (messageId: string, status: Message["status"]) => {
    setCurrentSession((prev) =>
      prev
        ? {
            ...prev,
            messages: prev.messages.map((msg) => (msg.id === messageId ? { ...msg, status } : msg)),
          }
        : null,
    )
  }

  const handleSendMessage = async (content: string) => {
    if (!currentSession || !connectionStatus.isConnected) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: "user",
      timestamp: new Date(),
      status: "sending",
    }

    // Add user message with sending status
    const updatedSession = {
      ...currentSession,
      messages: [...currentSession.messages, userMessage],
      updatedAt: new Date(),
    }
    setCurrentSession(updatedSession)

    // Simulate message sending delay
    setTimeout(() => {
      updateMessageStatus(userMessage.id, "sent")
      setTimeout(() => {
        updateMessageStatus(userMessage.id, "delivered")
      }, 500)
    }, 300)

    // Show enhanced typing indicator
    setIsTyping(true)

    try {
      const aiResponse = await aiService.generateResponse(content, updatedSession.messages)

      // Add AI response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        role: "assistant",
        timestamp: new Date(),
        status: "delivered",
      }

      setCurrentSession((prev) =>
        prev
          ? {
              ...prev,
              messages: [...prev.messages, aiMessage],
              updatedAt: new Date(),
            }
          : null,
      )
    } catch (error) {
      console.error("Error generating AI response:", error)
      // Mark user message as failed
      updateMessageStatus(userMessage.id, "failed")

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I apologize, but I'm having trouble processing that right now. Could you try again?",
        role: "assistant",
        timestamp: new Date(),
        status: "delivered",
      }

      setCurrentSession((prev) =>
        prev
          ? {
              ...prev,
              messages: [...prev.messages, errorMessage],
              updatedAt: new Date(),
            }
          : null,
      )
    } finally {
      setIsTyping(false)
    }
  }

  if (!currentSession) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (showPersonalitySelector) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <div className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50 p-4">
          <Button variant="outline" onClick={() => setShowPersonalitySelector(false)}>
            ← Back to Chat
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <PersonalitySelector currentPersonality={currentPersonality} onPersonalityChange={handlePersonalityChange} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 text-primary">🤖</div>
              <h1 className="text-lg font-semibold">AI Assistant</h1>
              <span className="text-sm text-muted-foreground">
                ({aiService.getPersonalities()[currentPersonality]?.name || "Assistant"})
              </span>
            </div>
            <ConnectionIndicator status={connectionStatus} />
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowPersonalitySelector(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Personality
            </Button>
            <Button variant="outline" size="sm" onClick={createNewChat}>
              <span className="h-4 w-4 mr-2">+</span>
              New Chat
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Welcome, {user?.name}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {currentSession.messages.map((message, index) => (
            <MessageBubble key={message.id} message={message} isLatest={index === currentSession.messages.length - 1} />
          ))}
          <EnhancedTypingIndicator isVisible={isTyping} />
          <div ref={messagesEndRef} />
        </div>
      </div>

      <ChatInput onSendMessage={handleSendMessage} disabled={isTyping || !connectionStatus.isConnected} />
    </div>
  )
}
