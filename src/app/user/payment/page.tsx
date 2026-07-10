"use client"

import * as React from "react"
import Link from "next/link"
import { motion, useInView, useMotionValue, useSpring } from "framer-motion"
import { cn } from "@/lib/utils"

/* ─── Animated Number ─────────────────────── */
function AnimatedNumber({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const ref = React.useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const motionVal = useMotionValue(0)
  const spring = useSpring(motionVal, { damping: 28, stiffness: 70 })
  const [display, setDisplay] = React.useState("0")
  React.useEffect(() => { if (inView) motionVal.set(value) }, [inView, value, motionVal])
  React.useEffect(() => spring.on("change", v => setDisplay(v.toFixed(decimals))), [spring, decimals])
  return <span ref={ref}>{display}</span>
}

/* ─── Animated Progress Bar ───────────────── */
function AnimatedBar({ pct, color = "#004191" }: { pct: number; color?: string }) {
  const ref = React.useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })
  return (
    <div ref={ref} className="w-full bg-[#dfe9fc] rounded-full h-2">
      <motion.div
        className="h-2 rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={inView ? { width: `${pct}%` } : {}}
        transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  )
}

/* ─── Plan Card ───────────────────────────── */
function PlanCard({
  children,
  featured,
  delay,
}: {
  children: React.ReactNode
  featured?: boolean
  delay?: number
}) {
  return (
    <motion.div
      className={cn(
        "rounded-xl p-6 flex flex-col",
        featured
          ? "bg-[#f4f8ff] border-2 border-[#004191] relative shadow-[0px_8px_24px_rgba(0,65,145,0.12)] scale-[1.02]"
          : "bg-white border border-[#c2c6d6]/30 shadow-sm"
      )}
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay ?? 0, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      whileHover={
        featured
          ? { boxShadow: "0px 16px 48px rgba(0,65,145,0.22)", scale: 1.035 }
          : { y: -4, boxShadow: "0px 8px 32px rgba(0,65,145,0.10)", borderColor: "rgba(0,65,145,0.3)" }
      }
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.div>
  )
}

