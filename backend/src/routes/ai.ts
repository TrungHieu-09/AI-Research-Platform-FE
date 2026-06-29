import { Router, Response } from "express"
import { PrismaClient } from "@prisma/client"
import { AuthenticatedRequest, requireAuth } from "../middlewares/auth.js"
import { z } from "zod"

const prisma = new PrismaClient()
export const aiRouter = Router()

// Request validation schema
const AIQuerySchema = z.object({
  message: z.string().min(2),
  sessionId: z.string().uuid().optional(),
  documentId: z.string().uuid().optional(),
  scope: z.enum(["SINGLE_DOCUMENT", "SUBJECT", "GLOBAL"]).default("SINGLE_DOCUMENT")
})

// Apply Auth guard globally to all AI actions
aiRouter.use(requireAuth)

// AI Workspace query handler with RAG and custom citation indexes
aiRouter.post("/chat", async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id
  const tier = req.user?.tier

  try {
    const { message, documentId } = AIQuerySchema.parse(req.body)

    // Check account-level chat query limits by date
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayUsageCount = await prisma.auditLog.count({
      where: {
        userId,
        action: "AI_QUERY",
        createdAt: { gte: today }
      }
    })

    const dailyLimit = tier === "PREMIUM" ? 50 : 10
    if (todayUsageCount >= dailyLimit) {
      return res.status(429).json({ error: "Daily AI query volume limit details met. Standard users are capped at 10 requests daily." })
    }

    // Record this prompt audit entry 
    await prisma.auditLog.create({
      data: {
        userId,
        action: "AI_QUERY",
        targetEntity: "chat_sessions"
      }
    })

    // Mock query processing
    // In production: perform pgvector cosine comparison, assemble prompts, resolve OpenAI streaming response chunks
    return res.status(200).json({
      answer: `This is a processed synthesis for prompt: "${message}". Process allocations and memory states look good.`,
      citations: [
        {
          index: 1,
          documentTitle: "Operating Systems Lecture Notes",
          pageNumber: 12,
          excerpt: "Process scheduling controls the selection of the next process executing on the CPU core using Round Robin or Priority schedulers."
        }
      ]
    })

  } catch (error: any) {
    return res.status(400).json({ error: error.errors || error.message })
  }
})

// Retrieve remaining token requests
aiRouter.get("/limit", async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id
  const tier = req.user?.tier

  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayQueries = await prisma.auditLog.count({
      where: {
        userId,
        action: "AI_QUERY",
        createdAt: { gte: today }
      }
    })

    const limit = tier === "PREMIUM" ? 50 : 10
    
    return res.status(200).json({
      used: todayQueries,
      limit,
      remaining: Math.max(0, limit - todayQueries)
    })
  } catch (error: any) {
    return res.status(500).json({ error: error.message })
  }
})
