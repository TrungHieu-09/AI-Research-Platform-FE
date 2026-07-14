"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface ForumMetricItem {
  label: string
  value: string | number
  helper?: string
  tone?: "blue" | "green" | "amber" | "violet"
}

const toneClasses = {
  blue: "from-[#0058be]/12 to-[#2170e4]/5 text-[#0058be] border-[#0058be]/15",
  green: "from-green-500/12 to-emerald-500/5 text-green-700 border-green-200",
  amber: "from-amber-500/14 to-orange-500/5 text-amber-700 border-amber-200",
  violet: "from-violet-500/12 to-indigo-500/5 text-violet-700 border-violet-200",
}

export function ForumAuroraBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="forum-aurora-one absolute -top-32 left-10 h-72 w-72 rounded-full bg-[#0058be]/12 blur-3xl" />
      <div className="forum-aurora-two absolute right-10 top-24 h-80 w-80 rounded-full bg-[#7aa7ff]/20 blur-3xl" />
      <div className="forum-aurora-three absolute bottom-24 left-1/3 h-72 w-72 rounded-full bg-[#34c759]/10 blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,88,190,0.07)_1px,transparent_0)] [background-size:28px_28px]" />
      <style>{`
        @keyframes forumAuroraFloat {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); opacity: .75; }
          50% { transform: translate3d(24px, 18px, 0) scale(1.08); opacity: 1; }
        }
        @keyframes forumAuroraDrift {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); opacity: .65; }
          50% { transform: translate3d(-22px, 28px, 0) rotate(8deg); opacity: .92; }
        }
        .forum-aurora-one { animation: forumAuroraFloat 9s ease-in-out infinite; }
        .forum-aurora-two { animation: forumAuroraDrift 11s ease-in-out infinite; }
        .forum-aurora-three { animation: forumAuroraFloat 13s ease-in-out infinite reverse; }
      `}</style>
    </div>
  )
}

