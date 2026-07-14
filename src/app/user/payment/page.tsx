"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useAuth } from "@/features/auth/auth-context"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"
import {
  Sparkles, Clock, CheckCircle, XCircle,
  Receipt, Cpu, RefreshCw, Loader2, ArrowRight
} from "lucide-react"

// Stagger variants for the list items
const listContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const listItemVariants = {
  hidden: { opacity: 0, x: 10 },
  show: { opacity: 1, x: 0, transition: { duration: 0.3 } }
};

export default function PaymentOverviewPage() {
  const { user, token, refreshProfile, resetTierToFree } = useAuth()
  const isPremium = user?.tier === "PREMIUM"

  const [loadingStats, setLoadingStats] = React.useState(true)
  const [aiLimit, setAiLimit] = React.useState<{ queriesToday: number; limit: number; remaining: number; tier: string } | null>(null)
  const [receipts, setReceipts] = React.useState<any[]>([])
  const [error, setError] = React.useState<string | null>(null)
  const [isDemoPremium, setIsDemoPremium] = React.useState(false)
  const [demoPlanName, setDemoPlanName] = React.useState<string | null>(null)

  // Progress animation state
  const [progressWidth, setProgressWidth] = React.useState(0)

  const fetchData = React.useCallback(async () => {
    if (typeof window !== "undefined") {
      setIsDemoPremium(localStorage.getItem("lumis_demo_premium") === "true")
      const plan = localStorage.getItem("lumis_demo_plan")
      if (plan === "ULTIMATE") setDemoPlanName("Ultimate (Gói Năm)")
      else if (plan === "PRO") setDemoPlanName("AI Pro (Gói Tháng)")
      else setDemoPlanName(null)
    }

    if (!token) return
    setLoadingStats(true)
    setError(null)
    try {
      const [limitData, receiptsData] = await Promise.all([
        api.get<any>("/api/ai/limit").catch(() => null),
        api.get<any[]>("/api/payments/receipts").catch(() => [])
      ])

      if (limitData) {
        setAiLimit(limitData)
        setTimeout(() => {
          if (limitData.limit === 99999 || limitData.limit <= 0) {
            setProgressWidth(isPremium ? 100 : 25)
          } else {
            setProgressWidth(Math.min(100, (limitData.queriesToday / limitData.limit) * 100))
          }
        }, 100)
      } else {
        setTimeout(() => setProgressWidth(isPremium ? 100 : 25), 100)
      }
      if (Array.isArray(receiptsData)) setReceipts(receiptsData)
    } catch (e: any) {
      setError("Không tải được chi tiết hạn ngạch và hóa đơn.")
    } finally {
      setLoadingStats(false)
    }
  }, [token, isPremium])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleResetDemo = () => {
    resetTierToFree()
    if (typeof window !== "undefined") {
      localStorage.removeItem("lumis_demo_plan")
      setIsDemoPremium(false)
      setDemoPlanName(null)
    }
    fetchData()
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Title Header */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2"
      >
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-[#121c2a] mb-1" style={{ fontFamily: "Geist, sans-serif" }}>
              Quản Lý Gói & Hóa Đơn
            </h1>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => { refreshProfile(); fetchData(); }}
              disabled={loadingStats}
              className="p-2 text-[#2563EB] hover:bg-[#EFF6FF] rounded-xl transition-colors disabled:opacity-50"
              title="Làm mới"
            >
              <RefreshCw size={18} className={cn(loadingStats && "animate-spin")} />
            </motion.button>
          </div>
          <p className="text-[#4B5563] font-medium text-[14px]">
            Quản lý gói tài khoản hiện tại, theo dõi hạn ngạch AI và lịch sử giao dịch.
          </p>
        </div>
      </motion.div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
        
        {/* Left Column: Plan Info */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className={cn(
            "lg:col-span-2 rounded-3xl p-8 border shadow-sm transition-all duration-200 ease-out flex flex-col h-full",
            isPremium
              ? "bg-gradient-to-br from-[#F0F9FF] via-white to-white border-[#BAE6FD]"
              : "bg-gradient-to-br from-[#EFF6FF] via-[#F8FAFC] to-white border-[#BFDBFE]"
          )}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
            <span className={cn(
              "px-4 py-1.5 rounded-full text-[12px] font-extrabold uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm",
              isPremium ? "bg-[#3B82F6] text-white" : "bg-[#2563EB] text-white"
            )}>
              <Sparkles size={14} className="text-white" />
              {isPremium ? (demoPlanName ? `GÓI PREMIUM (${demoPlanName.toUpperCase()})` : "GÓI PREMIUM (AI PRO)") : "GÓI EXPLORER (FREE)"}
            </span>

            {isPremium && isDemoPremium && (
              <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300 inline-flex items-center gap-1">
                <Sparkles size={12} className="text-amber-600" />
                SANDBOX DEMO MODE
              </span>
            )}
          </div>

          <h2 className="text-[28px] font-bold text-[#111827] mb-3 leading-tight" style={{ fontFamily: "Geist, sans-serif" }}>
            {isPremium
              ? "Quyền Lực AI Nghiên Cứu Vô Giới Hạn"
              : "Trải Nghiệm Khám Phá Học Thuật Tiêu Chuẩn"}
          </h2>

          <p className="text-[15px] text-[#4B5563] leading-relaxed max-w-2xl mb-8 flex-grow">
            {isPremium
              ? "Bạn có toàn quyền truy vấn AI không giới hạn số câu hỏi RAG mỗi ngày, ưu tiên truy xuất vector độ trễ thấp và sử dụng các mô hình Gemini 2.5 Pro & Flash cao cấp nhất cho việc nghiên cứu."
              : "Gói tiêu chuẩn cho phép bạn tải tài liệu học tập và trải nghiệm hỏi đáp RAG với giới hạn 10 - 15 câu hỏi mỗi ngày. Nâng cấp để mở khóa tiềm năng vô tận, không lo gián đoạn."}
          </p>
          
          <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-[#E5E7EB]/70">
            <div className="flex flex-col">
              <span className="text-[12px] text-[#6B7280] font-medium uppercase tracking-wider mb-1">Tài khoản hiện tại</span>
              <span className="text-[14px] font-bold text-[#1F2937]">{user?.email}</span>
            </div>

            <div className="flex items-center gap-3">
              {!isPremium ? (
                <Link href="/pricing">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-6 py-3 rounded-xl text-[14px] font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
                  >
                    <Sparkles size={16} /> Nâng Cấp Ngay
                  </motion.button>
                </Link>
              ) : (
                <>
                  {isDemoPremium && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleResetDemo}
                      className="px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold text-[13px] transition-all flex items-center gap-1.5 shadow-sm"
                      title="Đặt lại tài khoản về gói Free để test lại luồng thanh toán từ đầu"
                    >
                      <RefreshCw size={14} className="text-amber-700" /> Đặt Lại Gói Free (Test)
                    </motion.button>
                  )}
                  <Link href="/user/ai-workspace">
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-5 py-2.5 rounded-xl text-[13px] font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
                    >
                      <Sparkles size={15} /> Mở Trợ Lý AI
                    </motion.button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Right Column: Quota & Transactions Corner */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          
          {/* Quota Progress Card */}
          <motion.div 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-white rounded-3xl p-6 border border-[#E5E7EB] shadow-sm space-y-5"
          >
            <div className="flex justify-between items-center text-[14px] font-bold text-[#111827]">
              <span className="flex items-center gap-2 text-[#2563EB]">
                <Cpu size={18} /> Hạn ngạch hôm nay
              </span>
              <span className="text-[#4338CA] font-mono bg-indigo-50 px-2 py-1 rounded-md">
                {loadingStats ? "..." : aiLimit ? `${aiLimit.queriesToday} / ${aiLimit.limit === 99999 ? "∞" : aiLimit.limit}` : "0 / 15"}
              </span>
            </div>

            <div className="w-full bg-[#F3F4F6] rounded-full h-3 overflow-hidden shadow-inner">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden", 
                  isPremium ? "bg-gradient-to-r from-[#4F46E5] to-[#4338CA]" : "bg-gradient-to-r from-[#3B82F6] to-[#2563EB]"
                )}
                style={{ width: `${progressWidth}%` }}
              >
                <div className="absolute top-0 left-0 w-full h-full bg-white/20 animate-pulse" />
              </div>
            </div>

            <div className="flex justify-between items-center text-[12px] text-[#6B7280]">
              <span>Còn lại: <strong className="text-[#111827]">{aiLimit ? (aiLimit.limit === 99999 ? "Vô giới hạn" : aiLimit.remaining) : "..."}</strong></span>
              <span>Chu kỳ: <strong>24h</strong></span>
            </div>
          </motion.div>

          {/* Compact Transaction History Corner */}
          <motion.div 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="bg-white rounded-3xl p-6 border border-[#E5E7EB] shadow-sm flex flex-col flex-grow"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Receipt size={18} className="text-[#6B7280]" />
                <h3 className="text-[15px] font-bold text-[#111827]" style={{ fontFamily: "Geist, sans-serif" }}>
                  Lịch sử giao dịch
                </h3>
              </div>
            </div>

            {loadingStats ? (
              <div className="py-8 flex flex-col items-center justify-center gap-2 text-[#6B7280]">
                <Loader2 size={24} className="animate-spin text-[#2563EB]" />
                <span className="text-[12px]">Đang tải...</span>
              </div>
            ) : receipts.length === 0 ? (
              <div className="py-8 text-center text-[#9CA3AF] flex flex-col items-center gap-2">
                <Receipt size={28} className="opacity-50" />
                <p className="text-[13px]">Chưa có giao dịch nào.</p>
              </div>
            ) : (
              <motion.div 
                variants={listContainerVariants}
                initial="hidden"
                animate="show"
                className="flex flex-col gap-3"
              >
                {receipts.slice(0, 3).map((rec) => {
                  let planName = rec.planId;
                  let planAmount = Number(rec.amount || 0);
                  
                  if (rec.planId === "PREMIUM_MONTHLY") {
                    planName = "AI Pro";
                    planAmount = 250000;
                  } else if (rec.planId === "PREMIUM_YEARLY") {
                    planName = "Ultimate";
                    planAmount = 490000;
                  }

                  return (
                    <motion.div 
                      variants={listItemVariants}
                      key={rec.id} 
                      className="flex items-center justify-between p-3 rounded-xl bg-[#F9FAFB] border border-[#F3F4F6] hover:border-[#E5E7EB] transition-colors group"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="text-[13px] font-bold text-[#111827] group-hover:text-[#2563EB] transition-colors">{planName}</span>
                        <span className="text-[11px] text-[#6B7280] font-medium">
                          {new Date(rec.createdAt).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[13px] font-bold text-[#111827]">
                          {planAmount.toLocaleString("vi-VN")}₫
                        </span>
                        <span className={cn(
                          "text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1",
                          rec.status === "COMPLETED" ? "text-green-600" : rec.status === "FAILED" ? "text-red-600" : "text-amber-600"
                        )}>
                          {rec.status === "COMPLETED" ? "THÀNH CÔNG" : rec.status === "FAILED" ? "THẤT BẠI" : "ĐANG CHỜ"}
                        </span>
                      </div>
                    </motion.div>
                  )
                })}
                
                {receipts.length > 3 && (
                  <div className="pt-2 text-center">
                    <span className="text-[12px] text-[#6B7280] hover:text-[#2563EB] cursor-pointer flex items-center justify-center gap-1 transition-colors">
                      Xem tất cả <ArrowRight size={12} />
                    </span>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
