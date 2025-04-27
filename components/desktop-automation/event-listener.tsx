"use client"

import { useEffect, useState } from "react"
import { toast } from "@/components/ui/use-toast"
import { useCommandStatus } from "@/hooks/use-command-status"

interface TaskLogEvent {
  message: string
  level: "info" | "warning" | "error" | "debug"
  timestamp: string
  data?: Record<string, any>
}

interface TaskProgressEvent {
  step: number
  totalSteps: number
  message: string
  percentage: number
  data?: Record<string, any>
}

interface TaskResultEvent {
  success: boolean
  result: any
  message: string
}

interface ErrorEvent {
  message: string
  type: string
  details?: Record<string, any>
}

export function TauriEventListener() {
  const { updateCommandStatus } = useCommandStatus()
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    // Skip if already initialized or not in Tauri environment
    if (initialized || typeof window.__TAURI__ === "undefined") {
      return
    }

    // Listen for task log events
    const unlistenLog = window.__TAURI__.event.listen("task-log", (event: { payload: TaskLogEvent }) => {
      const { message, level, data } = event.payload
      console.log(`[${level}] ${message}`, data)

      // Update command status
      if (data?.commandId) {
        updateCommandStatus(data.commandId, "running", message)
      }

      // Show toast for warnings and errors
      if (level === "warning") {
        toast({
          title: "Warning",
          description: message,
          variant: "default",
        })
      } else if (level === "error") {
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        })
      }
    })

    // Listen for task progress events
    const unlistenProgress = window.__TAURI__.event.listen("task-progress", (event: { payload: TaskProgressEvent }) => {
      const { step, totalSteps, message, percentage, data } = event.payload
      console.log(`Progress: ${percentage}% (${step}/${totalSteps}) - ${message}`, data)

      // Update command status
      if (data?.commandId) {
        updateCommandStatus(data.commandId, "running", message)
      }
    })

    // Listen for task result events
    const unlistenResult = window.__TAURI__.event.listen("task-result", (event: { payload: TaskResultEvent }) => {
      const { success, result, message } = event.payload
      console.log(`Result: ${success ? "Success" : "Failed"} - ${message}`, result)

      // Update command status
      if (result?.commandId) {
        updateCommandStatus(result.commandId, success ? "completed" : "failed", message, result)
      }

      // Show toast
      toast({
        title: success ? "Task Completed" : "Task Failed",
        description: message,
        variant: success ? "default" : "destructive",
      })
    })

    // Listen for error events
    const unlistenError = window.__TAURI__.event.listen("error", (event: { payload: ErrorEvent }) => {
      const { message, type, details } = event.payload
      console.error(`Error (${type}): ${message}`, details)

      // Update command status
      if (details?.commandId) {
        updateCommandStatus(details.commandId, "failed", message)
      }

      // Show toast
      toast({
        title: `Error: ${type}`,
        description: message,
        variant: "destructive",
      })
    })

    setInitialized(true)

    // Cleanup listeners on unmount
    return () => {
      unlistenLog()
      unlistenProgress()
      unlistenResult()
      unlistenError()
    }
  }, [initialized, updateCommandStatus])

  // This component doesn't render anything
  return null
}
