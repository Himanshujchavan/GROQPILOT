import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    // Get the request body
    const body = await req.json()

    // Log the received body for debugging
    console.log("Received request body:", body)

    // Extract message and history from the request body
    const { message, history } = body

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Initialize formatted messages array with the history if it exists
    const formattedMessages = []

    // Add system message
    formattedMessages.push({
      role: "system",
      content: "You are a helpful AI assistant that provides clear and concise answers.",
    })

    // Add history messages if they exist
    if (history && Array.isArray(history)) {
      history.forEach((msg) => {
        if (msg && msg.role && msg.content) {
          formattedMessages.push({
            role: msg.role,
            content: msg.content,
          })
        }
      })
    }

    // Add the current user message
    formattedMessages.push({
      role: "user",
      content: message,
    })

    console.log("Formatted messages:", formattedMessages)

    // Generate response using the AI SDK
    const { text } = await generateText({
      model: groq("llama3-70b-8192"),
      messages: formattedMessages,
      temperature: 0.7,
      maxTokens: 1000,
    })

    return NextResponse.json({ response: text })
  } catch (error: any) {
    console.error("AI Chat API error:", error)

    // Return a more detailed error response
    return NextResponse.json(
      {
        error: error.message || "Failed to generate response",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
