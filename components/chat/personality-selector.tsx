"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { aiService } from "@/lib/ai-service"
import { Brain, Lightbulb, BarChart3 } from "lucide-react"

interface PersonalitySelectorProps {
  currentPersonality: string
  onPersonalityChange: (personality: string) => void
}

export function PersonalitySelector({ currentPersonality, onPersonalityChange }: PersonalitySelectorProps) {
  const personalities = aiService.getPersonalities()

  const getIcon = (personality: string) => {
    switch (personality) {
      case "helpful":
        return <Brain className="h-5 w-5" />
      case "creative":
        return <Lightbulb className="h-5 w-5" />
      case "analytical":
        return <BarChart3 className="h-5 w-5" />
      default:
        return <Brain className="h-5 w-5" />
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Personality
        </CardTitle>
        <CardDescription>Choose how your AI assistant responds to you</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {Object.entries(personalities).map(([key, personality]) => (
            <div
              key={key}
              className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                currentPersonality === key ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
              }`}
              onClick={() => onPersonalityChange(key)}
            >
              <div className="flex items-center gap-3">
                {getIcon(key)}
                <div>
                  <div className="font-medium">{personality.name}</div>
                  <div className="text-sm text-muted-foreground">{personality.description}</div>
                </div>
              </div>
              {currentPersonality === key && <Badge variant="default">Active</Badge>}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
