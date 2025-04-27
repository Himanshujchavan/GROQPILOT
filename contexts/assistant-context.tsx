"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { toast } from "@/components/ui/use-toast"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

type AssistantContextType = {
  isListening: boolean
  setIsListening: (isListening: boolean) => void
  assistantName: string
  setAssistantName: (name: string) => void
  recentActions: {
    id: number
    action: string
    time: string
  }[]
  addAction: (action: string) => void
  clearActions: () => void
  isFloatingAssistantOpen: boolean
  setFloatingAssistantOpen: (isOpen: boolean) => void
  messages: Message[]
  addMessage: (message: Omit<Message, "id" | "timestamp">) => void
  clearMessages: () => void
  processCommand: (command: string) => Promise<void>
  isProcessing: boolean
}

const AssistantContext = createContext<AssistantContextType | undefined>(undefined)

// Define SpeechRecognition and SpeechRecognitionEvent types
declare global {
  interface Window {
    SpeechRecognition: any // Allows any type
    webkitSpeechRecognition: any
  }
  interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList
  }

  interface SpeechRecognitionResultList {
    [index: number]: SpeechRecognitionResult
  }

  interface SpeechRecognitionResult {
    [index: number]: SpeechRecognitionAlternative
    isFinal: boolean
  }

  interface SpeechRecognitionAlternative {
    transcript: string
    confidence: number
  }
}

