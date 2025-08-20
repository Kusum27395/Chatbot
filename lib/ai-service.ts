import type { Message } from "@/types/chat"

interface AIPersonality {
  name: string
  description: string
  systemPrompt: string
  responseStyle: string
}

const AI_PERSONALITIES: Record<string, AIPersonality> = {
  helpful: {
    name: "Helpful Assistant",
    description: "A friendly and knowledgeable assistant",
    systemPrompt:
      "You are a helpful, friendly, and knowledgeable AI assistant. Provide clear, accurate, and useful responses.",
    responseStyle: "helpful",
  },
  creative: {
    name: "Creative Companion",
    description: "An imaginative and artistic assistant",
    systemPrompt:
      "You are a creative and imaginative AI assistant. Help with brainstorming, creative writing, and artistic endeavors.",
    responseStyle: "creative",
  },
  analytical: {
    name: "Analytical Expert",
    description: "A logical and detail-oriented assistant",
    systemPrompt:
      "You are an analytical and logical AI assistant. Provide structured, detailed, and well-reasoned responses.",
    responseStyle: "analytical",
  },
}

interface ConversationContext {
  messages: Message[]
  userPreferences: {
    personality: keyof typeof AI_PERSONALITIES
    responseLength: "short" | "medium" | "long"
    topics: string[]
  }
}

export class AIService {
  private personality: keyof typeof AI_PERSONALITIES = "helpful"
  private conversationHistory: Message[] = []
  private userTopics: string[] = []

  setPersonality(personality: keyof typeof AI_PERSONALITIES) {
    this.personality = personality
  }

  updateConversationHistory(messages: Message[]) {
    this.conversationHistory = messages.slice(-10) // Keep last 10 messages for context
  }

  private extractTopics(message: string): string[] {
    const topics: string[] = []
    const topicKeywords = {
      technology: ["tech", "computer", "software", "programming", "code", "ai", "machine learning"],
      science: ["science", "research", "experiment", "theory", "physics", "chemistry", "biology"],
      business: ["business", "marketing", "sales", "strategy", "company", "startup", "entrepreneur"],
      health: ["health", "fitness", "exercise", "diet", "wellness", "medical", "doctor"],
      education: ["learn", "study", "school", "university", "education", "teaching", "course"],
      creativity: ["art", "design", "creative", "writing", "music", "painting", "drawing"],
      lifestyle: ["travel", "food", "cooking", "hobby", "entertainment", "movie", "book"],
    }

    const lowerMessage = message.toLowerCase()
    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      if (keywords.some((keyword) => lowerMessage.includes(keyword))) {
        topics.push(topic)
      }
    }

