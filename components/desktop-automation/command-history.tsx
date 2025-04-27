"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Search,
  Filter,
  Calendar,
  Play,
  Trash2,
  MoreHorizontal,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { ConfirmationDialog } from "./confirmation-dialog"

interface CommandHistoryItem {
  id: string
  target: string
  action: string
  parameters: Record<string, any>
  status: "pending" | "running" | "completed" | "failed"
  timestamp: number
  result?: any
  error?: string
}

export function CommandHistory() {
  const [commands, setCommands] = useState<CommandHistoryItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [targetFilter, setTargetFilter] = useState<string>("all")
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [confirmationAction, setConfirmationAction] = useState<() => void>(() => {})
  const [confirmationTitle, setConfirmationTitle] = useState("")
  const [confirmationDescription, setConfirmationDescription] = useState("")

  // Load command history from local storage
  useEffect(() => {
    const savedCommands = localStorage.getItem("automation_command_history")
    if (savedCommands) {
      try {
        const parsedCommands = JSON.parse(savedCommands) as CommandHistoryItem[]
        setCommands(parsedCommands)
      } catch (error) {
        console.error("Error loading command history:", error)
      }
    }
  }, [])

  // Filter commands based on search term and filters
  const filteredCommands = commands.filter((command) => {
    const matchesSearch =
      searchTerm === "" ||
      command.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      command.target.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || command.status === statusFilter
    const matchesTarget = targetFilter === "all" || command.target === targetFilter

    return matchesSearch && matchesStatus && matchesTarget
  })

  // Extract unique targets for filter
  const targets = Array.from(new Set(commands.map((command) => command.target)))

  // Get status badge
  const getStatusBadge = (status: CommandHistoryItem["status"]) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        )
      case "running":
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200">
            <Loader2 className="h-3 w-3 animate-spin" />
            Running
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200">
            <CheckCircle2 className="h-3 w-3" />
            Completed
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-red-50 text-red-700 border-red-200">
            <XCircle className="h-3 w-3" />
            Failed
          </Badge>
        )
      default:
        return null
    }
  }

  // Replay a command
  const replayCommand = async (command: CommandHistoryItem) => {
    try {
      const response = await fetch("http://localhost:8000/automate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          target: command.target,
          action: command.action,
          parameters: command.parameters,
          confirm_risky: true, // Skip confirmation since this is a replay
        }),
      })

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${await response.text()}`)
      }

      const data = await response.json()

      // Add to history
      const newCommand: CommandHistoryItem = {
        id: `command_${Date.now()}`,
        target: command.target,
        action: command.action,
        parameters: command.parameters,
        status: "completed",
        timestamp: Date.now(),
        result: data.result,
      }

      const updatedCommands = [newCommand, ...commands]
      setCommands(updatedCommands)
      localStorage.setItem("automation_command_history", JSON.stringify(updatedCommands))

      toast({
        title: "Command Replayed",
        description: `Successfully replayed ${command.action} on ${command.target}`,
      })
    } catch (error) {
      console.error("Error replaying command:", error)
      toast({
        title: "Replay Failed",
        description: `Error: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      })
    }
  }

  // Delete a command
  const deleteCommand = (commandId: string) => {
    const commandToDelete = commands.find((cmd) => cmd.id === commandId)
    if (!commandToDelete) return

    const confirmDelete = () => {
      const updatedCommands = commands.filter((cmd) => cmd.id !== commandId)
      setCommands(updatedCommands)
      localStorage.setItem("automation_command_history", JSON.stringify(updatedCommands))

      toast({
        title: "Command Deleted",
        description: `Command has been removed from history.`,
      })
    }

    // Show confirmation dialog
    setConfirmationTitle("Delete Command")
    setConfirmationDescription(`Are you sure you want to delete this command from history?`)
    setConfirmationAction(() => confirmDelete)
    setShowConfirmation(true)
  }

  // Clear all history
  const clearHistory = () => {
    const confirmClear = () => {
      setCommands([])
      localStorage.removeItem("automation_command_history")

      toast({
        title: "History Cleared",
        description: "Command history has been cleared.",
      })
    }

    // Show confirmation dialog
    setConfirmationTitle("Clear History")
    setConfirmationDescription("Are you sure you want to clear all command history? This cannot be undone.")
    setConfirmationAction(() => confirmClear)
    setShowConfirmation(true)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Command History</CardTitle>
            <CardDescription>View and replay your previous automation commands</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={clearHistory} disabled={commands.length === 0}>
            <Trash2 className="h-4 w-4 mr-1" /> Clear History
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search commands..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="running">Running</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={targetFilter} onValueChange={setTargetFilter}>
              <SelectTrigger className="w-[130px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Target" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Targets</SelectItem>
                {targets.map((target) => (
                  <SelectItem key={target} value={target}>
                    {target}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          {filteredCommands.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {commands.length === 0
                ? "No command history yet. Run some automations to see them here."
                : "No commands match your filters."}
            </div>
          ) : (
            filteredCommands.map((command) => (
              <Card key={command.id} className="overflow-hidden">
                <CardHeader className="py-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Badge>{command.target}</Badge>
                      <span className="font-medium">{command.action.replace(/_/g, " ")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(command.status)}
                      <div className="text-xs text-muted-foreground flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(command.timestamp).toLocaleString()}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => replayCommand(command)}>
                            <Play className="h-4 w-4 mr-2" />
                            Replay Command
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => deleteCommand(command.id)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete from History
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="text-sm">
                    <strong>Parameters:</strong>{" "}
                    {Object.keys(command.parameters).length > 0 ? JSON.stringify(command.parameters) : "No parameters"}
                  </div>
                  {command.result && (
                    <div className="mt-2 p-2 bg-muted rounded text-xs">
                      <pre className="whitespace-pre-wrap">
                        {typeof command.result === "string" ? command.result : JSON.stringify(command.result, null, 2)}
                      </pre>
                    </div>
                  )}
                  {command.error && (
                    <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-700">
                      <pre className="whitespace-pre-wrap">{command.error}</pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={showConfirmation}
          onClose={() => setShowConfirmation(false)}
          onConfirm={() => {
            confirmationAction()
            setShowConfirmation(false)
          }}
          title={confirmationTitle}
          description={confirmationDescription}
        />
      </CardContent>
    </Card>
  )
}
