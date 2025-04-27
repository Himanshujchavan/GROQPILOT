import { type NextRequest, NextResponse } from "next/server"
import { processCommand } from "@/lib/command-processor"

export async function POST(request: NextRequest) {
  try {
    const { command } = await request.json()

    if (!command) {
      return NextResponse.json({ error: "Command is required" }, { status: 400 })
    }

    // Process the command
    const result = await processCommand(command)

    return NextResponse.json({ result })
  } catch (error) {
    console.error("Error processing command:", error)
    return NextResponse.json({ error: "Failed to process command" }, { status: 500 })
  }
}
