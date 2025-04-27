"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Terminal,
  FileText,
  Mail,
  Monitor,
  Database,
  FolderOpen,
  Eye,
  Clipboard,
  FileIcon as FileWord,
  Calendar,
  AlertTriangle,
  Play,
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface AutomationRequest {
  action: string
  target: string
  parameters: Record<string, any>
}

interface AutomationResponse {
  success: boolean
  result?: Record<string, any>
  error?: string
  execution_time?: number
}

export function PythonAutomation() {
  const [loading, setLoading] = useState(false)
  const [target, setTarget] = useState("email")
  const [action, setAction] = useState("")
  const [parameters, setParameters] = useState<Record<string, any>>({})
  const [response, setResponse] = useState<AutomationResponse | null>(null)
  const [serverStatus, setServerStatus] = useState<"online" | "offline" | "checking">("checking")
  const [startingServer, setStartingServer] = useState(false)
  const [errorDetails, setErrorDetails] = useState<string | null>(null)
  const [availableActions, setAvailableActions] = useState<Record<string, string[]>>({
    email: ["summarize", "compose", "send", "search"],
    excel: ["open", "read", "write", "create_chart", "run_macro", "export"],
    browser: ["open", "navigate", "search", "fill_form", "click", "screenshot", "extract"],
    system: ["open_app", "close_app", "type_text", "press_keys", "get_system_info", "run_command", "take_screenshot"],
    ocr: ["extract_text", "extract_from_screen", "extract_from_region", "extract_tables", "recognize_document"],
    files: ["list_files", "search_files", "organize_files", "rename_files", "move_files", "copy_files", "delete_files"],
    word: [
      "create_document",
      "open_document",
      "edit_document",
      "add_text",
      "add_table",
      "add_image",
      "save_document",
      "export_pdf",
    ],
    outlook: [
      "send_email",
      "read_emails",
      "create_meeting",
      "create_task",
      "create_contact",
      "search_emails",
      "get_calendar",
    ],
    clipboard: [
      "copy_text",
      "paste_text",
      "get_clipboard",
      "take_screenshot",
      "take_region_screenshot",
      "capture_active_window",
    ],
  })

  // Check if the Python server is running
  useEffect(() => {
    checkServerStatus()
    // Set up an interval to check server status every 30 seconds
    const intervalId = setInterval(checkServerStatus, 30000)
    return () => clearInterval(intervalId)
  }, [])

  const checkServerStatus = async () => {
    setServerStatus("checking")
    setErrorDetails(null)
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

      const response = await fetch("http://127.0.0.1:8000/health", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        setServerStatus("online")
      } else {
        const errorText = await response.text()
        setServerStatus("offline")
        setErrorDetails(`Server returned error: ${errorText}`)
      }
    } catch (error) {
      console.error("Error checking server status:", error)
      setServerStatus("offline")

      if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
        setErrorDetails("Cannot connect to Python server. Make sure the server is running on http://127.0.0.1:8000")
      } else if (error instanceof DOMException && error.name === "AbortError") {
        setErrorDetails("Connection timed out. The server might be starting up or not responding.")
      } else {
        setErrorDetails(`${error instanceof Error ? error.message : String(error)}`)
      }
    }
  }

  const startPythonServer = async () => {
    setStartingServer(true)
    try {
      // Check if we're in Tauri environment
      if (window.__TAURI__) {
        try {
          // Use Tauri to start the Python server
          await window.__TAURI__.invoke("start_python_server")
          toast({
            title: "Starting Python server",
            description: "The Python automation server is starting. This may take a few moments.",
          })

          // Wait a bit and then check status
          setTimeout(async () => {
            await checkServerStatus()
            setStartingServer(false)
          }, 3000)
        } catch (error) {
          console.error("Failed to start Python server:", error)
          toast({
            title: "Failed to start server",
            description: `Error: ${error instanceof Error ? error.message : String(error)}`,
            variant: "destructive",
          })
          setStartingServer(false)
        }
      } else {
        // In browser mode, we can't start the server
        toast({
          title: "Cannot start server in browser",
          description: "The Python server can only be started in the desktop app.",
          variant: "destructive",
        })
        setStartingServer(false)
      }
    } catch (error) {
      console.error("Error starting Python server:", error)
      setStartingServer(false)
    }
  }

  const handleTargetChange = (value: string) => {
    setTarget(value)
    setAction("")
    setParameters({})
  }

  const handleActionChange = (value: string) => {
    setAction(value)
    setParameters({})
  }

  const handleParameterChange = (key: string, value: any) => {
    setParameters((prev) => ({ ...prev, [key]: value }))
  }

  const executeAutomation = async () => {
    if (!action) {
      toast({
        title: "Action required",
        description: "Please select an action to execute",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setResponse(null)

    try {
      const request: AutomationRequest = {
        action,
        target,
        parameters,
      }

      // If server is offline, simulate response
      if (serverStatus === "offline") {
        await new Promise((resolve) => setTimeout(resolve, 1500))
        setResponse({
          success: true,
          result: {
            simulated: true,
            message: "This is a simulated response. Start the Python backend to get real results.",
            timestamp: new Date().toISOString(),
          },
          execution_time: 1.5,
        })
        setLoading(false)
        return
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

      const response = await fetch("http://localhost:8000/automate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      const data = await response.json()
      setResponse(data)

      if (data.success) {
        toast({
          title: "Automation completed",
          description: `Executed in ${data.execution_time?.toFixed(2)}s`,
          variant: "default",
        })
      } else {
        toast({
          title: "Automation failed",
          description: data.error || "Unknown error",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error executing automation:", error)

      let errorMessage = "Failed to execute automation"

      if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
        errorMessage = "Cannot connect to Python server. Make sure the server is running."
      } else if (error instanceof DOMException && error.name === "AbortError") {
        errorMessage = "The operation timed out. The task might be taking too long or the server is not responding."
      } else {
        errorMessage = `Error: ${error instanceof Error ? error.message : String(error)}`
      }

      setResponse({
        success: false,
        error: errorMessage,
      })

      toast({
        title: "Connection error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getTargetIcon = (targetName: string) => {
    switch (targetName) {
      case "email":
        return <Mail className="h-5 w-5" />
      case "excel":
        return <FileText className="h-5 w-5" />
      case "browser":
        return <Monitor className="h-5 w-5" />
      case "system":
        return <Terminal className="h-5 w-5" />
      case "ocr":
        return <Eye className="h-5 w-5" />
      case "files":
        return <FolderOpen className="h-5 w-5" />
      case "word":
        return <FileWord className="h-5 w-5" />
      case "outlook":
        return <Calendar className="h-5 w-5" />
      case "clipboard":
        return <Clipboard className="h-5 w-5" />
      default:
        return <Database className="h-5 w-5" />
    }
  }

  const renderParameterInputs = () => {
    if (!action) return null

    // Define parameter fields based on target and action
    const parameterFields: Record<string, Record<string, any>> = {
      email: {
        summarize: [
          { name: "folder", label: "Folder", type: "text", default: "INBOX" },
          { name: "days", label: "Days", type: "number", default: 1 },
        ],
        compose: [
          { name: "to", label: "To", type: "text", default: "" },
          { name: "subject", label: "Subject", type: "text", default: "" },
          { name: "body", label: "Body", type: "textarea", default: "" },
        ],
        send: [
          { name: "to", label: "To", type: "text", default: "" },
          { name: "subject", label: "Subject", type: "text", default: "" },
          { name: "body", label: "Body", type: "textarea", default: "" },
        ],
        search: [
          { name: "query", label: "Search Query", type: "text", default: "" },
          { name: "folder", label: "Folder", type: "text", default: "INBOX" },
        ],
      },
      excel: {
        open: [{ name: "file_path", label: "File Path", type: "text", default: "" }],
        read: [
          { name: "file_path", label: "File Path", type: "text", default: "" },
          { name: "sheet", label: "Sheet Name", type: "text", default: "Sheet1" },
          { name: "range", label: "Cell Range", type: "text", default: "A1:D10" },
        ],
        write: [
          { name: "file_path", label: "File Path", type: "text", default: "" },
          { name: "sheet", label: "Sheet Name", type: "text", default: "Sheet1" },
          { name: "start_cell", label: "Start Cell", type: "text", default: "A1" },
        ],
      },
      word: {
        create_document: [
          { name: "template", label: "Template Path (Optional)", type: "text", default: "" },
          { name: "save_path", label: "Save Path", type: "text", default: "" },
        ],
        open_document: [
          { name: "file_path", label: "File Path", type: "text", default: "" },
          { name: "read_only", label: "Read Only", type: "checkbox", default: false },
        ],
        edit_document: [
          { name: "file_path", label: "File Path", type: "text", default: "" },
          { name: "find_text", label: "Find Text", type: "text", default: "" },
          { name: "replace_text", label: "Replace Text", type: "text", default: "" },
        ],
        add_text: [
          { name: "file_path", label: "File Path", type: "text", default: "" },
          { name: "text", label: "Text to Add", type: "textarea", default: "" },
          { name: "position", label: "Position", type: "text", default: "end" },
        ],
      },
      outlook: {
        send_email: [
          { name: "to", label: "To", type: "text", default: "" },
          { name: "subject", label: "Subject", type: "text", default: "" },
          { name: "body", label: "Body", type: "textarea", default: "" },
          { name: "html_body", label: "HTML Body", type: "checkbox", default: false },
        ],
        read_emails: [
          { name: "folder", label: "Folder", type: "text", default: "Inbox" },
          { name: "count", label: "Count", type: "number", default: 10 },
          { name: "unread_only", label: "Unread Only", type: "checkbox", default: false },
        ],
        create_meeting: [
          { name: "subject", label: "Subject", type: "text", default: "" },
          { name: "location", label: "Location", type: "text", default: "" },
          { name: "start_time", label: "Start Time", type: "text", default: "" },
          { name: "end_time", label: "End Time", type: "text", default: "" },
          { name: "required_attendees", label: "Required Attendees", type: "text", default: "" },
        ],
      },
      clipboard: {
        copy_text: [{ name: "text", label: "Text to Copy", type: "textarea", default: "" }],
        paste_text: [{ name: "delay", label: "Delay (seconds)", type: "number", default: 0.5 }],
        take_screenshot: [
          { name: "save_path", label: "Save Path", type: "text", default: "" },
          { name: "include_cursor", label: "Include Cursor", type: "checkbox", default: true },
        ],
        take_region_screenshot: [
          { name: "region", label: "Region (x,y,width,height)", type: "text", default: "0,0,500,500" },
          { name: "save_path", label: "Save Path", type: "text", default: "" },
        ],
      },
      browser: {
        open: [
          {
            name: "browser",
            label: "Browser",
            type: "select",
            options: ["chrome", "firefox", "edge"],
            default: "chrome",
          },
          { name: "url", label: "URL", type: "text", default: "https://www.google.com" },
        ],
        navigate: [{ name: "url", label: "URL", type: "text", default: "" }],
        search: [
          { name: "query", label: "Search Query", type: "text", default: "" },
          {
            name: "engine",
            label: "Search Engine",
            type: "select",
            options: ["google", "bing", "duckduckgo"],
            default: "google",
          },
        ],
      },
      system: {
        open_app: [{ name: "app_name", label: "Application Name", type: "text", default: "" }],
        type_text: [{ name: "text", label: "Text to Type", type: "textarea", default: "" }],
        run_command: [{ name: "command", label: "Command", type: "text", default: "" }],
      },
      ocr: {
        extract_text: [{ name: "image_path", label: "Image Path", type: "text", default: "" }],
        extract_from_screen: [{ name: "save_screenshot", label: "Save Screenshot", type: "checkbox", default: true }],
        extract_from_region: [
          { name: "region", label: "Region (x,y,width,height)", type: "text", default: "0,0,500,500" },
        ],
      },
      files: {
        list_files: [
          { name: "directory", label: "Directory", type: "text", default: "." },
          { name: "recursive", label: "Recursive", type: "checkbox", default: false },
        ],
        search_files: [
          { name: "directory", label: "Directory", type: "text", default: "." },
          { name: "pattern", label: "Search Pattern", type: "text", default: "" },
        ],
        organize_files: [
          { name: "source_directory", label: "Source Directory", type: "text", default: "." },
          {
            name: "organize_by",
            label: "Organize By",
            type: "select",
            options: ["extension", "date", "name", "size"],
            default: "extension",
          },
        ],
      },
    }

    // Get parameter fields for current target and action
    const fields = parameterFields[target]?.[action] || []

    // Initialize default values if parameters object is empty
    if (Object.keys(parameters).length === 0 && fields.length > 0) {
      const defaultParams: Record<string, any> = {}
      fields.forEach((field) => {
        defaultParams[field.name] = field.default
      })
      setParameters(defaultParams)
    }

    return (
      <div className="space-y-4 mt-4">
        <h3 className="text-sm font-medium">Parameters</h3>
        {fields.map((field) => (
          <div key={field.name} className="space-y-2">
            <label htmlFor={field.name} className="text-sm font-medium">
              {field.label}
            </label>

            {field.type === "text" && (
              <Input
                id={field.name}
                value={parameters[field.name] || ""}
                onChange={(e) => handleParameterChange(field.name, e.target.value)}
                placeholder={field.label}
              />
            )}

            {field.type === "number" && (
              <Input
                id={field.name}
                type="number"
                value={parameters[field.name] || ""}
                onChange={(e) => handleParameterChange(field.name, Number(e.target.value))}
                placeholder={field.label}
              />
            )}

            {field.type === "textarea" && (
              <Textarea
                id={field.name}
                value={parameters[field.name] || ""}
                onChange={(e) => handleParameterChange(field.name, e.target.value)}
                placeholder={field.label}
                rows={4}
              />
            )}

            {field.type === "select" && (
              <Select
                value={parameters[field.name] || field.default}
                onValueChange={(value) => handleParameterChange(field.name, value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${field.label}`} />
                </SelectTrigger>
                <SelectContent>
                  {field.options.map((option: string) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {field.type === "checkbox" && (
              <div className="flex items-center space-x-2">
                <input
                  id={field.name}
                  type="checkbox"
                  checked={parameters[field.name] || false}
                  onChange={(e) => handleParameterChange(field.name, e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor={field.name} className="text-sm">
                  {field.label}
                </label>
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  const renderResponse = () => {
    if (!response) return null

    return (
      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Response</h3>
          <Badge variant={response.success ? "default" : "destructive"} className="flex items-center gap-1">
            {response.success ? (
              <>
                <CheckCircle2 className="h-3 w-3" />
                Success
              </>
            ) : (
              <>
                <XCircle className="h-3 w-3" />
                Failed
              </>
            )}
          </Badge>
        </div>

        {response.execution_time && (
          <p className="text-sm text-muted-foreground">Execution time: {response.execution_time.toFixed(2)}s</p>
        )}

        {response.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">{response.error}</p>
          </div>
        )}

        {response.result && (
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-md overflow-auto max-h-96">
            <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(response.result, null, 2)}</pre>
          </div>
        )}
      </div>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Python Desktop Automation</CardTitle>
            <CardDescription>Control desktop applications using Python automation</CardDescription>
          </div>
          <Badge
            variant={serverStatus === "online" ? "default" : serverStatus === "offline" ? "destructive" : "outline"}
            className="flex items-center gap-1"
          >
            {serverStatus === "checking" ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Checking
              </>
            ) : serverStatus === "online" ? (
              <>
                <CheckCircle2 className="h-3 w-3" />
                Server Online
              </>
            ) : (
              <>
                <XCircle className="h-3 w-3" />
                Server Offline
              </>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {serverStatus === "offline" && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Python Server Offline</AlertTitle>
            <AlertDescription>
              {errorDetails || "The Python automation server is not running."}
              <div className="mt-2">
                <Button
                  size="sm"
                  onClick={startPythonServer}
                  disabled={startingServer}
                  className="flex items-center gap-1"
                >
                  {startingServer ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <Play className="h-3 w-3" />
                      Start Server
                    </>
                  )}
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="email" onValueChange={handleTargetChange} value={target}>
          <TabsList className="grid grid-cols-9">
            <TabsTrigger value="email" className="flex items-center gap-1">
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Email</span>
            </TabsTrigger>
            <TabsTrigger value="excel" className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Excel</span>
            </TabsTrigger>
            <TabsTrigger value="word" className="flex items-center gap-1">
              <FileWord className="h-4 w-4" />
              <span className="hidden sm:inline">Word</span>
            </TabsTrigger>
            <TabsTrigger value="outlook" className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Outlook</span>
            </TabsTrigger>
            <TabsTrigger value="browser" className="flex items-center gap-1">
              <Monitor className="h-4 w-4" />
              <span className="hidden sm:inline">Browser</span>
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-1">
              <Terminal className="h-4 w-4" />
              <span className="hidden sm:inline">System</span>
            </TabsTrigger>
            <TabsTrigger value="ocr" className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">OCR</span>
            </TabsTrigger>
            <TabsTrigger value="clipboard" className="flex items-center gap-1">
              <Clipboard className="h-4 w-4" />
              <span className="hidden sm:inline">Clipboard</span>
            </TabsTrigger>
            <TabsTrigger value="files" className="flex items-center gap-1">
              <FolderOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Files</span>
            </TabsTrigger>
          </TabsList>

          {Object.keys(availableActions).map((targetKey) => (
            <TabsContent key={targetKey} value={targetKey} className="space-y-4">
              <div>
                <label htmlFor={`${targetKey}-action`} className="text-sm font-medium">
                  Select Action
                </label>
                <Select value={action} onValueChange={handleActionChange}>
                  <SelectTrigger id={`${targetKey}-action`}>
                    <SelectValue placeholder="Select an action" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableActions[targetKey].map((actionName) => (
                      <SelectItem key={actionName} value={actionName}>
                        {actionName.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {renderParameterInputs()}
            </TabsContent>
          ))}
        </Tabs>

        {renderResponse()}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={checkServerStatus} disabled={loading}>
          {serverStatus === "checking" ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Checking
            </>
          ) : (
            "Check Server"
          )}
        </Button>
        <Button onClick={executeAutomation} disabled={loading || !action}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Executing
            </>
          ) : (
            "Execute Automation"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
