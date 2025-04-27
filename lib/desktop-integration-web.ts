// Web fallbacks for desktop integration when not running in Tauri
import type { DesktopAppCommand } from "./desktop-integration"

export async function executeDesktopCommandWeb(command: DesktopAppCommand): Promise<{
  success: boolean
  result?: any
  error?: string
}> {
  console.log(`[Web Fallback] Executing desktop command: ${command.app} - ${command.action}`, command.parameters)

  // Simulate processing time
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Simulate responses for different app types
  switch (command.app.toLowerCase()) {
    case "email":
      return handleEmailAppWeb(command)
    case "browser":
      return handleBrowserAppWeb(command)
    case "crm":
      return handleCrmAppWeb(command)
    case "files":
      return handleFilesAppWeb(command)
    default:
      return {
        success: false,
        error: `Application "${command.app}" is not supported in web mode`,
      }
  }
}

function handleEmailAppWeb(command: DesktopAppCommand) {
  switch (command.action.toLowerCase()) {
    case "summarize":
      return {
        success: true,
        result: {
          summary: "You have 3 unread emails. Most important from Sarah about the quarterly report due tomorrow.",
          unreadCount: 3,
          importantCount: 1,
        },
      }
    case "compose":
      // In web mode, we could open mailto: link
      if (command.parameters?.recipient) {
        const subject = encodeURIComponent(command.parameters?.subject || "")
        const body = encodeURIComponent(command.parameters?.body || "")
        window.open(`mailto:${command.parameters.recipient}?subject=${subject}&body=${body}`)
      }

      return {
        success: true,
        result: {
          drafted: true,
          to: command.parameters?.recipient || "recipient@example.com",
          subject: command.parameters?.subject || "New Email",
        },
      }
    default:
      return {
        success: false,
        error: `Action "${command.action}" is not supported for email application in web mode`,
      }
  }
}

function handleBrowserAppWeb(command: DesktopAppCommand) {
  switch (command.action.toLowerCase()) {
    case "open":
      // In web mode, we can open a new tab
      const url = command.parameters?.url || "https://example.com"
      window.open(url, "_blank")

      return {
        success: true,
        result: {
          opened: true,
          url,
        },
      }
    case "search":
      // In web mode, we can open a search in a new tab
      const query = encodeURIComponent(command.parameters?.query || "")
      window.open(`https://www.google.com/search?q=${query}`, "_blank")

      return {
        success: true,
        result: {
          searchResults: `Opened search results for "${command.parameters?.query || "default query"}"`,
          topResult: "Example search result",
        },
      }
    default:
      return {
        success: false,
        error: `Action "${command.action}" is not supported for browser application in web mode`,
      }
  }
}

function handleCrmAppWeb(command: DesktopAppCommand) {
  switch (command.action.toLowerCase()) {
    case "find_customer":
      return {
        success: true,
        result: {
          customerFound: true,
          customerName: command.parameters?.name || "John Doe",
          recentInteractions: [
            { date: "2023-04-20", type: "Email", summary: "Product inquiry" },
            { date: "2023-04-15", type: "Call", summary: "Support request" },
          ],
        },
      }
    case "create_lead":
      return {
        success: true,
        result: {
          leadCreated: true,
          leadId: "LD-" + Math.floor(Math.random() * 10000),
        },
      }
    default:
      return {
        success: false,
        error: `Action "${command.action}" is not supported for CRM application in web mode`,
      }
  }
}

function handleFilesAppWeb(command: DesktopAppCommand) {
  switch (command.action.toLowerCase()) {
    case "search":
      return {
        success: true,
        result: {
          filesFound: [
            { name: "report.docx", path: "/Documents/Work/report.docx", modified: "2023-04-18" },
            { name: "presentation.pptx", path: "/Documents/Work/presentation.pptx", modified: "2023-04-15" },
          ],
        },
      }
    case "organize":
      return {
        success: true,
        result: {
          organized: true,
          filesMoved: 12,
          destination: command.parameters?.destination || "Organized Files",
        },
      }
    default:
      return {
        success: false,
        error: `Action "${command.action}" is not supported for files application in web mode`,
      }
  }
}

// Web fallback for desktop notifications
export async function sendDesktopNotificationWeb(title: string, body: string): Promise<boolean> {
  try {
    // Check if the browser supports notifications
    if (!("Notification" in window)) {
      console.log("This browser does not support desktop notifications")
      return false
    }

    // Check if permission is already granted
    if (Notification.permission === "granted") {
      new Notification(title, { body })
      return true
    }

    // Otherwise, ask for permission
    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission()

      if (permission === "granted") {
        new Notification(title, { body })
        return true
      }
    }

    return false
  } catch (error) {
    console.error("Failed to send notification:", error)
    return false
  }
}