export function AssistantProvider({ children }: { children: React.ReactNode }) {
  const [isListening, setIsListening] = useState(false)
  const [assistantName, setAssistantName] = useState("AI Assistant")
  const [recentActions, setRecentActions] = useState([
    { id: 1, action: "Summarized quarterly report", time: "10 minutes ago" },
    { id: 2, action: "Checked calendar for today", time: "25 minutes ago" },
    { id: 3, action: "Replied to 3 emails", time: "1 hour ago" },
    { id: 4, action: "Created meeting notes", time: "2 hours ago" },
    { id: 5, action: "Scheduled team meeting", time: "Yesterday" },
  ])
  const [isFloatingAssistantOpen, setFloatingAssistantOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm your AI assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ])
  const [isProcessing, setIsProcessing] = useState(false)

  const addAction = (action: string) => {
    const newAction = {
      id: Date.now(),
      action,
      time: "Just now",
    }
    setRecentActions((prev) => [newAction, ...prev.slice(0, 4)])
  }

  const clearActions = () => {
    setRecentActions([])
  }

  const addMessage = (message: Omit<Message, "id" | "timestamp">) => {
    const newMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, newMessage])
  }

  const clearMessages = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "Hello! I'm your AI assistant. How can I help you today?",
        timestamp: new Date(),
      },
    ])
  }

  // Simulate AI processing of commands
  const processCommand = async (command: string) => {
    if (!command.trim()) return

    setIsProcessing(true)
    addMessage({ role: "user", content: command })
    addAction(`Sent command: ${command}`)

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Generate a response based on the command
    let response = ""

    if (command.toLowerCase().includes("schedule") || command.toLowerCase().includes("meeting")) {
      response = "I've scheduled that for you. Would you like me to send calendar invites to the participants?"

      // Save to localStorage
      try {
        const events = JSON.parse(localStorage.getItem("events") || "[]")
        events.push({
          id: Date.now(),
          title: command.includes("meeting") ? "Meeting" : "Scheduled Event",
          date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
          description: command,
        })
        localStorage.setItem("events", JSON.stringify(events))
      } catch (error) {
        console.error("Error saving event:", error)
      }
    } else if (command.toLowerCase().includes("email") || command.toLowerCase().includes("message")) {
      response = "I've drafted an email based on your request. Would you like me to review it before sending?"

      // Save to localStorage
      try {
        const emails = JSON.parse(localStorage.getItem("emails") || "[]")
        emails.push({
          id: Date.now(),
          subject: "Draft: " + command.substring(0, 30) + "...",
          preview: "This is an auto-generated draft based on your request.",
          time: "Just now",
          unread: false,
          important: true,
        })
        localStorage.setItem("emails", JSON.stringify(emails))
      } catch (error) {
        console.error("Error saving email:", error)
      }
    } else if (command.toLowerCase().includes("summarize") || command.toLowerCase().includes("summary")) {
      response =
        "I've analyzed the document and created a summary. The key points are: increased revenue by 15%, new client acquisition up 22%, and operating costs reduced by 8%."
    } else if (command.toLowerCase().includes("translate")) {
      response = "I've translated the document for you. Would you like me to save it or email it to someone?"
    } else if (command.toLowerCase().includes("calendar") || command.toLowerCase().includes("schedule")) {
      response =
        "You have 3 meetings today: Team standup at 10 AM, Client presentation at 2 PM, and Project review at 4 PM."
    } else if (command.toLowerCase().includes("weather")) {
      response = "The current weather is 72°F and sunny. The forecast shows clear skies for the rest of the day."
    } else if (command.toLowerCase().includes("remind") || command.toLowerCase().includes("reminder")) {
      response = "I've set a reminder for you. I'll notify you at the specified time."

      // Save to localStorage
      try {
        const reminders = JSON.parse(localStorage.getItem("reminders") || "[]")
        reminders.push({
          id: Date.now(),
          text: command.replace(/remind me to |remind me about |reminder |set a reminder /i, ""),
          time: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
        })
        localStorage.setItem("reminders", JSON.stringify(reminders))

        // Show a toast
        toast({
          title: "Reminder set",
          description: "I'll remind you in 1 hour.",
        })
      } catch (error) {
        console.error("Error saving reminder:", error)
      }
    } else if (command.toLowerCase().includes("search") || command.toLowerCase().includes("find")) {
      response = "Here are the search results based on your query. Would you like me to refine the search?"
    } else if (command.toLowerCase().includes("automate") || command.toLowerCase().includes("automation")) {
      // Handle automation-specific commands
      if (command.toLowerCase().includes("email") || command.toLowerCase().includes("mail")) {
        response = "I've created a new email automation rule based on your request. Would you like to review it?"
        addAction("Created new email automation rule")
      } else if (command.toLowerCase().includes("task") || command.toLowerCase().includes("todo")) {
        response =
          "I've set up task automation as requested. Tasks will be created automatically based on your criteria."
        addAction("Created new task automation rule")
      } else if (command.toLowerCase().includes("file") || command.toLowerCase().includes("document")) {
        response = "I've created a file organization automation. Your files will be organized automatically."
        addAction("Created new file automation rule")
      } else if (command.toLowerCase().includes("calendar") || command.toLowerCase().includes("meeting")) {
        response = "I've set up calendar automation. Meeting follow-ups will be handled automatically."
        addAction("Created new calendar automation rule")
      } else if (command.toLowerCase().includes("workflow") || command.toLowerCase().includes("custom")) {
        response =
          "I've created a custom workflow automation based on your specifications. You can review and edit it in the Automation Hub."
        addAction("Created new custom workflow")
      } else {
        response =
          "I can help you automate various tasks. Would you like to set up email, task, file, or calendar automation?"
      }
    } else if (command.toLowerCase().includes("classify") || command.toLowerCase().includes("categorize")) {
      if (command.toLowerCase().includes("email") || command.toLowerCase().includes("mail")) {
        response =
          "I've set up email classification. Your emails will be automatically categorized based on content and sender."
        addAction("Set up email classification")
      } else if (command.toLowerCase().includes("file") || command.toLowerCase().includes("document")) {
        response =
          "I've set up document classification. Your files will be automatically categorized based on content and type."
        addAction("Set up document classification")
      } else {
        response = "I can help you classify emails, documents, or other content. What would you like to categorize?"
      }
    } else if (command.toLowerCase().includes("extract") || command.toLowerCase().includes("data entry")) {
      response = "I've set up automated data extraction. I'll extract key information from your documents and emails."
      addAction("Set up data extraction automation")
    } else {
      response = "I've processed your request. Is there anything else you'd like me to help with?"
    }

    addMessage({ role: "assistant", content: response })
    setIsProcessing(false)

    // Save conversation to localStorage
    try {
      const conversations = JSON.parse(localStorage.getItem("conversations") || "[]")
      conversations.push({
        id: Date.now(),
        command: command,
        response: response,
        timestamp: new Date().toISOString(),
      })
      localStorage.setItem("conversations", JSON.stringify(conversations))
    } catch (error) {
      console.error("Error saving conversation:", error)
    }
  }

  // Voice recognition effect
  useEffect(() => {
    if (!isListening) return

    let recognition: any | null = null

    try {
      // @ts-ignore - SpeechRecognition is not in the TypeScript types
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = false

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = event.results[0][0].transcript
          processCommand(transcript)
          setIsListening(false)
        }

        recognition.onerror = () => {
          setIsListening(false)
        }

        recognition.onend = () => {
          setIsListening(false)
        }

        recognition.start()
      }
    } catch (error) {
      console.error("Speech recognition error:", error)
      setIsListening(false)
    }

    return () => {
      if (recognition) {
        recognition.stop()
      }
    }
  }, [isListening])

  return (
    <AssistantContext.Provider
      value={{
        isListening,
        setIsListening,
        assistantName,
        setAssistantName,
        recentActions,
        addAction,
        clearActions,
        isFloatingAssistantOpen,
        setFloatingAssistantOpen,
        messages,
        addMessage,
        clearMessages,
        processCommand,
        isProcessing,
      }}
    >
      {children}
    </AssistantContext.Provider>
  )
}

export function useAssistant() {
  const context = useContext(AssistantContext)
  if (context === undefined) {
    throw new Error("useAssistant must be used within an AssistantProvider")
  }
  return context
}
