import { NextRequest, NextResponse } from "next/server"
import { PresignedUrlSchema } from "@/lib/validation/doc"
import { getPresignedUploadUrl } from "@/lib/storage"

/**
 * @swagger
 * /api/documents/upload-url:
 *   post:
 *     summary: Get Presigned Upload URL
 *     tags: [Documents]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fileName: { type: string }
 *               mimeType: { type: string }
 *     responses:
 *       200:
 *         description: Presigned URL generated
 */
// POST /api/documents/upload-url — returns a presigned S3 upload URL
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id")!
    const body = await req.json()
    const parsed = PresignedUrlSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 })
    }

    const { filename, mimeType } = parsed.data
    const result = await getPresignedUploadUrl(userId, filename, mimeType)

    return NextResponse.json(result)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
