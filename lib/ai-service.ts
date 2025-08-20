import type { Message } from "@/types/chat"

interface AIPersonality {
  name: string
  description: string
  systemPrompt: string
  responseStyle: string
  icon: string
}

const AI_PERSONALITIES: Record<string, AIPersonality> = {
  professional: {
    name: "Professional Assistant",
    description: "Expert business and productivity assistant",
    systemPrompt:
      "You are a professional AI assistant focused on business productivity, strategic thinking, and professional development. Provide clear, actionable, and business-oriented responses.",
    responseStyle: "professional",
    icon: "💼",
  },
  creative: {
    name: "Creative Strategist",
    description: "Innovation and creative problem-solving specialist",
    systemPrompt:
      "You are a creative strategist AI assistant. Help with innovative thinking, creative problem-solving, brainstorming, and out-of-the-box solutions for business and personal challenges.",
    responseStyle: "creative",
    icon: "🎨",
  },
  analytical: {
    name: "Data Analyst",
    description: "Logical analysis and research specialist",
    systemPrompt:
      "You are an analytical AI assistant specializing in data analysis, logical reasoning, research, and systematic problem-solving. Provide structured, evidence-based, and detailed responses.",
    responseStyle: "analytical",
    icon: "📊",
  },
}

interface ConversationContext {
  messages: Message[]
  userPreferences: {
    personality: keyof typeof AI_PERSONALITIES
    responseLength: "short" | "medium" | "long"
    topics: string[]
  }
  sessionMetrics: {
    messageCount: number
    topicsDiscussed: string[]
    averageResponseTime: number
  }
}

const TOPIC_KEYWORDS = {
  "business-strategy": ["strategy", "planning", "goals", "objectives", "growth", "market", "competition", "revenue"],
  "project-management": ["project", "timeline", "deadline", "milestone", "task", "team", "collaboration", "workflow"],
  leadership: ["leadership", "management", "team", "motivation", "communication", "delegation", "decision"],
  technology: ["tech", "software", "digital", "automation", "ai", "data", "cloud", "security", "innovation"],
  finance: ["budget", "cost", "investment", "roi", "profit", "expense", "financial", "accounting", "pricing"],
  marketing: ["marketing", "brand", "customer", "audience", "campaign", "content", "social media", "seo"],
  productivity: ["productivity", "efficiency", "time management", "organization", "workflow", "optimization"],
  career: ["career", "job", "interview", "resume", "skills", "development", "promotion", "networking"],
  innovation: ["innovation", "creative", "idea", "brainstorm", "solution", "design thinking", "prototype"],
  analytics: ["data", "analysis", "metrics", "kpi", "report", "dashboard", "insights", "trends", "statistics"],
}

export class AIService {
  private personality: keyof typeof AI_PERSONALITIES = "professional"
  private conversationHistory: Message[] = []
  private userTopics: string[] = []
  private sessionStartTime: number = Date.now()
  private responseCount = 0

  setPersonality(personality: keyof typeof AI_PERSONALITIES) {
    this.personality = personality
  }

  updateConversationHistory(messages: Message[]) {
    this.conversationHistory = messages.slice(-15) // Keep last 15 messages for better context
  }

  private extractTopics(message: string): string[] {
    const topics: string[] = []
    const lowerMessage = message.toLowerCase()

    for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
      if (keywords.some((keyword) => lowerMessage.includes(keyword))) {
        topics.push(topic)
      }
    }

    // Update user topics for personalization
    topics.forEach((topic) => {
      if (!this.userTopics.includes(topic)) {
        this.userTopics.push(topic)
      }
    })

