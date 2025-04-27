"use client"

import { useEffect } from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Loader2,
  Plus,
  Trash2,
  ArrowDown,
  Play,
  Save,
  Edit,
  Copy,
  FileText,
  Mail,
  Monitor,
  Terminal,
  Eye,
  FolderOpen,
  FileIcon as FileWord,
  Calendar,
  Clipboard,
  MoveUp,
  MoveDown,
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { ConfirmationDialog } from "./confirmation-dialog"

interface WorkflowStep {
  id: string
  name: string
  target: string
  action: string
  parameters: Record<string, any>
  pass_result_to_next: boolean
  continue_on_error: boolean
}

interface Workflow {
  id: string
  name: string
  description: string
  steps: WorkflowStep[]
  created_at: number
  updated_at: number
}

export function WorkflowBuilder() {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [currentWorkflow, setCurrentWorkflow] = useState<Workflow | null>(null)
  const [editingStep, setEditingStep] = useState<WorkflowStep | null>(null)
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)
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
    files: ["list_files", "search_files", "organize_files", "rename_files", '  "recognize_document'],
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

  // Create a new workflow
  const createNewWorkflow = () => {
    const newWorkflow: Workflow = {
      id: `workflow_${Date.now()}`,
      name: "New Workflow",
      description: "",
      steps: [],
      created_at: Date.now(),
      updated_at: Date.now(),
    }
    setWorkflows([...workflows, newWorkflow])
    setCurrentWorkflow(newWorkflow)
  }

  // Save workflow to local storage
  const saveWorkflow = () => {
    if (!currentWorkflow) return

    // Update the current workflow in the workflows array
    const updatedWorkflows = workflows.map((wf) =>
      wf.id === currentWorkflow.id ? { ...currentWorkflow, updated_at: Date.now() } : wf,
    )
    setWorkflows(updatedWorkflows)

    // Save to local storage
    localStorage.setItem("automation_workflows", JSON.stringify(updatedWorkflows))

    toast({
      title: "Workflow Saved",
      description: `Workflow "${currentWorkflow.name}" has been saved.`,
    })
  }

  // Load workflows from local storage
  const loadWorkflows = () => {
    const savedWorkflows = localStorage.getItem("automation_workflows")
    if (savedWorkflows) {
      try {
        const parsedWorkflows = JSON.parse(savedWorkflows) as Workflow[]
        setWorkflows(parsedWorkflows)
      } catch (error) {
        console.error("Error loading workflows:", error)
      }
    }
  }

  // Add a new step to the workflow
  const addStep = () => {
    if (!currentWorkflow) return

    const newStep: WorkflowStep = {
      id: `step_${Date.now()}`,
      name: `Step ${currentWorkflow.steps.length + 1}`,
      target: "email",
      action: "",
      parameters: {},
      pass_result_to_next: false,
      continue_on_error: false,
    }

    setCurrentWorkflow({
      ...currentWorkflow,
      steps: [...currentWorkflow.steps, newStep],
      updated_at: Date.now(),
    })

    // Start editing the new step
    setEditingStep(newStep)
    setEditingStepIndex(currentWorkflow.steps.length)
  }

  // Remove a step from the workflow
  const removeStep = (index: number) => {
    if (!currentWorkflow) return

    const confirmRemove = () => {
      const updatedSteps = [...currentWorkflow.steps]
      updatedSteps.splice(index, 1)

      // Rename steps to maintain sequential numbering
      const renamedSteps = updatedSteps.map((step, i) => ({
        ...step,
        name: step.name.startsWith("Step ") ? `Step ${i + 1}` : step.name,
      }))

      setCurrentWorkflow({
        ...currentWorkflow,
        steps: renamedSteps,
        updated_at: Date.now(),
      })

      // Clear editing state if we're editing the removed step
      if (editingStepIndex === index) {
        setEditingStep(null)
        setEditingStepIndex(null)
      } else if (editingStepIndex !== null && editingStepIndex > index) {
        // Adjust editing index if we're editing a step after the removed one
        setEditingStepIndex(editingStepIndex - 1)
      }
    }

    // Show confirmation dialog
    setConfirmationTitle("Remove Step")
    setConfirmationDescription(`Are you sure you want to remove "${currentWorkflow.steps[index].name}"?`)
    setConfirmationAction(() => confirmRemove)
    setShowConfirmation(true)
  }

  // Move a step up in the workflow
  const moveStepUp = (index: number) => {
    if (!currentWorkflow || index === 0) return

    const updatedSteps = [...currentWorkflow.steps]
    const temp = updatedSteps[index]
    updatedSteps[index] = updatedSteps[index - 1]
    updatedSteps[index - 1] = temp

    // Rename steps to maintain sequential numbering
    const renamedSteps = updatedSteps.map((step, i) => ({
      ...step,
      name: step.name.startsWith("Step ") ? `Step ${i + 1}` : step.name,
    }))

    setCurrentWorkflow({
      ...currentWorkflow,
      steps: renamedSteps,
      updated_at: Date.now(),
    })

    // Adjust editing index if needed
    if (editingStepIndex === index) {
      setEditingStepIndex(index - 1)
    } else if (editingStepIndex === index - 1) {
      setEditingStepIndex(index)
    }
  }

  // Move a step down in the workflow
  const moveStepDown = (index: number) => {
    if (!currentWorkflow || index === currentWorkflow.steps.length - 1) return

    const updatedSteps = [...currentWorkflow.steps]
    const temp = updatedSteps[index]
    updatedSteps[index] = updatedSteps[index + 1]
    updatedSteps[index + 1] = temp

    // Rename steps to maintain sequential numbering
    const renamedSteps = updatedSteps.map((step, i) => ({
      ...step,
      name: step.name.startsWith("Step ") ? `Step ${i + 1}` : step.name,
    }))

    setCurrentWorkflow({
      ...currentWorkflow,
      steps: renamedSteps,
      updated_at: Date.now(),
    })

    // Adjust editing index if needed
    if (editingStepIndex === index) {
      setEditingStepIndex(index + 1)
    } else if (editingStepIndex === index + 1) {
      setEditingStepIndex(index)
    }
  }

  // Edit a step
  const editStep = (index: number) => {
    if (!currentWorkflow) return
    setEditingStep({ ...currentWorkflow.steps[index] })
    setEditingStepIndex(index)
  }

  // Save step changes
  const saveStepChanges = () => {
    if (!currentWorkflow || !editingStep || editingStepIndex === null) return

    const updatedSteps = [...currentWorkflow.steps]
    updatedSteps[editingStepIndex] = editingStep

    setCurrentWorkflow({
      ...currentWorkflow,
      steps: updatedSteps,
      updated_at: Date.now(),
    })

    setEditingStep(null)
    setEditingStepIndex(null)
  }

  // Cancel step editing
  const cancelStepEditing = () => {
    setEditingStep(null)
    setEditingStepIndex(null)
  }

  // Execute the workflow
  const executeWorkflow = async () => {
    if (!currentWorkflow || currentWorkflow.steps.length === 0) {
      toast({
        title: "Cannot Execute",
        description: "Workflow is empty. Add at least one step before executing.",
        variant: "destructive",
      })
      return
    }

    // Check if any step has risky actions
    const hasRiskySteps = currentWorkflow.steps.some((step) => {
      const riskyKeywords = [
        "delete",
        "remove",
        "clear",
        "send",
        "email",
        "mail",
        "post",
        "publish",
        "share",
        "execute",
      ]
      return riskyKeywords.some((keyword) => step.action.toLowerCase().includes(keyword))
    })

    if (hasRiskySteps) {
      setConfirmationTitle("Execute Workflow")
      setConfirmationDescription(
        `This workflow contains potentially risky operations. Are you sure you want to execute "${currentWorkflow.name}"?`,
      )
      setConfirmationAction(() => performExecuteWorkflow)
      setShowConfirmation(true)
    } else {
      performExecuteWorkflow()
    }
  }

  // Actually execute the workflow after confirmation
  const performExecuteWorkflow = async () => {
    if (!currentWorkflow) return

    setIsExecuting(true)

    try {
      const response = await fetch("http://localhost:8000/workflow/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: currentWorkflow.name,
          steps: currentWorkflow.steps,
        }),
      })

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${await response.text()}`)
      }

      const data = await response.json()

      toast({
        title: "Workflow Started",
        description: `Workflow "${currentWorkflow.name}" is now running.`,
      })
    } catch (error) {
      console.error("Error executing workflow:", error)
      toast({
        title: "Execution Failed",
        description: `Error: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      })
    } finally {
      setIsExecuting(false)
    }
  }

  // Duplicate a workflow
  const duplicateWorkflow = (workflow: Workflow) => {
    const newWorkflow: Workflow = {
      ...workflow,
      id: `workflow_${Date.now()}`,
      name: `${workflow.name} (Copy)`,
      created_at: Date.now(),
      updated_at: Date.now(),
    }

    setWorkflows([...workflows, newWorkflow])
    setCurrentWorkflow(newWorkflow)

    toast({
      title: "Workflow Duplicated",
      description: `Created a copy of "${workflow.name}".`,
    })
  }

  // Delete a workflow
  const deleteWorkflow = (workflowId: string) => {
    const workflowToDelete = workflows.find((wf) => wf.id === workflowId)
    if (!workflowToDelete) return

    const confirmDelete = () => {
      const updatedWorkflows = workflows.filter((wf) => wf.id !== workflowId)
      setWorkflows(updatedWorkflows)

      // Save to local storage
      localStorage.setItem("automation_workflows", JSON.stringify(updatedWorkflows))

      // Clear current workflow if it's the one being deleted
      if (currentWorkflow?.id === workflowId) {
        setCurrentWorkflow(null)
      }

      toast({
        title: "Workflow Deleted",
        description: `Workflow "${workflowToDelete.name}" has been deleted.`,
      })
    }

    // Show confirmation dialog
    setConfirmationTitle("Delete Workflow")
    setConfirmationDescription(`Are you sure you want to delete "${workflowToDelete.name}"?`)
    setConfirmationAction(() => confirmDelete)
    setShowConfirmation(true)
  }

  // Get target icon
  const getTargetIcon = (targetName: string) => {
    switch (targetName) {
      case "email":
        return <Mail className="h-4 w-4" />
      case "excel":
        return <FileText className="h-4 w-4" />
      case "browser":
        return <Monitor className="h-4 w-4" />
      case "system":
        return <Terminal className="h-4 w-4" />
      case "ocr":
        return <Eye className="h-4 w-4" />
      case "files":
        return <FolderOpen className="h-4 w-4" />
      case "word":
        return <FileWord className="h-4 w-4" />
      case "outlook":
        return <Calendar className="h-4 w-4" />
      case "clipboard":
        return <Clipboard className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  // Load workflows on component mount
  useEffect(() => {
    loadWorkflows()
  }, [])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Workflow Builder</CardTitle>
          <CardDescription>Create and manage automation workflows</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Workflow List */}
            <div className="w-full md:w-1/3 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">My Workflows</h3>
                <Button size="sm" onClick={createNewWorkflow}>
                  <Plus className="h-4 w-4 mr-1" /> New
                </Button>
              </div>

              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {workflows.length === 0 ? (
                  <div className="text-center p-4 border rounded-md border-dashed">
                    <p className="text-muted-foreground">No workflows yet</p>
                    <Button variant="link" onClick={createNewWorkflow}>
                      Create your first workflow
                    </Button>
                  </div>
                ) : (
                  workflows.map((workflow) => (
                    <div
                      key={workflow.id}
                      className={`p-3 border rounded-md cursor-pointer hover:bg-accent transition-colors ${
                        currentWorkflow?.id === workflow.id ? "border-primary bg-accent/50" : ""
                      }`}
                      onClick={() => setCurrentWorkflow(workflow)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{workflow.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            {workflow.steps.length} step{workflow.steps.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              duplicateWorkflow(workflow)
                            }}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteWorkflow(workflow.id)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Workflow Editor */}
            <div className="w-full md:w-2/3 border-l pl-6">
              {currentWorkflow ? (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label htmlFor="workflow-name">Workflow Name</Label>
                        <Input
                          id="workflow-name"
                          value={currentWorkflow.name}
                          onChange={(e) =>
                            setCurrentWorkflow({ ...currentWorkflow, name: e.target.value, updated_at: Date.now() })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="workflow-description">Description (Optional)</Label>
                        <Textarea
                          id="workflow-description"
                          value={currentWorkflow.description}
                          onChange={(e) =>
                            setCurrentWorkflow({
                              ...currentWorkflow,
                              description: e.target.value,
                              updated_at: Date.now(),
                            })
                          }
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Steps</h3>
                      <Button size="sm" onClick={addStep}>
                        <Plus className="h-4 w-4 mr-1" /> Add Step
                      </Button>
                    </div>

                    {currentWorkflow.steps.length === 0 ? (
                      <div className="text-center p-6 border rounded-md border-dashed">
                        <p className="text-muted-foreground">No steps yet</p>
                        <Button variant="link" onClick={addStep}>
                          Add your first step
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {currentWorkflow.steps.map((step, index) => (
                          <div
                            key={step.id}
                            className={`p-3 border rounded-md ${
                              editingStepIndex === index ? "border-primary bg-accent/50" : ""
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="flex items-center gap-1">
                                  {getTargetIcon(step.target)}
                                  {step.target}
                                </Badge>
                                <span className="font-medium">{step.name}</span>
                                {step.action && <span className="text-muted-foreground">({step.action})</span>}
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => moveStepUp(index)}
                                  disabled={index === 0}
                                >
                                  <MoveUp className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => moveStepDown(index)}
                                  disabled={index === currentWorkflow.steps.length - 1}
                                >
                                  <MoveDown className="h-4 w-4" />
                                </Button>
                                <Button size="icon" variant="ghost" onClick={() => editStep(index)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button size="icon" variant="ghost" onClick={() => removeStep(index)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            {step.pass_result_to_next && index < currentWorkflow.steps.length - 1 && (
                              <div className="mt-2 flex justify-center">
                                <ArrowDown className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={saveWorkflow}>
                      <Save className="h-4 w-4 mr-1" /> Save Workflow
                    </Button>
                    <Button onClick={executeWorkflow} disabled={isExecuting || currentWorkflow.steps.length === 0}>
                      {isExecuting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Executing...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-1" /> Execute Workflow
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8">
                  <p className="text-muted-foreground mb-4">Select a workflow or create a new one</p>
                  <Button onClick={createNewWorkflow}>
                    <Plus className="h-4 w-4 mr-1" /> Create New Workflow
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step Editor Dialog */}
      {editingStep && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Edit Step</CardTitle>
            <CardDescription>Configure the automation step</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="step-name">Step Name</Label>
                <Input
                  id="step-name"
                  value={editingStep.name}
                  onChange={(e) => setEditingStep({ ...editingStep, name: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="step-target">Target</Label>
                <Select
                  value={editingStep.target}
                  onValueChange={(value) =>
                    setEditingStep({ ...editingStep, target: value, action: "", parameters: {} })
                  }
                >
                  <SelectTrigger id="step-target">
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
                <Label htmlFor="step-action">Action</Label>
                <Select
                  value={editingStep.action}
                  onValueChange={(value) => setEditingStep({ ...editingStep, action: value, parameters: {} })}
                >
                  <SelectTrigger id="step-action">
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableActions[editingStep.target]?.map((action) => (
                      <SelectItem key={action} value={action}>
                        {action.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Parameters would be dynamically generated based on the selected action */}
              {/* This is a simplified version */}
              <div>
                <Label htmlFor="step-parameters">Parameters (JSON)</Label>
                <Textarea
                  id="step-parameters"
                  value={JSON.stringify(editingStep.parameters, null, 2)}
                  onChange={(e) => {
                    try {
                      const params = JSON.parse(e.target.value)
                      setEditingStep({ ...editingStep, parameters: params })
                    } catch (error) {
                      // Invalid JSON, don't update
                    }
                  }}
                  rows={5}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter parameters as a valid JSON object. Example: {'{ "key": "value" }'}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="pass-result"
                  checked={editingStep.pass_result_to_next}
                  onCheckedChange={(checked) => setEditingStep({ ...editingStep, pass_result_to_next: checked })}
                />
                <Label htmlFor="pass-result">Pass result to next step</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="continue-on-error"
                  checked={editingStep.continue_on_error}
                  onCheckedChange={(checked) => setEditingStep({ ...editingStep, continue_on_error: checked })}
                />
                <Label htmlFor="continue-on-error">Continue workflow if this step fails</Label>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={cancelStepEditing}>
              Cancel
            </Button>
            <Button onClick={saveStepChanges}>Save Changes</Button>
          </CardFooter>
        </Card>
      )}

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
    </div>
  )
}
