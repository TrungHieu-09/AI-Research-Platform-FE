import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { UpdateSubjectSchema } from "@/lib/validation/subject"

/**
 * @swagger
 * /api/subjects/{id}:
 *   get:
 *     summary: Get Subject Detail
 *     tags: [Subjects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Subject detail
 *   put:
 *     summary: Edit Subject Metadata
 *     tags: [Subjects]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               status: { type: string }
 *     responses:
 *       200:
 *         description: Subject updated
 *   delete:
 *     summary: Disable/Remove Subject
 *     tags: [Subjects]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Subject removed
 */
// GET /api/subjects/[id]
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const subject = await db.subject.findUnique({ where: { id: params.id } })
  if (!subject) return NextResponse.json({ error: "Subject not found." }, { status: 404 })
  return NextResponse.json(subject)
}

// PUT /api/subjects/[id] — Admin only
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const parsed = UpdateSubjectSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 })
    }

    const subject = await db.subject.update({ where: { id: params.id }, data: parsed.data })
    return NextResponse.json(subject)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}

// DELETE /api/subjects/[id] — Admin only (sets status to SUSPENDED)
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const subject = await db.subject.update({
      where: { id: params.id },
      data: { status: "SUSPENDED" },
    })
    return NextResponse.json({ message: "Subject deactivated.", subject })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
