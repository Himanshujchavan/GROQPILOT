"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Bot, Send, User, Loader2, RefreshCw, AlertTriangle, Server } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"


type Message = {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

// Sample responses for fallback mode
const FALLBACK_RESPONSES = [
  "I'm currently in offline mode. I can still chat, but with limited capabilities.",
  "That's an interesting question! When I'm back online, I'll be able to give you a more detailed answer.",
  "I understand you need help with that. Let me provide some basic guidance while I'm offline.",
  "I'd love to help with that! Unfortunately, I'm in offline mode right now.",
  "Thanks for your message. I'm operating in fallback mode, but I'll do my best to assist you.",
]

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "Hello! I'm your AI assistant. How can I help you today?",
      role: "assistant",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [serverStatus, setServerStatus] = useState<"online" | "offline" | "checking">("checking")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const isMobile = useMobile()

  // Check server status on load
  useEffect(() => {
    checkServerStatus()
  }, [])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const checkServerStatus = async () => {
    setServerStatus("checking")
    try {
      // Simple check - try to fetch a static JSON file instead of a real API endpoint
      // This helps isolate if it's a server issue or an API implementation issue
      const response = await fetch("/api/health-check", {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(5000), // 5 second timeout
      })

      if (response.ok) {
        setServerStatus("online")
        console.log("Server is online")
      } else {
        console.warn("Server returned non-OK status:", response.status)
        setServerStatus("offline")
        toast({
          title: "Server Unavailable",
          description: "Using fallback mode with limited functionality.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Server check failed:", error)
      setServerStatus("offline")
      toast({
        title: "Connection Error",
        description: "Could not connect to AI server. Using fallback mode.",
        variant: "destructive",
      })
    }
  }

  const callFallbackApi = async (userMessage: string) => {
    try {
      const response = await fetch("/api/chat/fallback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
        }),
      })

      if (!response.ok) {
        throw new Error(`Fallback API returned ${response.status}`)
      }

      const data = await response.json()
      return data.response || "I'm currently in offline mode with limited functionality."
    } catch (error) {
      console.error("Fallback API error:", error)
      return getFallbackResponse()
    }
  }

  // Get a random fallback response
  const getFallbackResponse = () => {
    const randomIndex = Math.floor(Math.random() * FALLBACK_RESPONSES.length)
    return FALLBACK_RESPONSES[randomIndex]
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    // Generate a unique ID for the message
    const userMessageId = Date.now().toString()

    // Add user message to chat
    const userMessage: Message = {
      id: userMessageId,
      content: inputValue,
      role: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsProcessing(true)

    try {
      if (serverStatus === "online") {
        try {
          // Try to use the OpenAI integration directly from the client
          // This is a fallback approach that doesn't require a server
          // Send to backend API
          const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message: inputValue,
              history: messages.slice(-5).map((msg) => ({
                role: msg.role,
                content: msg.content,
              })),
            }),
          })

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            console.error("API error:", response.status, errorData)
            throw new Error(`Server returned ${response.status}: ${errorData.error || "Unknown error"}`)
          }

          const data = await response.json()

          // Add AI response to chat
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              content: data.response || "I received your message but couldn't generate a proper response.",
              role: "assistant",
              timestamp: new Date(),
            },
          ])
        } catch (apiError) {
          console.error("API call failed:", apiError)
          // If API call fails, switch to offline mode
          setServerStatus("offline")
          throw apiError
        }
      } else {
        // We're in offline mode, use fallback
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Generate a simple response based on the input
        let fallbackResponse = getFallbackResponse()

        // Add some context based on the user's message
        if (inputValue.toLowerCase().includes("hello") || inputValue.toLowerCase().includes("hi")) {
          fallbackResponse = "Hello there! I'm currently in offline mode, but I'm still here to chat."
        } else if (inputValue.toLowerCase().includes("help")) {
          fallbackResponse =
            "I'd like to help! When I'm back online, I'll have access to more information to assist you better."
        }

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            content: fallbackResponse,
            role: "assistant",
            timestamp: new Date(),
          },
        ])
      }
    } catch (error) {
      console.error("Error processing message:", error)

      // Try to use the fallback API
      const fallbackResponse = await callFallbackApi(inputValue)

      // Add fallback response to chat
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: fallbackResponse,
          role: "assistant",
          timestamp: new Date(),
        },
      ])

      // Switch to offline mode
      setServerStatus("offline")

      toast({
        title: "Using Fallback Mode",
        description: "Connected to local AI service with limited capabilities.",
        variant: "default",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const startServer = () => {
    toast({
      title: "Starting Server",
      description: "Attempting to start the AI server...",
    })

    // In a real implementation, this would trigger the server to start
    // For now, we'll just simulate it with a timeout
    setTimeout(() => {
      checkServerStatus()
    }, 2000)
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <Card className="glass-card border-none shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-purple-500 to-blue-500 dark:from-purple-600 dark:to-blue-600 text-white rounded-t-lg">
          <CardTitle className="text-2xl flex items-center gap-2">
            <Bot className="h-6 w-6" />
            AI Chat Assistant
          </CardTitle>
          <CardDescription className="text-white/80">Ask me anything and I'll do my best to help you</CardDescription>
        </CardHeader>

        <div className="relative">
          {serverStatus === "offline" && (
            <Alert className="m-4 border-amber-300 bg-amber-50 dark:bg-amber-900/20">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-300" />
              <AlertTitle className="text-amber-600 dark:text-amber-300">Limited Functionality</AlertTitle>
              <AlertDescription className="text-amber-600/80 dark:text-amber-300/80 flex flex-wrap items-center gap-2">
                <span>Server connection unavailable. Using fallback mode with limited capabilities.</span>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs border-amber-300 text-amber-600 dark:text-amber-300"
                    onClick={checkServerStatus}
                  >
                    <RefreshCw className="mr-1 h-3 w-3" />
                    Retry
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs border-amber-300 text-amber-600 dark:text-amber-300"
                    onClick={startServer}
                  >
                    <Server className="mr-1 h-3 w-3" />
                    Start Server
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <CardContent className="p-4 h-[60vh] overflow-y-auto">
            <div className="space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={cn("flex items-start gap-3", message.role === "user" ? "justify-end" : "justify-start")}
                >
                  {message.role === "assistant" && (
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarImage src="/placeholder.svg" alt="AI" />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div
                    className={cn(
                      "rounded-lg p-3 max-w-[80%]",
                      message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted dark:bg-slate-800",
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs opacity-50 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>

                  {message.role === "user" && (
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarImage src="/placeholder.svg" alt="User" />
                      <AvatarFallback className="bg-accent text-accent-foreground">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </motion.div>
              ))}

              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3"
                >
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarImage src="/placeholder.svg" alt="AI" />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="rounded-lg p-3 bg-muted dark:bg-slate-800 flex items-center space-x-2">
                    <div className="typing-dot animate-bounce h-2 w-2 rounded-full bg-gray-500 dark:bg-gray-400"></div>
                    <div className="typing-dot animate-bounce h-2 w-2 rounded-full bg-gray-500 dark:bg-gray-400 [animation-delay:0.2s]"></div>
                    <div className="typing-dot animate-bounce h-2 w-2 rounded-full bg-gray-500 dark:bg-gray-400 [animation-delay:0.4s]"></div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </CardContent>
        </div>

        <CardFooter className="p-4 border-t bg-muted/50">
          <div className="flex w-full items-center space-x-2">
            <Input
              placeholder="Type your message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              disabled={isProcessing}
              className="border-2 focus:border-primary"
            />
            <Button
              onClick={handleSendMessage}
              disabled={isProcessing || !inputValue.trim()}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
            >
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              <span className={cn("ml-2", isMobile ? "sr-only" : "")}>Send</span>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
