import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description: string
  href?: string
  trend?: {
    value: number
    isUp: boolean
  }
}

export function StatCard({ title, value, icon: Icon, description, href, trend }: StatCardProps) {
  const CardContent = (
    <div className="flex items-start justify-between">
      <div>
        <p className="text-[11px] font-bold text-[#727785] uppercase tracking-wider mb-1.5 group-hover:text-[#0058be] transition-colors">
          {title}
        </p>
        <h3 className="text-3xl font-bold tracking-tight text-[#121c2a] mb-2">{value}</h3>
        <div className="flex items-center gap-2">
          {trend && (
            <span
              className={cn(
                "text-[11px] font-bold px-2 py-0.5 rounded-md",
                trend.isUp ? "bg-green-50 text-green-700 border border-green-200/60" : "bg-red-50 text-red-700 border border-red-200/60"
              )}
            >
              {trend.isUp ? "+" : "-"}{trend.value}%
            </span>
          )}
          <p className="text-[12px] text-[#424754] line-clamp-1 font-medium">{description}</p>
        </div>
      </div>
      <div className="p-3.5 rounded-2xl bg-[#eff4ff] text-[#0058be] group-hover:bg-[#0058be] group-hover:text-white transition-all shadow-sm">
        <Icon size={22} />
      </div>
    </div>
  )

  const className = "bg-white p-6 rounded-3xl border border-[#c2c6d6]/40 shadow-sm hover:border-[#0058be]/30 hover:shadow-md transition-all group block"

  if (href) {
    return (
      <Link href={href} className={cn(className, "cursor-pointer")}>
        {CardContent}
      </Link>
    )
  }

  return (
    <div className={cn(className, "cursor-default")}>
      {CardContent}
    </div>
  )
}

