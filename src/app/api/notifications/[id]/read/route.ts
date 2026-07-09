import { markNotificationRead } from "@/lib/services/notification-service"

export async function PUT(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const notification = markNotificationRead(id)

  if (!notification) {
    return Response.json(
      {
        error: "Notification not found.",
      },
      { status: 404 }
    )
  }

  return Response.json(notification)
}
