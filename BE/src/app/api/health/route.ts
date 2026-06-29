import { NextResponse } from "next/server"

// Health check  GET /api/health
export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "Lumis Backend API",
    timestamp: new Date().toISOString(),
  })
}
