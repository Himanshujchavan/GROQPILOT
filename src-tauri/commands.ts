import { invoke } from "@tauri-apps/api/tauri"
import { type Child, Command as TauriCommand } from "@tauri-apps/api/shell"

let pythonServerProcess: Child | null = null

// Command to start the Python server
export async function startPythonServer(): Promise<boolean> {
  try {
    // Check if the server is already running
    if (pythonServerProcess !== null) {
      console.log("Python server is already running")
      return true
    }

    // Determine the Python executable path based on platform
    const platform = await invoke("get_platform")
    const pythonExe = platform === "windows" ? "python" : "python3"

    // Start the Python server as a child process
    const command = new TauriCommand(pythonExe, [
      "-m",
      "uvicorn",
      "python-backend.main:app",
      "--host",
      "0.0.0.0",
      "--port",
      "8000",
    ])

    // Set working directory to the app's directory
    command.setCurrentDirectory("./")

    // Execute the command
    pythonServerProcess = await command.spawn()

    console.log("Python server started with PID:", pythonServerProcess.pid)
    return true
  } catch (error) {
    console.error("Failed to start Python server:", error)
    return false
  }
}

// Command to stop the Python server
export async function stopPythonServer(): Promise<boolean> {
  try {
    if (pythonServerProcess === null) {
      console.log("Python server is not running")
      return true // Nothing to stop
    }

    // Kill the process
    pythonServerProcess.kill()
    pythonServerProcess = null
    console.log("Python server stopped")
    return true
  } catch (error) {
    console.error("Failed to stop Python server:", error)
    return false
  }
}

// Command to check if the Python server is running
export async function isPythonServerRunning(): Promise<boolean> {
  return pythonServerProcess !== null
}
