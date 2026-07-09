import type { NextRequest } from "next/server"
import type { AdminStatsRange } from "@/lib/mocks/admin-stats"
import { getDocumentStats } from "@/lib/services/admin-stats-service"

const validRanges: AdminStatsRange[] = ["7d", "30d"]

export function GET(request: NextRequest) {
  const rangeParam = request.nextUrl.searchParams.get("range") ?? "7d"

  if (!isAdminStatsRange(rangeParam)) {
    return Response.json(
      {
        error: "Invalid range. Expected '7d' or '30d'.",
      },
      { status: 400 }
    )
  }

  return Response.json(getDocumentStats(rangeParam))
}

function isAdminStatsRange(range: string): range is AdminStatsRange {
  return validRanges.includes(range as AdminStatsRange)
}
