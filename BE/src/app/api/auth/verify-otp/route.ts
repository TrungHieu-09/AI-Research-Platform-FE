import { NextRequest, NextResponse } from "next/server"
import { VerifyOtpSchema } from "@/lib/validation/auth"
import { verifyOtp } from "@/lib/services/auth-service"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = VerifyOtpSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 })
    }

    const result = await verifyOtp(parsed.data)
    return NextResponse.json(result, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "OTP verification failed." }, { status: 400 })
  }
}
