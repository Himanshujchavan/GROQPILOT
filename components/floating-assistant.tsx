"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, X, Send, MessageSquare, User, Bot, Laptop } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useAssistant } from "@/contexts/assistant-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "@/components/ui/use-toast"

export function FloatingAssistant() {
  const {
    isListening,
    setIsListening,
    isFloatingAssistantOpen,
    setFloatingAssistantOpen,
    addAction,
    messages,
    addMessage,
    processCommand,
    isProcessing,
  } = useAssistant()

  const [inputValue, setInputValue] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const suggestions = [
    "Summarize my emails",
    "Find recent customer interactions in CRM",
    "Search for quarterly reports",
    "Open Gmail in browser",
  ]

  const handleSuggestionClick = (suggestion: string) => {
    toast({
      title: "Processing command",
      description: `"${suggestion}"`,
    })

    processCommand(suggestion)
  }

  const handleSendCommand = () => {
    if (inputValue.trim()) {
      toast({
        title: "Processing command",
        description: `"${inputValue}"`,
      })

      processCommand(inputValue)
      setInputValue("")
    }
  }

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // Update the styling for a more modern look
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isFloatingAssistantOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
            className="absolute bottom-16 right-0 w-[90vw] max-w-[350px] glass-card rounded-lg shadow-xl overflow-hidden"
          >
            <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-300 dark:from-indigo-300 dark:to-purple-300 text-white flex justify-between items-center rounded-t-lg">
              <h3 className="font-medium flex items-center gap-2">
                <Laptop className="h-4 w-4" />
                Desktop Assistant
              </h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-white/20 rounded-full"
                onClick={() => setFloatingAssistantOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <div className="space-y-4">
                {/* Chat messages */}
                <div className="space-y-4 mb-4">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={cn(
                        "flex items-start gap-2 message-animation",
                        message.role === "user" ? "justify-end" : "justify-start",
                      )}
                    >
                      {message.role === "assistant" && (
                        <Avatar className="h-8 w-8 ring-2 ring-white dark:ring-gray-700 shadow-md">
                          <AvatarImage src="/placeholder.svg" alt="AI" />
                          <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
                            <Bot className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}

                      <div
                        className={cn(
                          "rounded-lg p-3 max-w-[80%] shadow-md",
                          message.role === "user"
                            ? "bg-gradient-to-r from-indigo-500 to-purple-400 text-white"
                            : "bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600",
                        )}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <p className="text-xs opacity-50 mt-1 text-right">
                          {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>

                      {message.role === "user" && (
                        <Avatar className="h-8 w-8 ring-2 ring-white dark:ring-gray-700 shadow-md">
                          <AvatarImage src="/placeholder-user.jpg" alt="User" />
                          <AvatarFallback className="bg-gradient-to-br from-amber-500 to-red-500 text-white">
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
                      className="flex items-start gap-2"
                    >
                      <Avatar className="h-8 w-8 ring-2 ring-white dark:ring-gray-700 shadow-md">
                        <AvatarImage src="/placeholder.svg" alt="AI" />
                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="rounded-lg p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-md flex items-center space-x-2">
                        <div className="typing-dot h-2 w-2 rounded-full bg-indigo-500"></div>
                        <div className="typing-dot h-2 w-2 rounded-full bg-indigo-500"></div>
                        <div className="typing-dot h-2 w-2 rounded-full bg-indigo-500"></div>
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      className="bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-xs shadow-sm"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>

                <div className="relative">
                  <Input
                    placeholder="Type a command..."
                    className="pr-10 border-2 border-gray-200 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400 rounded-full pl-4 shadow-sm"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSendCommand()
                    }}
                    disabled={isProcessing}
                  />
                  <Button
                    size="icon"
                    className="absolute right-1 top-1 h-7 w-7 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90 shadow-md"
                    onClick={handleSendCommand}
                    disabled={isProcessing || !inputValue.trim()}
                  >
                    <Send className="h-3 w-3 text-white" />
                  </Button>
                </div>

                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "rounded-full h-10 w-10 p-0 flex items-center justify-center shadow-md",
                      isListening
                        ? "bg-gradient-to-r from-red-500 to-pink-500 text-white border-transparent animate-pulse"
                        : "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700",
                    )}
                    onClick={() => setIsListening(!isListening)}
                    disabled={isProcessing}
                  >
                    <Mic className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setFloatingAssistantOpen(!isFloatingAssistantOpen)}
        className="gradient-button h-14 w-14 rounded-full flex items-center justify-center shadow-lg text-white"
      >
        <MessageSquare className="h-6 w-6" />
      </motion.button>
    </div>
  )
}
