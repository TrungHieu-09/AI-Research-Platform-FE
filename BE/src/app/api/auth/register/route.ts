import { NextRequest, NextResponse } from "next/server"
import { SignupSchema } from "@/lib/validation/auth"
import { registerUser } from "@/lib/services/auth-service"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = SignupSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 })
    }

    const result = await registerUser(parsed.data)
    return NextResponse.json(result, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Registration failed." }, { status: 400 })
  }
}
