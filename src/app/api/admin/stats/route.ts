import { getAdminStats } from "@/lib/services/admin-stats-service"

export function GET() {
  return Response.json(getAdminStats())
}