    return topics
  }

  private getContextualPrompt(userMessage: string, context: ConversationContext): string {
    const personality = AI_PERSONALITIES[this.personality]
    const recentMessages = context.messages.slice(-3)
    const topics = this.extractTopics(userMessage)

    let prompt = `${personality.systemPrompt}\n\n`

    if (recentMessages.length > 1) {
      prompt += "Recent conversation context:\n"
      recentMessages.forEach((msg) => {
        if (msg.role !== "assistant" || !msg.isTyping) {
          prompt += `${msg.role}: ${msg.content}\n`
        }
      })
      prompt += "\n"
    }

    if (topics.length > 0) {
      prompt += `The user seems interested in: ${topics.join(", ")}\n\n`
    }

    prompt += `Current user message: "${userMessage}"\n\n`
    prompt += `Respond in a ${personality.responseStyle} manner. Keep the response conversational and engaging.`

    return prompt
  }

  private generateResponsePatterns(userMessage: string, topics: string[]): string[] {
    const patterns: string[] = []

    // Greeting patterns
    if (/^(hi|hello|hey|good morning|good afternoon|good evening)/i.test(userMessage)) {
      patterns.push(
        "Hello! I'm excited to chat with you today. What's on your mind?",
        "Hi there! I'm here and ready to help. What would you like to explore together?",
        "Hey! Great to see you. What interesting topic shall we dive into?",
      )
    }

    // Question patterns
    if (userMessage.includes("?")) {
      patterns.push(
        "That's a fascinating question! Let me share my thoughts on this...",
        "Great question! I think there are several ways to approach this...",
        "Interesting inquiry! Based on what I understand, here's my perspective...",
      )
    }

    // Problem-solving patterns
    if (/help|problem|issue|stuck|difficult/i.test(userMessage)) {
      patterns.push(
        "I can definitely help you work through this. Let's break it down step by step...",
        "I understand you're facing a challenge. Here's how I'd approach this situation...",
        "Let me help you tackle this problem. First, let's consider the key factors...",
      )
    }

    // Topic-specific patterns
    if (topics.includes("technology")) {
      patterns.push(
        "Technology is such an exciting field! Here's what I think about this...",
        "That's a great tech-related question. From my understanding...",
      )
    }

    if (topics.includes("creativity")) {
      patterns.push(
        "I love creative discussions! Here's an idea to consider...",
        "Creativity is all about exploring possibilities. What if we tried...",
      )
    }

    // Default patterns
    patterns.push(
      "That's really interesting! Here's my take on what you've shared...",
      "I appreciate you bringing this up. Let me offer some thoughts...",
      "Thanks for sharing that with me. Here's what comes to mind...",
    )

    return patterns
  }

  private generateDetailedResponse(userMessage: string, context: ConversationContext): string {
    const topics = this.extractTopics(userMessage)
    const patterns = this.generateResponsePatterns(userMessage, topics)
    const selectedPattern = patterns[Math.floor(Math.random() * patterns.length)]

    // Generate content based on personality and topics
    const personality = AI_PERSONALITIES[this.personality]
    let response = selectedPattern

    // Add personality-specific content
    if (this.personality === "analytical") {
      response += " Let me analyze this systematically:\n\n"
      response += "1. First, we should consider the core elements of your question\n"
      response += "2. Then, we can examine the potential approaches\n"
      response += "3. Finally, we'll evaluate the best path forward\n\n"
    } else if (this.personality === "creative") {
      response += " You know what? This reminds me of an interesting creative approach...\n\n"
      response += "Imagine if we looked at this from a completely different angle. "
    } else {
      response += "\n\n"
    }

    // Add topic-specific insights
    if (topics.includes("technology")) {
      response += "In the tech world, this kind of challenge often requires balancing innovation with practicality. "
    } else if (topics.includes("business")) {
      response += "From a business perspective, it's important to consider both short-term and long-term implications. "
    } else if (topics.includes("creativity")) {
      response += "Creative endeavors often benefit from embracing experimentation and iteration. "
    }

    // Add contextual follow-up based on conversation history
    const recentUserMessages = context.messages.filter((m) => m.role === "user").slice(-2)
    if (recentUserMessages.length > 1) {
      response += "\n\nBuilding on what we discussed earlier, "
    }

    response += "What aspects of this would you like to explore further?"

    return response
  }

  async generateResponse(userMessage: string, conversationHistory: Message[]): Promise<string> {
    // Simulate AI processing time
    await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 2000))

    const context: ConversationContext = {
      messages: conversationHistory,
      userPreferences: {
        personality: this.personality,
        responseLength: "medium",
        topics: this.userTopics,
      },
    }

    this.updateConversationHistory(conversationHistory)

    // Handle special commands
    if (userMessage.toLowerCase().startsWith("/personality")) {
      const requestedPersonality = userMessage.toLowerCase().replace("/personality ", "").trim()
      if (requestedPersonality in AI_PERSONALITIES) {
        this.setPersonality(requestedPersonality as keyof typeof AI_PERSONALITIES)
        return `I've switched to ${AI_PERSONALITIES[requestedPersonality as keyof typeof AI_PERSONALITIES].name} mode! ${AI_PERSONALITIES[requestedPersonality as keyof typeof AI_PERSONALITIES].description}. How can I help you now?`
      } else {
        return `Available personalities: ${Object.keys(AI_PERSONALITIES).join(", ")}. Use "/personality [name]" to switch.`
      }
    }

    if (userMessage.toLowerCase() === "/help") {
      return `I'm your AI assistant! Here's what I can do:

🤖 **Personalities**: Use "/personality helpful", "/personality creative", or "/personality analytical" to change my response style

💬 **Conversation**: I remember our recent chat history to provide better context

🧠 **Topics**: I can discuss technology, science, business, health, education, creativity, and lifestyle

✨ **Features**: I provide thoughtful, contextual responses based on our conversation

What would you like to chat about?`
    }

    // Generate contextual response
    try {
      return this.generateDetailedResponse(userMessage, context)
    } catch (error) {
      console.error("Error generating AI response:", error)
      return "I apologize, but I'm having trouble processing that right now. Could you try rephrasing your message?"
    }
  }

  getPersonalities() {
    return AI_PERSONALITIES
  }

  getCurrentPersonality() {
    return this.personality
  }
}

export const aiService = new AIService()
