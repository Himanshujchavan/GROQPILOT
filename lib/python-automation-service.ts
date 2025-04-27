// Service for communicating with the Python automation backend

export interface AutomationRequest {
  action: string
  target: string
  parameters: Record<string, any>
}

export interface AutomationResponse {
  success: boolean
  result?: Record<string, any>
  error?: string
  execution_time?: number
}

const PYTHON_SERVER_URL = "http://localhost:8000"

export async function checkServerStatus(): Promise<boolean> {
  try {
    const response = await fetch(`${PYTHON_SERVER_URL}/health`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })

    return response.ok
  } catch (error) {
    console.error("Error checking Python server status:", error)
    return false
  }
}

export async function executeAutomation(request: AutomationRequest): Promise<AutomationResponse> {
  try {
    const response = await fetch(`${PYTHON_SERVER_URL}/automate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Server returned ${response.status}: ${errorText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error executing automation:", error)
    return {
      success: false,
      error: `Failed to execute automation: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

export async function executeAsyncAutomation(request: AutomationRequest): Promise<string> {
  try {
    const response = await fetch(`${PYTHON_SERVER_URL}/automate/async`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Server returned ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    return data.task_id
  } catch (error) {
    console.error("Error executing async automation:", error)
    throw error
  }
}

export async function getTaskStatus(taskId: string): Promise<Record<string, any>> {
  try {
    const response = await fetch(`${PYTHON_SERVER_URL}/tasks/${taskId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Server returned ${response.status}: ${errorText}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error getting task status for ${taskId}:`, error)
    throw error
  }
}
