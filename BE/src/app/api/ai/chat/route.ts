import { NextRequest, NextResponse } from "next/server"
import { processChatQuery } from "@/lib/services/ai-service"

// POST /api/ai/chat — RAG chat query
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id")!
    const body = await req.json()
    const { message, sessionId, documentId, subjectId, scope } = body

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "message is required." }, { status: 422 })
    }
    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json({ error: "sessionId is required." }, { status: 422 })
    }

    const result = await processChatQuery(userId, message, sessionId, documentId, subjectId, scope)
    return NextResponse.json(result)
  } catch (err: any) {
    const status = err.message?.includes("limit exceeded") ? 429 : 500
    return NextResponse.json({ error: err.message }, { status })
  }
}
