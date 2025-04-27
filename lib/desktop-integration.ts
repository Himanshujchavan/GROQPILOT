// Desktop integration utilities for interacting with native applications using Tauri
import { executeDesktopCommandWeb, sendDesktopNotificationWeb } from "./desktop-integration-web"

export interface DesktopAppCommand {
  app: string
  action: string
  parameters?: Record<string, any>
}

export async function executeDesktopCommand(command: DesktopAppCommand): Promise<{
  success: boolean
  result?: any
  error?: string
}> {
  console.log(`Executing desktop command: ${command.app} - ${command.action}`, command.parameters)

  try {
    // Check if we're running in a Tauri environment
    let isTauri = false
    try {
      // Dynamic import to avoid issues in non-Tauri environments
      const { invoke } = await import("@tauri-apps/api/tauri")
      isTauri = true
    } catch (e) {
      console.log("Not running in Tauri environment, using web fallbacks")
      isTauri = false
    }

    // If not running in Tauri, use web fallbacks
    if (!isTauri) {
      return executeDesktopCommandWeb(command)
    }

    // Import Tauri APIs dynamically to avoid issues in non-Tauri environments
    const { invoke } = await import("@tauri-apps/api/tauri")
    const { open } = await import("@tauri-apps/api/shell")
    const { save, open: openDialog } = await import("@tauri-apps/api/dialog")
    const { readTextFile, writeTextFile } = await import("@tauri-apps/api/fs")

    // Handle different app types
    switch (command.app.toLowerCase()) {
      case "email":
        return await handleEmailApp(command, { invoke })
      case "browser":
        return await handleBrowserApp(command, { invoke, open })
      case "crm":
        return await handleCrmApp(command, { invoke })
      case "files":
        return await handleFilesApp(command, { invoke, save, openDialog, readTextFile, writeTextFile })
      default:
        return {
          success: false,
          error: `Application "${command.app}" is not supported or not installed`,
        }
    }
  } catch (error) {
    console.error("Error executing desktop command:", error)
    return {
      success: false,
      error: `Failed to execute command: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

async function handleEmailApp(command: DesktopAppCommand, apis: { invoke: any }) {
  const { invoke } = apis

  switch (command.action.toLowerCase()) {
    case "summarize":
      // Call the Rust function to summarize emails
      try {
        const summaryResult = await invoke("email_summarize")
        return {
          success: true,
          result: JSON.parse(summaryResult as string),
        }
      } catch (error) {
        return {
          success: false,
          error: `Failed to summarize emails: ${error instanceof Error ? error.message : String(error)}`,
        }
      }

    case "compose":
      // Call the Rust function to compose an email
      try {
        const composeResult = await invoke("email_compose", {
          recipient: command.parameters?.recipient || "recipient@example.com",
          subject: command.parameters?.subject || "New Email",
          body: command.parameters?.body || "",
        })
        return {
          success: true,
          result: JSON.parse(composeResult as string),
        }
      } catch (error) {
        return {
          success: false,
          error: `Failed to compose email: ${error instanceof Error ? error.message : String(error)}`,
        }
      }

    default:
      return {
        success: false,
        error: `Action "${command.action}" is not supported for email application`,
      }
  }
}

async function handleBrowserApp(command: DesktopAppCommand, apis: { invoke: any; open: any }) {
  const { invoke, open } = apis

  switch (command.action.toLowerCase()) {
    case "open":
      // Use Tauri's shell.open to open a URL in the default browser
      const url = command.parameters?.url || "https://example.com"

      if (command.parameters?.useRust === true) {
        // Use the Rust implementation
        try {
          const openResult = await invoke("browser_open", { url })
          return {
            success: true,
            result: JSON.parse(openResult as string),
          }
        } catch (error) {
          return {
            success: false,
            error: `Failed to open URL: ${error instanceof Error ? error.message : String(error)}`,
          }
        }
      } else {
        // Use the JavaScript API
        try {
          await open(url)
          return {
            success: true,
            result: {
              opened: true,
              url,
            },
          }
        } catch (error) {
          return {
            success: false,
            error: `Failed to open URL: ${error instanceof Error ? error.message : String(error)}`,
          }
        }
      }

    case "search":
      // Call the Rust function to search the web
      try {
        const query = command.parameters?.query || "default query"
        const searchResult = await invoke("browser_search", { query })
        return {
          success: true,
          result: JSON.parse(searchResult as string),
        }
      } catch (error) {
        return {
          success: false,
          error: `Failed to search: ${error instanceof Error ? error.message : String(error)}`,
        }
      }

    default:
      return {
        success: false,
        error: `Action "${command.action}" is not supported for browser application`,
      }
  }
}

async function handleCrmApp(command: DesktopAppCommand, apis: { invoke: any }) {
  const { invoke } = apis

  switch (command.action.toLowerCase()) {
    case "find_customer":
      // Call the Rust function to find a customer in the CRM
      try {
        const name = command.parameters?.name || "John Doe"
        const customerResult = await invoke("crm_find_customer", { name })
        return {
          success: true,
          result: JSON.parse(customerResult as string),
        }
      } catch (error) {
        return {
          success: false,
          error: `Failed to find customer: ${error instanceof Error ? error.message : String(error)}`,
        }
      }

    case "create_lead":
      // In a real implementation, this would call a CRM API
      // For now, we'll return a simulated response
      return {
        success: true,
        result: {
          leadCreated: true,
          leadId: "LD-" + Math.floor(Math.random() * 10000),
          leadName: command.parameters?.name || "New Lead",
        },
      }

    default:
      return {
        success: false,
        error: `Action "${command.action}" is not supported for CRM application`,
      }
  }
}

async function handleFilesApp(
  command: DesktopAppCommand,
  apis: {
    invoke: any
    save: any
    openDialog: any
    readTextFile: any
    writeTextFile: any
  },
) {
  const { invoke, save, openDialog, readTextFile, writeTextFile } = apis

  switch (command.action.toLowerCase()) {
    case "search":
      // Call the Rust function to search for files
      try {
        const query = command.parameters?.query || ""
        const searchResult = await invoke("files_search", { query })
        return {
          success: true,
          result: JSON.parse(searchResult as string),
        }
      } catch (error) {
        return {
          success: false,
          error: `Failed to search files: ${error instanceof Error ? error.message : String(error)}`,
        }
      }

    case "organize":
      // Call the Rust function to organize files
      try {
        const source = command.parameters?.source || "Downloads"
        const destination = command.parameters?.destination || "Organized Files"
        const organizeResult = await invoke("files_organize", { source, destination })
        return {
          success: true,
          result: JSON.parse(organizeResult as string),
        }
      } catch (error) {
        return {
          success: false,
          error: `Failed to organize files: ${error instanceof Error ? error.message : String(error)}`,
        }
      }

    case "save":
      // Use Tauri's dialog API to save a file
      try {
        const filePath = await save({
          filters: [
            {
              name: "Text",
              extensions: ["txt", "md"],
            },
          ],
        })

        if (filePath) {
          await writeTextFile(filePath, command.parameters?.content || "")
          return {
            success: true,
            result: {
              saved: true,
              path: filePath,
            },
          }
        } else {
          return {
            success: false,
            error: "Save operation cancelled",
          }
        }
      } catch (error) {
        return {
          success: false,
          error: `Failed to save file: ${error instanceof Error ? error.message : String(error)}`,
        }
      }

    case "open":
      // Use Tauri's dialog API to open a file
      try {
        const filePath = await openDialog({
          filters: [
            {
              name: "All Files",
              extensions: ["*"],
            },
          ],
        })

        if (filePath && typeof filePath === "string") {
          const content = await readTextFile(filePath)
          return {
            success: true,
            result: {
              opened: true,
              path: filePath,
              content,
            },
          }
        } else {
          return {
            success: false,
            error: "Open operation cancelled",
          }
        }
      } catch (error) {
        return {
          success: false,
          error: `Failed to open file: ${error instanceof Error ? error.message : String(error)}`,
        }
      }

    default:
      return {
        success: false,
        error: `Action "${command.action}" is not supported for files application`,
      }
  }
}

// Helper function to send desktop notifications
export async function sendDesktopNotification(title: string, body: string) {
  try {
    // Check if we're running in a Tauri environment
    let isTauri = false
    try {
      // Dynamic import to avoid issues in non-Tauri environments
      const { isPermissionGranted } = await import("@tauri-apps/api/notification")
      isTauri = true
    } catch (e) {
      console.log("Not running in Tauri environment, using web fallbacks for notifications")
      isTauri = false
    }

    // If not running in Tauri, use web fallbacks
    if (!isTauri) {
      return sendDesktopNotificationWeb(title, body)
    }

    // Import Tauri APIs dynamically to avoid issues in non-Tauri environments
    const { isPermissionGranted, requestPermission, sendNotification } = await import("@tauri-apps/api/notification")

    let permissionGranted = await isPermissionGranted()
    if (!permissionGranted) {
      const permission = await requestPermission()
      permissionGranted = permission === "granted"
    }

    if (permissionGranted) {
      await sendNotification({ title, body })
      return true
    }
    return false
  } catch (error) {
    console.error("Failed to send notification:", error)
    return false
  }
}
