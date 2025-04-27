import { NextResponse } from "next/server"

// Simple responses for different types of queries
const FALLBACK_RESPONSES: Record<string, string[]> = {
  greeting: [
    "Hello! How can I assist you today?",
    "Hi there! What can I help you with?",
    "Greetings! How may I be of service?",
  ],
  help: [
    "I can help with various tasks like answering questions, providing information, or assisting with simple problems. What do you need help with?",
    "I'm here to assist you! I can answer questions, provide explanations, or help you find information. What would you like to know?",
  ],
  thanks: [
    "You're welcome! Is there anything else I can help with?",
    "Happy to help! Let me know if you need anything else.",
    "My pleasure! Feel free to ask if you have more questions.",
  ],
  default: [
    "That's an interesting question. I'd like to provide more information when I'm back online.",
    "I understand what you're asking. When I'm fully connected, I can give you a more detailed answer.",
    "Thanks for your question. I'll be able to help better when my connection to the AI service is restored.",
    "I appreciate your patience. This would be easier to answer when I have full access to my knowledge base.",
  ],
}

export async function POST(req: Request) {
  try {
    const { message } = await req.json()

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Determine the type of message
    const lowerMessage = message.toLowerCase()
    let responseType = "default"

    if (lowerMessage.includes("hello") || lowerMessage.includes("hi ") || lowerMessage === "hi") {
      responseType = "greeting"
    } else if (lowerMessage.includes("help") || lowerMessage.includes("assist")) {
      responseType = "help"
    } else if (lowerMessage.includes("thank")) {
      responseType = "thanks"
    }

    // Get responses for this type
    const responses = FALLBACK_RESPONSES[responseType]

    // Select a random response
    const randomIndex = Math.floor(Math.random() * responses.length)
    const response = responses[randomIndex]

    return NextResponse.json({ response })
  } catch (error: any) {
    console.error("Fallback API error:", error)
    return NextResponse.json(
      {
        error: error.message || "Failed to generate response",
      },
      { status: 500 },
    )
  }
}
