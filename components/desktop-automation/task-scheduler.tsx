"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  Play,
  Pause,
  AlarmClock,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
import { ConfirmationDialog } from "./confirmation-dialog"

interface ScheduledTask {
  id: string
  name: string
  target: string
  action: string
  parameters: Record<string, any>
  schedule: {
    type: "once" | "daily" | "weekly" | "monthly" | "custom"
    time?: string
    date?: string
    days?: string[]
    cron?: string
  }
  active: boolean
  nextRun: number
  lastRun?: number
  lastResult?: "success" | "failure"
}

export function TaskScheduler() {
  const [tasks, setTasks] = useState<ScheduledTask[]>([])
  const [showNewTaskForm, setShowNewTaskForm] = useState(false)
  const [newTask, setNewTask] = useState<Partial<ScheduledTask>>({
    name: "",
    target: "email",
    action: "",
    parameters: {},
    schedule: {
      type: "once",
      time: new Date().toTimeString().slice(0, 5),
      date: new Date().toISOString().slice(0, 10),
    },
    active: true,
  })
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [confirmationAction, setConfirmationAction] = useState<() => void>(() => {})
  const [confirmationTitle, setConfirmationTitle] = useState("")
  const [confirmationDescription, setConfirmationDescription] = useState("")

  // Available targets and actions (same as in python-automation.tsx)
  const availableActions: Record<string, string[]> = {
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
  }

  // Load tasks from local storage
  useEffect(() => {
    const savedTasks = localStorage.getItem("automation_scheduled_tasks")
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks) as ScheduledTask[]
        setTasks(parsedTasks)
      } catch (error) {
        console.error("Error loading scheduled tasks:", error)
      }
    }
  }, [])

  // Save tasks to local storage
  const saveTasks = (updatedTasks: ScheduledTask[]) => {
    setTasks(updatedTasks)
    localStorage.setItem("automation_scheduled_tasks", JSON.stringify(updatedTasks))
  }

  // Calculate next run time based on schedule
  const calculateNextRun = (schedule: ScheduledTask["schedule"]): number => {
    const now = new Date()
    let nextRun = new Date()

    switch (schedule.type) {
      case "once":
        if (schedule.date && schedule.time) {
          const [hours, minutes] = schedule.time.split(":").map(Number)
          nextRun = new Date(schedule.date)
          nextRun.setHours(hours, minutes, 0, 0)
        }
        break

      case "daily":
        if (schedule.time) {
          const [hours, minutes] = schedule.time.split(":").map(Number)
          nextRun.setHours(hours, minutes, 0, 0)
          if (nextRun <= now) {
            nextRun.setDate(nextRun.getDate() + 1)
          }
        }
        break

      case "weekly":
        if (schedule.time && schedule.days && schedule.days.length > 0) {
          const [hours, minutes] = schedule.time.split(":").map(Number)
          nextRun.setHours(hours, minutes, 0, 0)

          // Find the next day of the week that matches
          const currentDay = now.getDay()
          const days = schedule.days.map(Number)
          let daysToAdd = 0

          for (let i = 1; i <= 7; i++) {
            const checkDay = (currentDay + i) % 7
            if (days.includes(checkDay)) {
              daysToAdd = i
              break
            }
          }

          nextRun.setDate(now.getDate() + daysToAdd)
        }
        break

      case "monthly":
        if (schedule.time && schedule.date) {
          const [hours, minutes] = schedule.time.split(":").map(Number)
          const dayOfMonth = Number.parseInt(schedule.date.split("-")[2])

          nextRun.setDate(dayOfMonth)
          nextRun.setHours(hours, minutes, 0, 0)

          if (nextRun <= now) {
            nextRun.setMonth(nextRun.getMonth() + 1)
          }
        }
        break

      case "custom":
        // For custom cron, we'd need a cron parser library
        // This is a simplified version that just adds a day
        nextRun.setDate(now.getDate() + 1)
        break
    }

    return nextRun.getTime()
  }

  // Create a new scheduled task
  const createTask = () => {
    if (!newTask.name || !newTask.target || !newTask.action) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    const nextRun = calculateNextRun(newTask.schedule as ScheduledTask["schedule"])

    const task: ScheduledTask = {
      id: `task_${Date.now()}`,
      name: newTask.name || "Unnamed Task",
      target: newTask.target || "email",
      action: newTask.action || "",
      parameters: newTask.parameters || {},
      schedule: newTask.schedule as ScheduledTask["schedule"],
      active: newTask.active || true,
      nextRun,
    }

    const updatedTasks = [...tasks, task]
    saveTasks(updatedTasks)

    // Reset form
    setNewTask({
      name: "",
      target: "email",
      action: "",
      parameters: {},
      schedule: {
        type: "once",
        time: new Date().toTimeString().slice(0, 5),
        date: new Date().toISOString().slice(0, 10),
      },
      active: true,
    })
    setShowNewTaskForm(false)

    toast({
      title: "Task Scheduled",
      description: `Task "${task.name}" has been scheduled.`,
    })

    // Register the task with the server
    registerTaskWithServer(task)
  }

  // Register task with the Python server
  const registerTaskWithServer = async (task: ScheduledTask) => {
    try {
      const response = await fetch("http://localhost:8000/schedule/task", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          task: {
            target: task.target,
            action: task.action,
            parameters: task.parameters,
          },
          schedule: task.schedule,
          next_run: task.nextRun,
        }),
      })

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${await response.text()}`)
      }

      console.log("Task registered with server")
    } catch (error) {
      console.error("Error registering task with server:", error)
      // We still keep the task locally even if server registration fails
    }
  }

  // Delete a task
  const deleteTask = (taskId: string) => {
    const taskToDelete = tasks.find((task) => task.id === taskId)
    if (!taskToDelete) return

    const confirmDelete = () => {
      const updatedTasks = tasks.filter((task) => task.id !== taskId)
      saveTasks(updatedTasks)

      toast({
        title: "Task Deleted",
        description: `Task "${taskToDelete.name}" has been deleted.`,
      })

      // Unregister from server
      try {
        fetch(`http://localhost:8000/schedule/task/${taskId}`, {
          method: "DELETE",
        }).catch(console.error)
      } catch (error) {
        console.error("Error unregistering task from server:", error)
      }
    }

    // Show confirmation dialog
    setConfirmationTitle("Delete Task")
    setConfirmationDescription(`Are you sure you want to delete task "${taskToDelete.name}"?`)
    setConfirmationAction(() => confirmDelete)
    setShowConfirmation(true)
  }

  // Toggle task active state
  const toggleTaskActive = (taskId: string) => {
    const updatedTasks = tasks.map((task) => (task.id === taskId ? { ...task, active: !task.active } : task))
    saveTasks(updatedTasks)

    const task = updatedTasks.find((t) => t.id === taskId)
    if (task) {
      toast({
        title: task.active ? "Task Activated" : "Task Paused",
        description: `Task "${task.name}" has been ${task.active ? "activated" : "paused"}.`,
      })
    }
  }

  // Run a task immediately
  const runTaskNow = async (task: ScheduledTask) => {
    try {
      const response = await fetch("http://localhost:8000/automate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          target: task.target,
          action: task.action,
          parameters: task.parameters,
          confirm_risky: true, // Skip confirmation for scheduled tasks
        }),
      })

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${await response.text()}`)
      }

      const data = await response.json()

      // Update task with last run info
      const updatedTasks = tasks.map((t) =>
        t.id === task.id
          ? {
              ...t,
              lastRun: Date.now(),
              lastResult: data.success ? "success" : "failure",
            }
          : t,
      )
      saveTasks(updatedTasks)

      toast({
        title: data.success ? "Task Executed Successfully" : "Task Execution Failed",
        description: data.success
          ? `Task "${task.name}" was executed successfully.`
          : `Task "${task.name}" execution failed: ${data.error}`,
        variant: data.success ? "default" : "destructive",
      })
    } catch (error) {
      console.error("Error executing task:", error)

      // Update task with failure info
      const updatedTasks = tasks.map((t) =>
        t.id === task.id
          ? {
              ...t,
              lastRun: Date.now(),
              lastResult: "failure",
            }
          : t,
      )
      saveTasks(updatedTasks)

      toast({
        title: "Task Execution Failed",
        description: `Error: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      })
    }
  }

  // Format next run time
  const formatNextRun = (timestamp: number): string => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = timestamp - now.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return `Today at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    } else if (diffDays === 1) {
      return `Tomorrow at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    } else if (diffDays < 7) {
      return `${date.toLocaleDateString([], { weekday: "long" })} at ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`
    } else {
      return date.toLocaleString()
    }
  }

  // Get schedule description
  const getScheduleDescription = (schedule: ScheduledTask["schedule"]): string => {
    switch (schedule.type) {
      case "once":
        return `Once on ${new Date(schedule.date || "").toLocaleDateString()} at ${schedule.time}`
      case "daily":
        return `Daily at ${schedule.time}`
      case "weekly":
        const days = schedule.days || []
        const dayNames = days.map((day) => {
          const dayNum = Number.parseInt(day)
          return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][dayNum]
        })
        return `Weekly on ${dayNames.join(", ")} at ${schedule.time}`
      case "monthly":
        return `Monthly on day ${schedule.date?.split("-")[2]} at ${schedule.time}`
      case "custom":
        return `Custom schedule: ${schedule.cron}`
      default:
        return "Unknown schedule"
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Task Scheduler</CardTitle>
            <CardDescription>Schedule automation tasks to run automatically</CardDescription>
          </div>
          <Button onClick={() => setShowNewTaskForm(!showNewTaskForm)}>
            {showNewTaskForm ? (
              "Cancel"
            ) : (
              <>
                <Plus className="h-4 w-4 mr-1" /> New Task
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showNewTaskForm && (
          <Card className="mb-6 border-primary">
            <CardHeader>
              <CardTitle>New Scheduled Task</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="task-name">Task Name</Label>
                  <Input
                    id="task-name"
                    value={newTask.name || ""}
                    onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                    placeholder="Daily Email Summary"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="task-target">Target</Label>
                    <Select
                      value={newTask.target}
                      onValueChange={(value) => setNewTask({ ...newTask, target: value, action: "" })}
                    >
                      <SelectTrigger id="task-target">
                        <SelectValue placeholder="Select target" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="excel">Excel</SelectItem>
                        <SelectItem value="word">Word</SelectItem>
                        <SelectItem value="outlook">Outlook</SelectItem>
                        <SelectItem value="browser">Browser</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                        <SelectItem value="ocr">OCR</SelectItem>
                        <SelectItem value="clipboard">Clipboard</SelectItem>
                        <SelectItem value="files">Files</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="task-action">Action</Label>
                    <Select value={newTask.action} onValueChange={(value) => setNewTask({ ...newTask, action: value })}>
                      <SelectTrigger id="task-action">
                        <SelectValue placeholder="Select action" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableActions[newTask.target || "email"]?.map((action) => (
                          <SelectItem key={action} value={action}>
                            {action.replace(/_/g, " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="task-parameters">Parameters (JSON)</Label>
                  <Input
                    id="task-parameters"
                    value={JSON.stringify(newTask.parameters || {})}
                    onChange={(e) => {
                      try {
                        const params = JSON.parse(e.target.value)
                        setNewTask({ ...newTask, parameters: params })
                      } catch (error) {
                        // Invalid JSON, don't update
                      }
                    }}
                    placeholder='{"key": "value"}'
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter parameters as a valid JSON object. Example: {'{ "key": "value" }'}
                  </p>
                </div>

                <div>
                  <Label htmlFor="schedule-type">Schedule Type</Label>
                  <Select
                    value={newTask.schedule?.type || "once"}
                    onValueChange={(value) =>
                      setNewTask({
                        ...newTask,
                        schedule: {
                          ...newTask.schedule,
                          type: value as ScheduledTask["schedule"]["type"],
                        },
                      })
                    }
                  >
                    <SelectTrigger id="schedule-type">
                      <SelectValue placeholder="Select schedule type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="once">Once</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Schedule details based on type */}
                {newTask.schedule?.type === "once" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="schedule-date">Date</Label>
                      <Input
                        id="schedule-date"
                        type="date"
                        value={newTask.schedule.date || ""}
                        onChange={(e) =>
                          setNewTask({
                            ...newTask,
                            schedule: { ...newTask.schedule, date: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="schedule-time">Time</Label>
                      <Input
                        id="schedule-time"
                        type="time"
                        value={newTask.schedule.time || ""}
                        onChange={(e) =>
                          setNewTask({
                            ...newTask,
                            schedule: { ...newTask.schedule, time: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>
                )}

                {newTask.schedule?.type === "daily" && (
                  <div>
                    <Label htmlFor="schedule-time">Time</Label>
                    <Input
                      id="schedule-time"
                      type="time"
                      value={newTask.schedule.time || ""}
                      onChange={(e) =>
                        setNewTask({
                          ...newTask,
                          schedule: { ...newTask.schedule, time: e.target.value },
                        })
                      }
                    />
                  </div>
                )}

                {newTask.schedule?.type === "weekly" && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="schedule-time">Time</Label>
                      <Input
                        id="schedule-time"
                        type="time"
                        value={newTask.schedule.time || ""}
                        onChange={(e) =>
                          setNewTask({
                            ...newTask,
                            schedule: { ...newTask.schedule, time: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Days of Week</Label>
                      <div className="grid grid-cols-7 gap-2 mt-2">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
                          <div key={day} className="flex flex-col items-center">
                            <Button
                              variant={newTask.schedule?.days?.includes(index.toString()) ? "default" : "outline"}
                              size="sm"
                              className="w-full"
                              onClick={() => {
                                const days = newTask.schedule?.days || []
                                const indexStr = index.toString()
                                const newDays = days.includes(indexStr)
                                  ? days.filter((d) => d !== indexStr)
                                  : [...days, indexStr]
                                setNewTask({
                                  ...newTask,
                                  schedule: { ...newTask.schedule, days: newDays },
                                })
                              }}
                            >
                              {day}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {newTask.schedule?.type === "monthly" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="schedule-day">Day of Month</Label>
                      <Select
                        value={newTask.schedule.date?.split("-")[2] || "1"}
                        onValueChange={(value) => {
                          const now = new Date()
                          const year = now.getFullYear()
                          const month = now.getMonth() + 1
                          const date = `${year}-${month.toString().padStart(2, "0")}-${value.padStart(2, "0")}`
                          setNewTask({
                            ...newTask,
                            schedule: { ...newTask.schedule, date },
                          })
                        }}
                      >
                        <SelectTrigger id="schedule-day">
                          <SelectValue placeholder="Select day" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                            <SelectItem key={day} value={day.toString()}>
                              {day}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="schedule-time">Time</Label>
                      <Input
                        id="schedule-time"
                        type="time"
                        value={newTask.schedule.time || ""}
                        onChange={(e) =>
                          setNewTask({
                            ...newTask,
                            schedule: { ...newTask.schedule, time: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>
                )}

                {newTask.schedule?.type === "custom" && (
                  <div>
                    <Label htmlFor="schedule-cron">Cron Expression</Label>
                    <Input
                      id="schedule-cron"
                      value={newTask.schedule.cron || ""}
                      onChange={(e) =>
                        setNewTask({
                          ...newTask,
                          schedule: { ...newTask.schedule, cron: e.target.value },
                        })
                      }
                      placeholder="* * * * *"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Format: minute hour day-of-month month day-of-week
                    </p>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Switch
                    id="task-active"
                    checked={newTask.active}
                    onCheckedChange={(checked) => setNewTask({ ...newTask, active: checked })}
                  />
                  <Label htmlFor="task-active">Active</Label>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={createTask}>Schedule Task</Button>
            </CardFooter>
          </Card>
        )}

        <div className="space-y-4">
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No scheduled tasks. Create a new task to get started.
            </div>
          ) : (
            tasks.map((task) => (
              <Card key={task.id} className={task.active ? "" : "opacity-70"}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {task.name}
                        {task.lastResult && (
                          <Badge variant={task.lastResult === "success" ? "default" : "destructive"} className="ml-2">
                            {task.lastResult === "success" ? (
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                            ) : (
                              <XCircle className="h-3 w-3 mr-1" />
                            )}
                            {task.lastResult}
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        {task.target} / {task.action.replace(/_/g, " ")}
                      </CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => toggleTaskActive(task.id)}
                        title={task.active ? "Pause" : "Activate"}
                      >
                        {task.active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => runTaskNow(task)}>
                            <Play className="h-4 w-4 mr-2" />
                            Run Now
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => deleteTask(task.id)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-1">
                    <div className="flex items-center text-muted-foreground">
                      <AlarmClock className="h-4 w-4 mr-1" />
                      {getScheduleDescription(task.schedule)}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                      Next run: {formatNextRun(task.nextRun)}
                    </div>
                    {task.lastRun && (
                      <div className="flex items-center text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-1" />
                        Last run: {new Date(task.lastRun).toLocaleString()}
                      </div>
                    )}
                  </div>
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
