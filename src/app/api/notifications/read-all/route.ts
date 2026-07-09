import { markAllNotificationsRead } from "@/lib/services/notification-service"

export function PUT() {
  return Response.json(markAllNotificationsRead())
}
