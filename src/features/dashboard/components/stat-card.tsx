"use client"

import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { motion, useInView, useMotionValue, useSpring } from "framer-motion"
import { useRef, useState, useEffect } from "react"

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
  index?: number
}

/* ─── Animated Number ─────────────────────── */
function AnimatedValue({ value }: { value: string | number }) {
  const ref = useRef<HTMLHeadingElement>(null)
  const inView = useInView(ref, { once: true })

  // Try to parse numeric value (strip non-digit chars except dot)
  const numericStr = String(value).replace(/[^0-9.]/g, "")
  const numeric = parseFloat(numericStr)
  const isNumeric = !isNaN(numeric)
  const suffix = String(value).replace(/[0-9.,]/g, "") // e.g. "%" or ""

  const motionVal = useMotionValue(0)
  const spring = useSpring(motionVal, { damping: 28, stiffness: 70 })
  const [display, setDisplay] = useState("0")

  useEffect(() => {
    if (inView && isNumeric) motionVal.set(numeric)
  }, [inView, numeric, isNumeric, motionVal])

  useEffect(() => {
    return spring.on("change", v => {
      const formatted = v >= 1000
        ? v.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        : v.toFixed(0)
      setDisplay(formatted)
    })
  }, [spring])

  if (!isNumeric) {
    return <h3 className="text-3xl font-bold tracking-tight text-[#121c2a] mb-2">{value}</h3>
  }

  return (
    <h3 ref={ref} className="text-3xl font-bold tracking-tight text-[#121c2a] mb-2">
      {display}{suffix}
    </h3>
  )
}

export function StatCard({ title, value, icon: Icon, description, href, trend, index = 0 }: StatCardProps) {
  const CardContent = (
    <div className="flex items-start justify-between">
      <div>
        <p className="text-[11px] font-bold text-[#727785] uppercase tracking-wider mb-1.5 group-hover:text-[#0058be] transition-colors">
          {title}
        </p>
        <AnimatedValue value={value} />
        <div className="flex items-center gap-2">
          {trend && (
            <motion.span
              className={cn(
                "text-[11px] font-bold px-2 py-0.5 rounded-md",
                trend.isUp ? "bg-green-50 text-green-700 border border-green-200/60" : "bg-red-50 text-red-700 border border-red-200/60"
              )}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.08, type: "spring", stiffness: 200 }}
            >
              {trend.isUp ? "+" : "-"}{trend.value}%
            </motion.span>
          )}
          <p className="text-[12px] text-[#424754] line-clamp-1 font-medium">{description}</p>
        </div>
      </div>
      <motion.div
        className="p-3.5 rounded-2xl bg-[#eff4ff] text-[#0058be] group-hover:bg-[#0058be] group-hover:text-white transition-all shadow-sm"
        whileHover={{ scale: 1.15, rotate: 8 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <Icon size={22} />
      </motion.div>
    </div>
  )

  const baseClass = "bg-white p-6 rounded-3xl border border-[#c2c6d6]/40 shadow-sm transition-all group block"

  const wrapper = (children: React.ReactNode) => (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.09, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, boxShadow: "0 12px 36px rgba(0,88,190,0.12)", borderColor: "rgba(0,88,190,0.3)" }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.div>
  )

  if (href) {
    return wrapper(
      <Link href={href} className={cn(baseClass, "cursor-pointer hover:border-[#0058be]/30 hover:shadow-md")}>
        {CardContent}
      </Link>
    )
  }

  return wrapper(
    <div className={cn(baseClass, "cursor-default")}>
      {CardContent}
    </div>
  )
}
