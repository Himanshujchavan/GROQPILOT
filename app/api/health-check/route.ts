import { NextResponse } from "next/server"

export async function GET() {
  // This is a simple health check endpoint that always returns success
  return NextResponse.json({ status: "ok", message: "Server is running" })
}
