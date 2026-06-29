import { Router, Response } from "express"
import { PrismaClient } from "@prisma/client"
import { AuthenticatedRequest, requireAuth, requireRole } from "../middlewares/auth.js"
import { z } from "zod"

const prisma = new PrismaClient()
export const docRouter = Router()

// Moderate DTO Schema
const ModerateDocumentSchema = z.object({
  action: z.enum(["APPROVED", "REJECTED"]),
  rejectionReason: z.string().optional()
})

// Add Auth guard globally to all document actions
docRouter.use(requireAuth)

// Fetch user's accessible library documents list
docRouter.get("/", async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id
  const role = req.user?.role

  try {
    let docs

    if (role === "ADMIN" || role === "MODERATOR") {
      // Moderators and System Admins see everything, including pending approvals
      docs = await prisma.document.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" }
      })
    } else {
      // Students see only their private documents vs. globally approved ones
      docs = await prisma.document.findMany({
        where: {
          deletedAt: null,
          OR: [
            { ownerId: userId },
            { visibility: "PUBLIC", status: "APPROVED" }
          ]
        },
        orderBy: { createdAt: "desc" }
      })
    }

    return res.status(200).json(docs)
  } catch (error: any) {
    return res.status(500).json({ error: error.message })
  }
})

// Fetch single document details
docRouter.get("/:id", async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params

  try {
    const document = await prisma.document.findUnique({
      where: { id },
      include: { owner: true, subject: true }
    })

    if (!document || document.deletedAt !== null) {
      return res.status(404).json({ error: "Academic document record not found in system catalogs." })
    }

    return res.status(200).json(document)
  } catch (error: any) {
    return res.status(500).json({ error: error.message })
  }
})

// Delete document (Supports the required Soft-Delete 30-day lifecycle)
docRouter.delete("/:id", async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params
  const userId = req.user?.id

  try {
    const document = await prisma.document.findUnique({ where: { id } })
    
    if (!document || document.deletedAt !== null) {
      return res.status(404).json({ error: "Academic document record not found." })
    }

    // Direct owner verification or admin privileges check
    if (document.ownerId !== userId && req.user?.role !== "ADMIN") {
      return res.status(403).json({ error: "Access denied. Action exceeds ownership privileges." })
    }

    // Set deletedAt timestamp (Soft-Delete)
    await prisma.document.update({
      where: { id },
      data: { deletedAt: new Date() }
    })

    return res.status(200).json({ message: "Document moved to Trash. This file will be permanently deleted in 30 days." })
  } catch (error: any) {
    return res.status(500).json({ error: error.message })
  }
})

// Moderator: Approve / Reject custom route
docRouter.post("/:id/moderate", requireRole("MODERATOR"), async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params
  const moderatorId = req.user?.id

  try {
    const { action, rejectionReason } = ModerateDocumentSchema.parse(req.body)

    const document = await prisma.document.findUnique({ where: { id } })
    if (!document || document.deletedAt !== null) {
      return res.status(404).json({ error: "Academic document record not found." })
    }

    const updatedDoc = await prisma.document.update({
      where: { id },
      data: {
        status: action,
        rejectionReason: action === "REJECTED" ? rejectionReason : null,
        moderatedById: moderatorId,
        moderatedAt: new Date()
      }
    })

    // In production: trigger chunking / Embedding API triggers right here
    if (action === "APPROVED") {
      console.log(`[WORKER TRIGGER]: Invoking background task to vectorize file ID: ${id}`)
    }

    return res.status(200).json({ message: `Document moderation completed. Result: ${action}`, document: updatedDoc })
  } catch (error: any) {
    return res.status(400).json({ error: error.errors || error.message })
  }
})
