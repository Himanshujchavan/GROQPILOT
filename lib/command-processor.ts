import type { CommandIntent } from "./groq-api"
import { executeDesktopCommand, type DesktopAppCommand } from "./desktop-integration"
import { generateCommandResponse, processAutomationCommand } from "./groq-api"
import { storeCommand, updateCommandStatus } from "./firebase"

export interface Command {
  id?: string
  intent: CommandIntent
  status: "pending" | "running" | "completed" | "failed"
  timestamp: any
  response?: string
  result?: any
  userId: string
}

export const processCommand = async (command: string) => {
  try {
    const intent = await processUserCommand(command)
    const response = await generateCommandResponse(intent)

    // Store the command in Firestore
    const storedCommand = await storeCommand(intent, response)

    if (!storedCommand) {
      throw new Error("Failed to store command in Firestore")
    }

    // Update command status to running
    await updateCommandStatus(storedCommand.id, "running")

    // Execute the command on desktop applications if needed
    if (intent.type !== "unknown" && intent.type !== "error" && intent.target) {
      const desktopCommand: DesktopAppCommand = {
        app: intent.target,
        action: intent.action,
        parameters: intent.parameters,
      }

      const desktopResult = await executeDesktopCommand(desktopCommand)

      // Update command status with result
      await updateCommandStatus(storedCommand.id, desktopResult.success ? "completed" : "failed", desktopResult)
    } else if (intent.type === "automate") {
      // Handle automation commands
      const automationResponse = await processAutomationCommand(intent)
      await updateCommandStatus(storedCommand.id, "completed", { automationResponse })
    } else {
      // Update command status to completed for other commands
      await updateCommandStatus(storedCommand.id, "completed")
    }
  } catch (error) {
    console.error("Error processing command:", error)
    // Update command status to failed if an error occurred
    if (error instanceof Error && error.message) {
      await updateCommandStatus(error.message, "failed", { error: error.message })
    }
  }
}

export const processUserCommand = async (input: string): Promise<CommandIntent> => {
  // This is a placeholder, replace with your actual Groq processing logic
  return { type: "unknown", action: "process_text", parameters: { text: input }, rawInput: input }
}

export const generateCommandResponse = async (intent: CommandIntent): Promise<string> => {
  // This is a placeholder, replace with your actual response generation logic
  return "Processing your command..."
}
