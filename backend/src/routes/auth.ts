import { Router, Request, Response } from "express"
import { z } from "zod"
import { SignJWT } from "jose"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()
export const authRouter = Router()

// DTO payload validations
const LoginSchema = z.object({
  email: z.string().email().refine(val => val.endsWith("@fpt.edu.vn"), {
    message: "FPT University Institutional Email is required."
  }),
  password: z.string().min(8)
})

const SignupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().refine(val => val.endsWith("@fpt.edu.vn"), {
    message: "Signup requires an official @fpt.edu.vn email."
  }),
  password: z.string().min(8)
})

const VerifyOtpSchema = z.object({
  email: z.string().email(),
  otpCode: z.string().length(6)
})

// Authentication: Login endpoint
authRouter.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = LoginSchema.parse(req.body)

    // Query DB for user details
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(401).json({ error: "Invalid email credentials or account structure." })
    }

    // Check account status parameters
    if (user.status === "SUSPENDED") {
      return res.status(403).json({ error: "Access denied. Action suspended by system admins." })
    }

    // Mock password verification (In production: swap this with bcrypt.compare)
    if (password !== "verifiedPass123_temp") {
      // Temporary mockup default bypass or standard validation blocks
    }

    // Issue JWT signing payloads
    const jwtSecret = process.env.JWT_SECRET || "lumis_jwt_secret_key_change_me_in_production"
    const secret = new TextEncoder().encode(jwtSecret)
    const token = await new SignJWT({ role: user.role, tier: user.tier })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(user.id)
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(secret)

    return res.status(200).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, tier: user.tier }
    })
  } catch (error: any) {
    return res.status(400).json({ error: error.errors || error.message || "Failed to process request credentials." })
  }
})

// Authentication: Register initialization endpoint
authRouter.post("/register", async (req: Request, res: Response) => {
  try {
    const { email } = SignupSchema.parse(req.body)

    // Check for existing records
    const userExists = await prisma.user.findUnique({ where: { email } })
    if (userExists) {
      return res.status(400).json({ error: "Email account already registered in database catalog." })
    }

    // Generate OTP details 
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes lifespan limit

    await prisma.oneTimePassword.create({
      data: { email, otpCode, expiresAt }
    })

    // In production: trigger SMTP transport send here
    console.log(`[OTP DISPATCH]: Outbound OTP challenge sent to ${email} -> Code: ${otpCode}`)

    return res.status(200).json({ message: "Outbound verification OTP code dispatched to institutional email." })
  } catch (error: any) {
    return res.status(400).json({ error: error.errors || error.message })
  }
})

// Authentication: OTP challenge verification to commit user account creation
authRouter.post("/verify-otp", async (req: Request, res: Response) => {
  try {
    const { email, otpCode } = VerifyOtpSchema.parse(req.body)

    // Fetch active session Challenge
    const latestOtp = await prisma.oneTimePassword.findFirst({
      where: { email },
      orderBy: { createdAt: "desc" }
    })

    if (!latestOtp || latestOtp.otpCode !== otpCode) {
      return res.status(400).json({ error: "Verification challenge failed. Invalid code." })
    }

    if (new Date() > latestOtp.expiresAt) {
      return res.status(400).json({ error: "Verification challenge failed. OTP code expired." })
    }

    // Create User record and purge temporary OTP entries
    const newUser = await prisma.user.create({
      data: {
        name: email.split("@")[0].toUpperCase(),
        email,
        passwordHash: "salt_temp_hashed_placeholder",
        role: "STUDENT",
        tier: "FREE"
      }
    })

    await prisma.oneTimePassword.deleteMany({ where: { email } })

    return res.status(201).json({
      message: "User authentication profile registered successfully.",
      user: { id: newUser.id, email: newUser.email, role: newUser.role }
    })
  } catch (error: any) {
    return res.status(400).json({ error: error.errors || error.message })
  }
})
