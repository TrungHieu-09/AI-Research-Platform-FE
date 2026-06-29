import { NextRequest, NextResponse } from "next/server"
import { LoginSchema } from "@/lib/validation/auth"
import { loginUser } from "@/lib/services/auth-service"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = LoginSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 })
    }

    const result = await loginUser(parsed.data)
    return NextResponse.json(result, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Login failed." }, { status: 401 })
  }
}
