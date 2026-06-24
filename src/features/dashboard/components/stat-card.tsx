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
        <p className="text-[14px] font-medium text-on-surface-variant mb-1 group-hover:text-primary transition-colors">
          {title}
        </p>
        <h3 className="text-3xl font-bold tracking-tight text-on-surface mb-2">{value}</h3>
        <div className="flex items-center gap-2">
          {trend && (
            <span
              className={cn(
                "text-[12px] font-bold px-1.5 py-0.5 rounded-md",
                trend.isUp ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              )}
            >
              {trend.isUp ? "+" : "-"}{trend.value}%
            </span>
          )}
          <p className="text-[12px] text-on-surface-variant line-clamp-1">{description}</p>
        </div>
      </div>
      <div className="p-3 rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all">
        <Icon size={24} />
      </div>
    </div>
  )

  const className = "glass-panel p-6 border border-outline-variant hover:border-primary/30 transition-all group block"

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
