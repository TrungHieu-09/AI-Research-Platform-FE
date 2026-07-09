import { getNotifications } from "@/lib/services/notification-service"

export function GET() {
  return Response.json(getNotifications())
}