    return topics
  }

  private getContextualPrompt(userMessage: string, context: ConversationContext): string {
    const personality = AI_PERSONALITIES[this.personality]
    const recentMessages = context.messages.slice(-5)
    const topics = this.extractTopics(userMessage)
    const sessionDuration = Math.floor((Date.now() - this.sessionStartTime) / 60000) // minutes

    let prompt = `${personality.systemPrompt}\n\n`

    // Add session context
    if (sessionDuration > 5) {
      prompt += `Session context: We've been chatting for ${sessionDuration} minutes. `
    }

    if (this.userTopics.length > 0) {
      prompt += `User's interests: ${this.userTopics.slice(-5).join(", ")}\n`
    }

    // Add conversation history
    if (recentMessages.length > 1) {
      prompt += "\nRecent conversation:\n"
      recentMessages.forEach((msg, index) => {
        if (msg.role !== "assistant" || !msg.isTyping) {
          prompt += `${msg.role}: ${msg.content.substring(0, 100)}${msg.content.length > 100 ? "..." : ""}\n`
        }
      })
    }

    // Add current context
    if (topics.length > 0) {
      prompt += `\nCurrent topic focus: ${topics.join(", ")}\n`
    }

    prompt += `\nUser message: "${userMessage}"\n\n`
    prompt += `Respond as a ${personality.name} in a ${personality.responseStyle} manner. Be helpful, engaging, and professional.`

    return prompt
  }

  private generateResponsePatterns(userMessage: string, topics: string[]): string[] {
    const patterns: string[] = []

    // Professional greetings
    if (/^(hi|hello|hey|good morning|good afternoon|good evening)/i.test(userMessage)) {
      patterns.push(
        "Good to see you! I'm ready to assist with your professional needs today. What can I help you accomplish?",
        "Hello! I'm here to support your business objectives and productivity goals. What's on your agenda?",
        "Welcome back! Let's tackle your challenges and opportunities together. What would you like to focus on?",
      )
    }

    // Business-focused question patterns
    if (userMessage.includes("?")) {
      patterns.push(
        "That's an excellent strategic question. Let me provide you with a comprehensive analysis...",
        "Great question! I'll break this down into actionable insights for you...",
        "Interesting challenge! Here's my professional assessment and recommendations...",
      )
    }

    // Problem-solving patterns
    if (/help|problem|issue|challenge|stuck|difficult/i.test(userMessage)) {
      patterns.push(
        "I understand the challenge you're facing. Let's develop a strategic approach to resolve this...",
        "Every challenge is an opportunity for growth. Here's how I recommend we tackle this systematically...",
        "Let's work through this together with a structured problem-solving approach...",
      )
    }

    // Topic-specific professional patterns
    if (topics.includes("business-strategy")) {
      patterns.push(
        "Strategic thinking is crucial for success. Here's my analysis of your situation...",
        "From a strategic perspective, let's examine the key factors and opportunities...",
      )
    }

    if (topics.includes("leadership")) {
      patterns.push(
        "Leadership excellence requires both vision and execution. Here's what I recommend...",
        "Effective leadership is about empowering others while driving results. Consider this approach...",
      )
    }

    if (topics.includes("productivity")) {
      patterns.push(
        "Productivity optimization is key to professional success. Here's how to enhance your efficiency...",
        "Let's streamline your workflow and maximize your impact. Here's my recommendation...",
      )
    }

    // Default professional patterns
    patterns.push(
      "I appreciate you bringing this to my attention. Here's my professional assessment...",
      "That's a valuable point to consider. Let me share some strategic insights...",
      "Thank you for the opportunity to assist. Here's how I can help you succeed...",
    )

    return patterns
  }

  private generateDetailedResponse(userMessage: string, context: ConversationContext): string {
    const topics = this.extractTopics(userMessage)
    const patterns = this.generateResponsePatterns(userMessage, topics)
    const selectedPattern = patterns[Math.floor(Math.random() * Math.min(3, patterns.length))]
    const personality = AI_PERSONALITIES[this.personality]

    let response = selectedPattern

    // Add personality-specific professional content
    if (this.personality === "analytical") {
      response += "\n\n**Analysis Framework:**\n"
      response += "• **Current Situation**: Let me assess the key factors at play\n"
      response += "• **Data Points**: Here are the relevant metrics and insights\n"
      response += "• **Recommendations**: Based on the analysis, here's what I suggest\n"
      response += "• **Next Steps**: Actionable items to move forward\n\n"
    } else if (this.personality === "creative") {
      response += "\n\n**Creative Approach:**\n"
      response += "Let's think outside the box and explore innovative solutions. "
      response += "Sometimes the best breakthroughs come from unconventional thinking.\n\n"
    } else {
      response += "\n\n**Professional Guidance:**\n"
    }

    // Add topic-specific business insights
    if (topics.includes("business-strategy")) {
      response += "Strategic success requires clear vision, market understanding, and execution excellence. "
    } else if (topics.includes("leadership")) {
      response += "Effective leadership combines emotional intelligence with strategic decision-making. "
    } else if (topics.includes("productivity")) {
      response += "Peak productivity comes from optimizing both systems and mindset. "
    } else if (topics.includes("technology")) {
      response += "Technology should enhance human capability and drive business value. "
    }

    // Add contextual follow-up
    const recentUserMessages = context.messages.filter((m) => m.role === "user").slice(-2)
    if (recentUserMessages.length > 1) {
      response += "\n\nBuilding on our previous discussion, "
    }

    response += "I'm here to support your continued success. What specific aspect would you like to dive deeper into?"

    return response
  }

  async generateResponse(userMessage: string, conversationHistory: Message[]): Promise<string> {
    // Simulate realistic AI processing time
    await new Promise((resolve) => setTimeout(resolve, 1200 + Math.random() * 1800))

    const context: ConversationContext = {
      messages: conversationHistory,
      userPreferences: {
        personality: this.personality,
        responseLength: "medium",
        topics: this.userTopics,
      },
      sessionMetrics: {
        messageCount: conversationHistory.length,
        topicsDiscussed: this.userTopics,
        averageResponseTime: 2000,
      },
    }

    this.updateConversationHistory(conversationHistory)
    this.responseCount++

    // Enhanced command handling
    if (userMessage.toLowerCase().startsWith("/personality")) {
      const requestedPersonality = userMessage.toLowerCase().replace("/personality ", "").trim()
      if (requestedPersonality in AI_PERSONALITIES) {
        this.setPersonality(requestedPersonality as keyof typeof AI_PERSONALITIES)
        const personality = AI_PERSONALITIES[requestedPersonality as keyof typeof AI_PERSONALITIES]
        return `${personality.icon} **Switched to ${personality.name}**\n\n${personality.description}\n\nI'm now optimized for ${personality.responseStyle} assistance. How can I help you achieve your goals?`
      } else {
        return `**Available AI Personalities:**\n\n${Object.entries(AI_PERSONALITIES)
          .map(([key, p]) => `${p.icon} **${key}**: ${p.description}`)
          .join("\n\n")}\n\nUse "/personality [name]" to switch modes.`
      }
    }

    if (userMessage.toLowerCase() === "/help") {
      return `# 🤖 AI Assistant Pro - Help Guide

## **Personalities**
${Object.entries(AI_PERSONALITIES)
  .map(([key, p]) => `${p.icon} **/${key}**: ${p.description}`)
  .join("\n")}

## **Commands**
• **/personality [name]** - Switch AI personality
• **/help** - Show this help guide
• **/stats** - View session statistics

## **Capabilities**
✅ **Business Strategy** - Strategic planning and analysis
✅ **Project Management** - Workflow optimization
✅ **Leadership** - Management and team guidance  
✅ **Technology** - Digital transformation insights
✅ **Productivity** - Efficiency enhancement
✅ **Analytics** - Data-driven decision making

Ready to boost your professional success! What challenge shall we tackle?`
    }

    if (userMessage.toLowerCase() === "/stats") {
      const sessionDuration = Math.floor((Date.now() - this.sessionStartTime) / 60000)
      return `# 📊 Session Statistics

**Current Session:**
• Duration: ${sessionDuration} minutes
• Messages exchanged: ${conversationHistory.length}
• Active personality: ${AI_PERSONALITIES[this.personality].name}

**Topics Discussed:**
${this.userTopics.length > 0 ? this.userTopics.map((topic) => `• ${topic.replace("-", " ")}`).join("\n") : "• No specific topics identified yet"}

**Productivity Tip:** Regular breaks and focused sessions lead to better outcomes!`
    }

    // Generate enhanced contextual response
    try {
      return this.generateDetailedResponse(userMessage, context)
    } catch (error) {
      console.error("Error generating AI response:", error)
      return "I apologize for the technical difficulty. As your professional AI assistant, I'm committed to providing reliable service. Please try rephrasing your request, and I'll be happy to assist you."
    }
  }

  getPersonalities() {
    return AI_PERSONALITIES
  }

  getCurrentPersonality() {
    return this.personality
  }

  getSessionAnalytics() {
    return {
      duration: Math.floor((Date.now() - this.sessionStartTime) / 60000),
      responseCount: this.responseCount,
      topicsDiscussed: this.userTopics,
      currentPersonality: this.personality,
    }
  }
}

export const aiService = new AIService()