export default function PaymentManagementPage() {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-20">
      {/* Page Header */}
      <motion.div
        className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <div>
          <motion.h2
            className="font-semibold text-[24px] md:text-[32px] tracking-[-0.02em] text-[#121c2a]"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05, duration: 0.45 }}
          >
            Payment Management
          </motion.h2>
          <motion.p
            className="font-normal text-[14px] text-[#424753] mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.4 }}
          >
            Manage your AI capabilities, storage packages, and billing information.
          </motion.p>
        </div>
      </motion.div>

      {/* Current Plans Overview */}
      <div className="mb-10">
        <motion.h3
          className="font-medium text-[18px] text-[#121c2a] mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.35 }}
        >
          Current Packages
        </motion.h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* AI Package */}
          <motion.div
            className="bg-[#f8f9ff] rounded-xl border border-[#c2c6d6]/30 p-6 flex flex-col justify-between"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.45 }}
            whileHover={{ boxShadow: "0 6px 24px rgba(0,65,145,0.09)", borderColor: "rgba(0,65,145,0.2)" }}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-2 text-[#121c2a]">
                <motion.div
                  className="w-8 h-8 rounded-lg bg-[#e0e7ff] flex items-center justify-center text-[#004191]"
                  whileHover={{ scale: 1.15, rotate: 8 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <span className="material-symbols-outlined text-[18px]">psychology</span>
                </motion.div>
                <span className="font-semibold text-[15px] tracking-wide uppercase">AI Package</span>
              </div>
              <span className="px-2.5 py-1 bg-[#dfe9fc] text-[#004191] rounded-md font-medium text-[11px] uppercase tracking-wider">
                Free Plan
              </span>
            </div>
            <div className="mb-3 flex justify-between items-end">
              <span className="font-medium text-[24px] leading-[1.3] text-[#004191]">
                <AnimatedNumber value={105} /> <span className="font-normal text-[14px] text-[#424753]">Queries</span>
              </span>
              <span className="font-normal text-[14px] text-[#424753]">of 500 / month</span>
            </div>
            <AnimatedBar pct={21} />
          </motion.div>

          {/* Storage Package */}
          <motion.div
            className="bg-[#f8f9ff] rounded-xl border border-[#c2c6d6]/30 p-6 flex flex-col justify-between"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32, duration: 0.45 }}
            whileHover={{ boxShadow: "0 6px 24px rgba(0,65,145,0.09)", borderColor: "rgba(0,65,145,0.2)" }}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-2 text-[#121c2a]">
                <motion.div
                  className="w-8 h-8 rounded-lg bg-[#e0e7ff] flex items-center justify-center text-[#004191]"
                  whileHover={{ scale: 1.15, rotate: 8 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <span className="material-symbols-outlined text-[18px]">cloud</span>
                </motion.div>
                <span className="font-semibold text-[15px] tracking-wide uppercase">Storage Package</span>
              </div>
              <span className="px-2.5 py-1 bg-[#dfe9fc] text-[#004191] rounded-md font-medium text-[11px] uppercase tracking-wider">
                Free Plan
              </span>
            </div>
            <div className="mb-3 flex justify-between items-end">
              <span className="font-medium text-[24px] leading-[1.3] text-[#004191]">
                <AnimatedNumber value={2.1} decimals={1} /> <span className="font-normal text-[14px] text-[#424753]">GB</span>
              </span>
              <span className="font-normal text-[14px] text-[#424753]">of 5 GB</span>
            </div>
            <AnimatedBar pct={42} />
          </motion.div>
        </div>
      </div>

      {/* Upgrade Options */}
      <div>
        <motion.h3
          className="font-medium text-[18px] text-[#121c2a] mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38, duration: 0.35 }}
        >
          Upgrade Your Workspace
        </motion.h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* Plan 1: Basic */}
          <PlanCard delay={0.42}>
            <div className="mb-4">
              <h4 className="font-semibold text-[18px] text-[#121c2a]">Basic</h4>
              <p className="text-[13px] text-[#424753] mt-1 h-10">Essential tools for individual researchers.</p>
            </div>
            <div className="mb-6">
              <span className="font-bold text-[32px] text-[#121c2a]">0₫</span>
              <span className="text-[14px] text-[#424753]">/month</span>
            </div>
            <div className="space-y-3 mb-8 flex-1">
              {["500 AI Queries / month", "5 GB Cloud Storage", "Basic Support"].map(f => (
                <div key={f} className="flex items-center gap-2 text-[13px] text-[#424753]">
                  <span className="material-symbols-outlined text-[16px] text-[#004191]">check_circle</span>
                  {f}
                </div>
              ))}
            </div>
            <button className="w-full bg-[#f1f5f9] text-[#424753] font-semibold text-[13px] py-2.5 rounded-lg border border-[#c2c6d6]/40 cursor-not-allowed">
              Current Plan
            </button>
          </PlanCard>

          {/* Plan 2: Storage Pro */}
          <PlanCard delay={0.5}>
            <div className="mb-4">
              <h4 className="font-semibold text-[18px] text-[#121c2a]">Storage Pro</h4>
              <p className="text-[13px] text-[#424753] mt-1 h-10">For heavy document and data management.</p>
            </div>
            <div className="mb-6">
              <span className="font-bold text-[32px] text-[#121c2a]">125.000₫</span>
              <span className="text-[14px] text-[#424753]">/month</span>
            </div>
            <div className="space-y-3 mb-8 flex-1">
              <div className="flex items-center gap-2 text-[13px] text-[#424753]">
                <span className="material-symbols-outlined text-[16px] text-[#004191]">check_circle</span>
                500 AI Queries / month
              </div>
              <div className="flex items-center gap-2 text-[13px] text-[#121c2a] font-medium">
                <span className="material-symbols-outlined text-[16px] text-[#004191]">rocket_launch</span>
                100 GB Cloud Storage
              </div>
              <div className="flex items-center gap-2 text-[13px] text-[#424753]">
                <span className="material-symbols-outlined text-[16px] text-[#004191]">check_circle</span>
                Priority Support
              </div>
            </div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link href="/user/payment/checkout?plan=storage" className="w-full bg-white text-[#004191] border border-[#004191] font-semibold text-[13px] py-2.5 rounded-lg hover:bg-[#f0f7ff] transition-colors text-center block">
                Upgrade Storage
              </Link>
            </motion.div>
          </PlanCard>

          {/* Plan 3: AI Pro */}
          <PlanCard delay={0.58}>
            <div className="mb-4">
              <h4 className="font-semibold text-[18px] text-[#121c2a]">AI Pro</h4>
              <p className="text-[13px] text-[#424753] mt-1 h-10">Unleash advanced AI synthesis and analysis.</p>
            </div>
            <div className="mb-6">
              <span className="font-bold text-[32px] text-[#121c2a]">250.000₫</span>
              <span className="text-[14px] text-[#424753]">/month</span>
            </div>
            <div className="space-y-3 mb-8 flex-1">
              <div className="flex items-center gap-2 text-[13px] text-[#121c2a] font-medium">
                <span className="material-symbols-outlined text-[16px] text-[#004191]">rocket_launch</span>
                Unlimited AI Queries
              </div>
              <div className="flex items-center gap-2 text-[13px] text-[#121c2a] font-medium">
                <span className="material-symbols-outlined text-[16px] text-[#004191]">rocket_launch</span>
                Advanced Models (GPT-4)
              </div>
              <div className="flex items-center gap-2 text-[13px] text-[#424753]">
                <span className="material-symbols-outlined text-[16px] text-[#004191]">check_circle</span>
                5 GB Cloud Storage
              </div>
            </div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link href="/user/payment/checkout?plan=ai" className="w-full bg-white text-[#004191] border border-[#004191] font-semibold text-[13px] py-2.5 rounded-lg hover:bg-[#f0f7ff] transition-colors text-center block">
                Upgrade AI
              </Link>
            </motion.div>
          </PlanCard>

          {/* Plan 4: Ultimate */}
          <PlanCard featured delay={0.66}>
            {/* Badge */}
            <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-3">
              <motion.span
                className="bg-[#004191] text-white text-[10px] font-bold uppercase tracking-wider py-1 px-3 rounded-full shadow-md inline-block"
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              >
                Best Value
              </motion.span>
            </div>
            <div className="mb-4">
              <h4 className="font-semibold text-[18px] text-[#004191]">Ultimate</h4>
              <p className="text-[13px] text-[#424753] mt-1 h-10">The complete research workstation.</p>
            </div>
            <div className="mb-6">
              <span className="font-bold text-[32px] text-[#121c2a]">300.000₫</span>
              <span className="text-[14px] text-[#424753]">/month</span>
            </div>
            <div className="space-y-3 mb-8 flex-1">
              <div className="flex items-center gap-2 text-[13px] text-[#121c2a] font-medium">
                <span className="material-symbols-outlined text-[16px] text-[#004191]">rocket_launch</span>
                Unlimited AI Queries &amp; Models
              </div>
              <div className="flex items-center gap-2 text-[13px] text-[#121c2a] font-medium">
                <span className="material-symbols-outlined text-[16px] text-[#004191]">rocket_launch</span>
                100 GB Cloud Storage
              </div>
              <div className="flex items-center gap-2 text-[13px] text-[#121c2a] font-medium">
                <span className="material-symbols-outlined text-[16px] text-[#004191]">star</span>
                24/7 Dedicated Support
              </div>
            </div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link href="/user/payment/checkout?plan=ultimate" className="w-full bg-gradient-to-br from-[#004191] to-[#0051d6] text-white font-semibold text-[13px] py-2.5 rounded-lg hover:opacity-90 transition-opacity shadow-md text-center block">
                Upgrade to Ultimate
              </Link>
            </motion.div>
          </PlanCard>
        </div>
      </div>
    </div>
  )
}