export function ForumMetricRail({ items }: { items: ForumMetricItem[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item, index) => {
        const tone = toneClasses[item.tone ?? "blue"]

        return (
          <div
            key={item.label}
            className={cn(
              "group relative overflow-hidden rounded-2xl border bg-gradient-to-br p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgba(0,65,145,0.08)]",
              tone,
            )}
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <div className="absolute inset-y-0 right-0 w-16 bg-white/30 blur-2xl transition-transform duration-500 group-hover:translate-x-4" />
            <p className="relative text-[22px] font-extrabold leading-none text-[#121c2a]">{item.value}</p>
            <p className="relative mt-1 text-[11px] font-bold uppercase tracking-wider">{item.label}</p>
            {item.helper ? (
              <p className="relative mt-2 text-[12px] font-medium text-[#727785]">{item.helper}</p>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

export function ForumDocumentSkeletonList({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="relative overflow-hidden rounded-[24px] border border-[#c2c6d6]/40 bg-white/80 p-5 shadow-sm"
        >
          <div className="absolute inset-0 -translate-x-full animate-[forumSkeleton_1.7s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/80 to-transparent" />
          <div className="flex gap-4">
            <div className="h-12 w-12 shrink-0 rounded-2xl bg-[#eff4ff]" />
            <div className="w-full space-y-3">
              <div className="flex gap-2">
                <div className="h-5 w-20 rounded-full bg-[#eff4ff]" />
                <div className="h-5 w-16 rounded-full bg-[#eff4ff]" />
                <div className="h-5 w-24 rounded-full bg-[#eff4ff]" />
              </div>
              <div className="h-5 w-3/4 rounded-lg bg-[#e8eefb]" />
              <div className="space-y-2">
                <div className="h-3 w-full rounded-lg bg-[#eff4ff]" />
                <div className="h-3 w-5/6 rounded-lg bg-[#eff4ff]" />
              </div>
              <div className="flex gap-4">
                <div className="h-3 w-24 rounded-lg bg-[#eff4ff]" />
                <div className="h-3 w-20 rounded-lg bg-[#eff4ff]" />
                <div className="h-3 w-16 rounded-lg bg-[#eff4ff]" />
              </div>
            </div>
          </div>
          <style>{`
            @keyframes forumSkeleton {
              100% { transform: translateX(100%); }
            }
          `}</style>
        </div>
      ))}
    </div>
  )
}

export function ForumSectionReveal({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("animate-in fade-in slide-in-from-bottom-3 duration-500", className)}>
      {children}
    </div>
  )
}

export function ForumScrollProgress() {
  const [progress, setProgress] = React.useState(0)

  React.useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      setProgress(maxScroll <= 0 ? 0 : Math.min(100, Math.round((scrollTop / maxScroll) * 100)))
    }

    updateProgress()
    window.addEventListener("scroll", updateProgress, { passive: true })
    window.addEventListener("resize", updateProgress)

    return () => {
      window.removeEventListener("scroll", updateProgress)
      window.removeEventListener("resize", updateProgress)
    }
  }, [])

  return (
    <div className="fixed left-0 right-0 top-16 z-40 h-1 bg-transparent">
      <div
        className="h-full rounded-r-full bg-gradient-to-r from-[#0058be] via-[#2170e4] to-[#8bb5ff] shadow-[0_0_18px_rgba(0,88,190,0.45)] transition-[width] duration-150"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

export function ForumSoftPulse({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <span className={cn("relative inline-flex", className)}>
      <span className="absolute inset-0 rounded-full bg-[#0058be]/15 blur-md animate-pulse" />
      <span className="relative">{children}</span>
    </span>
  )
}
/*
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface ForumMetricItem {
  label: string
  value: string | number
  helper?: string
  tone?: "blue" | "green" | "amber" | "violet"
}

const toneClasses = {
  blue: "from-[#0058be]/12 to-[#2170e4]/5 text-[#0058be] border-[#0058be]/15",
  green: "from-green-500/12 to-emerald-500/5 text-green-700 border-green-200",
  amber: "from-amber-500/14 to-orange-500/5 text-amber-700 border-amber-200",
  violet: "from-violet-500/12 to-indigo-500/5 text-violet-700 border-violet-200",
}

export function ForumAuroraBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="forum-aurora-one absolute -top-32 left-10 h-72 w-72 rounded-full bg-[#0058be]/12 blur-3xl" />
      <div className="forum-aurora-two absolute right-10 top-24 h-80 w-80 rounded-full bg-[#7aa7ff]/20 blur-3xl" />
      <div className="forum-aurora-three absolute bottom-24 left-1/3 h-72 w-72 rounded-full bg-[#34c759]/10 blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,88,190,0.07)_1px,transparent_0)] [background-size:28px_28px]" />
      <style>{`
        @keyframes forumAuroraFloat {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); opacity: .75; }
          50% { transform: translate3d(24px, 18px, 0) scale(1.08); opacity: 1; }
        }
        @keyframes forumAuroraDrift {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); opacity: .65; }
          50% { transform: translate3d(-22px, 28px, 0) rotate(8deg); opacity: .92; }
        }
        .forum-aurora-one { animation: forumAuroraFloat 9s ease-in-out infinite; }
        .forum-aurora-two { animation: forumAuroraDrift 11s ease-in-out infinite; }
        .forum-aurora-three { animation: forumAuroraFloat 13s ease-in-out infinite reverse; }
      `}</style>
    </div>
  )
}

export function ForumMetricRail({ items }: { items: ForumMetricItem[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item, index) => {
        const tone = toneClasses[item.tone ?? "blue"]

        return (
          <div
            key={item.label}
            className={cn(
              "group relative overflow-hidden rounded-2xl border bg-gradient-to-br p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgba(0,65,145,0.08)]",
              tone,
            )}
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <div className="absolute inset-y-0 right-0 w-16 bg-white/30 blur-2xl transition-transform duration-500 group-hover:translate-x-4" />
            <p className="relative text-[22px] font-extrabold leading-none text-[#121c2a]">{item.value}</p>
            <p className="relative mt-1 text-[11px] font-bold uppercase tracking-wider">{item.label}</p>
            {item.helper ? (
              <p className="relative mt-2 text-[12px] font-medium text-[#727785]">{item.helper}</p>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

export function ForumDocumentSkeletonList({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="relative overflow-hidden rounded-[24px] border border-[#c2c6d6]/40 bg-white/80 p-5 shadow-sm"
        >
          <div className="absolute inset-0 -translate-x-full animate-[forumSkeleton_1.7s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/80 to-transparent" />
          <div className="flex gap-4">
            <div className="h-12 w-12 shrink-0 rounded-2xl bg-[#eff4ff]" />
            <div className="w-full space-y-3">
              <div className="flex gap-2">
                <div className="h-5 w-20 rounded-full bg-[#eff4ff]" />
                <div className="h-5 w-16 rounded-full bg-[#eff4ff]" />
                <div className="h-5 w-24 rounded-full bg-[#eff4ff]" />
              </div>
              <div className="h-5 w-3/4 rounded-lg bg-[#e8eefb]" />
              <div className="space-y-2">
                <div className="h-3 w-full rounded-lg bg-[#eff4ff]" />
                <div className="h-3 w-5/6 rounded-lg bg-[#eff4ff]" />
              </div>
              <div className="flex gap-4">
                <div className="h-3 w-24 rounded-lg bg-[#eff4ff]" />
                <div className="h-3 w-20 rounded-lg bg-[#eff4ff]" />
                <div className="h-3 w-16 rounded-lg bg-[#eff4ff]" />
              </div>
            </div>
          </div>
          <style>{`
            @keyframes forumSkeleton {
              100% { transform: translateX(100%); }
            }
          `}</style>
        </div>
      ))}
    </div>
  )
}

export function ForumSectionReveal({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("animate-in fade-in slide-in-from-bottom-3 duration-500", className)}>
      {children}
    </div>
  )
}

export function ForumScrollProgress() {
  const [progress, setProgress] = React.useState(0)

  React.useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      setProgress(maxScroll <= 0 ? 0 : Math.min(100, Math.round((scrollTop / maxScroll) * 100)))
    }

    updateProgress()
    window.addEventListener("scroll", updateProgress, { passive: true })
    window.addEventListener("resize", updateProgress)

    return () => {
      window.removeEventListener("scroll", updateProgress)
      window.removeEventListener("resize", updateProgress)
    }
  }, [])

  return (
    <div className="fixed left-0 right-0 top-16 z-40 h-1 bg-transparent">
      <div
        className="h-full rounded-r-full bg-gradient-to-r from-[#0058be] via-[#2170e4] to-[#8bb5ff] shadow-[0_0_18px_rgba(0,88,190,0.45)] transition-[width] duration-150"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

export function ForumSoftPulse({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <span className={cn("relative inline-flex", className)}>
      <span className="absolute inset-0 rounded-full bg-[#0058be]/15 blur-md animate-pulse" />
      <span className="relative">{children}</span>
    </span>
  )
}



*/