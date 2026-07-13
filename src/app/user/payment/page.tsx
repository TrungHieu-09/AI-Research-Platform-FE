"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useAuth } from "@/features/auth/auth-context"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"
import {
  Sparkles, CheckCircle2, ArrowRight, Clock, CheckCircle, XCircle,
  Receipt, Shield, Cpu, Cloud, RefreshCw, Loader2, AlertCircle
} from "lucide-react"

export default function PaymentOverviewPage() {
  const { user, token, refreshProfile } = useAuth()
  const isPremium = user?.tier === "PREMIUM"

  const [loadingStats, setLoadingStats] = React.useState(true)
  const [aiLimit, setAiLimit] = React.useState<{ queriesToday: number; limit: number; remaining: number; tier: string } | null>(null)
  const [receipts, setReceipts] = React.useState<any[]>([])
  const [error, setError] = React.useState<string | null>(null)

  const fetchData = React.useCallback(async () => {
    if (!token) return
    setLoadingStats(true)
    setError(null)
    try {
      const [limitData, receiptsData] = await Promise.all([
        api.get<any>("/api/ai/limit").catch(() => null),
        api.get<any[]>("/api/payments/receipts").catch(() => [])
      ])

      if (limitData) setAiLimit(limitData)
      if (Array.isArray(receiptsData)) setReceipts(receiptsData)
    } catch (e: any) {
      setError("Không tải được chi tiết hạn ngạch và hóa đơn.")
    } finally {
      setLoadingStats(false)
    }
  }, [token])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-[#121c2a] mb-1" style={{ fontFamily: "Geist, sans-serif" }}>
              Quản Lý Gói Tài Khoản & Hóa Đơn
            </h1>
            <button
              onClick={() => { refreshProfile(); fetchData(); }}
              disabled={loadingStats}
              className="p-2 text-[#0058be] hover:bg-[#eff4ff] rounded-xl transition-colors disabled:opacity-50"
              title="Làm mới"
            >
              <RefreshCw size={18} className={cn(loadingStats && "animate-spin")} />
            </button>
          </div>
          <p className="text-[#424754] font-medium text-[14px]">
            Theo dõi dung lượng truy vấn RAG trong ngày, nâng cấp tài khoản `PREMIUM` hoặc xem lại lịch sử giao dịch.
          </p>
        </div>
      </div>

      {/* Top Banner: Active Plan & Daily Quota */}
      <div className={cn(
        "rounded-3xl p-8 border shadow-sm transition-all flex flex-col md:flex-row items-center justify-between gap-8",
        isPremium
          ? "bg-gradient-to-br from-amber-50 via-[#fffbeb] to-white border-amber-300 shadow-amber-500/5"
          : "bg-gradient-to-br from-[#eff4ff] via-[#f8f9ff] to-white border-[#0058be]/30"
      )}>
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-2.5">
            <span className={cn(
              "px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider inline-flex items-center gap-1",
              isPremium ? "bg-amber-100 text-amber-800 border border-amber-300" : "bg-[#0058be] text-white"
            )}>
              <Sparkles size={13} className={cn(isPremium && "text-amber-600")} />
              {isPremium ? "GÓI PREMIUM (AI PRO)" : "GÓI EXPLORER (FREE)"}
            </span>
            <span className="text-[12px] font-bold text-[#727785]">
              Tài khoản: <strong className="text-[#121c2a]">{user?.email}</strong>
            </span>
          </div>

          <h2 className="text-2xl font-bold text-[#121c2a]" style={{ fontFamily: "Geist, sans-serif" }}>
            {isPremium
              ? "Quyền Lực AI Nghiên Cứu Vô Giới Hạn"
              : "Trải Nghiệm Khám Phá Học Thuật Tiêu Chuẩn"}
          </h2>

          <p className="text-[14px] text-[#424754] leading-relaxed max-w-2xl">
            {isPremium
              ? "Bạn có toàn quyền truy vấn AI không giới hạn số câu hỏi RAG mỗi ngày, ưu tiên truy xuất vector độ trễ thấp và sử dụng các mô hình Gemini 2.5 Pro & Flash cao nhất."
              : "Gói tiêu chuẩn cho phép bạn tải tài liệu học tập và trải nghiệm hỏi đáp RAG với giới hạn 10 - 15 câu hỏi mỗi ngày. Nâng cấp ngay để mở khóa tiềm năng vô tận."}
          </p>
        </div>

        {/* Quota Progress Card */}
        <div className="bg-white rounded-2xl p-6 border border-[#c2c6d6]/40 shadow-sm min-w-[280px] w-full md:w-auto shrink-0 space-y-4">
          <div className="flex justify-between items-center text-[13px] font-bold text-[#121c2a]">
            <span className="flex items-center gap-1.5 text-[#0058be]">
              <Cpu size={16} /> Hạn ngạch AI hôm nay
            </span>
            <span className="text-purple-700 font-mono">
              {loadingStats ? "..." : aiLimit ? `${aiLimit.queriesToday} / ${aiLimit.limit === 99999 ? "∞" : aiLimit.limit}` : "0 / 15"}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-[#dfe9fc] rounded-full h-2.5 overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-700", isPremium ? "bg-amber-500" : "bg-[#0058be]")}
              style={{
                width: aiLimit && aiLimit.limit !== 99999 && aiLimit.limit > 0
                  ? `${Math.min(100, (aiLimit.queriesToday / aiLimit.limit) * 100)}%`
                  : isPremium ? "100%" : "25%"
              }}
            />
          </div>

          <div className="flex justify-between items-center text-[12px] text-[#727785] pt-1">
            <span>Còn lại: <strong className="text-[#121c2a] font-mono">{aiLimit ? (aiLimit.limit === 99999 ? "Vô giới hạn" : aiLimit.remaining) : "..."}</strong> lượt hỏi</span>
            <span>Chu kỳ: <strong>24 giờ (UTC)</strong></span>
          </div>
        </div>
      </div>

      {/* Upgrade Options Section */}
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold text-[#121c2a]" style={{ fontFamily: "Geist, sans-serif" }}>
            Các Gói Nâng Cấp Không Gian Làm Việc
          </h3>
          <p className="text-[13px] text-[#727785]">Lựa chọn gói linh hoạt theo tiến độ đồ án và nhu cầu nghiên cứu học thuật của bạn</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
          {/* Free Card */}
          <div className="bg-white rounded-3xl p-7 border border-[#c2c6d6]/40 shadow-sm flex flex-col justify-between h-full space-y-6">
            <div className="space-y-4">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#f8f9ff] text-[#424754] border border-[#c2c6d6]/40">
                STARTER PLAN
              </span>
              <div>
                <h4 className="text-xl font-bold text-[#121c2a]">Explorer (Miễn phí)</h4>
                <p className="text-[13px] text-[#727785] mt-1">Dành cho sinh viên làm quen hệ thống.</p>
              </div>
              <div className="flex items-baseline gap-1 pt-2">
                <span className="text-4xl font-extrabold text-[#121c2a]" style={{ fontFamily: "Geist, sans-serif" }}>0₫</span>
                <span className="text-[#727785] text-[13px] font-medium">/ vĩnh viễn</span>
              </div>
              <div className="space-y-3 pt-2 border-t border-[#c2c6d6]/30">
                {[
                  "10 - 15 lượt hỏi RAG / ngày",
                  "Lưu trữ đám mây 5 GB",
                  "Truy xuất vector cơ bản",
                  "Hỗ trợ cộng đồng diễn đàn"
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-[13px] text-[#424754]">
                    <CheckCircle2 size={16} className="text-[#727785] shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              disabled
              className="w-full py-3 rounded-2xl bg-gray-100 text-[#727785] font-bold text-[13px] cursor-not-allowed"
            >
              {!isPremium ? "✔ Gói Hiện Tại Của Bạn" : "Gói Tiêu Chuẩn"}
            </button>
          </div>

          {/* AI Pro Card */}
          <div className={cn(
            "rounded-3xl p-7 border-2 flex flex-col justify-between h-full space-y-6 relative shadow-xl transform md:-translate-y-2 transition-all",
            isPremium ? "bg-amber-50/40 border-amber-400" : "bg-white border-[#0058be]"
          )}>
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#0058be] text-white px-4 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider shadow-sm">
              PHỔ BIẾN NHẤT
            </div>

            <div className="space-y-4">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#eff4ff] text-[#0058be]">
                AI PROFESSIONAL
              </span>
              <div>
                <h4 className="text-xl font-bold text-[#0058be]">AI Pro (Gói Tháng)</h4>
                <p className="text-[13px] text-[#727785] mt-1">Dành cho sinh viên làm khóa luận & đồ án tốt nghiệp.</p>
              </div>
              <div className="flex items-baseline gap-1 pt-2">
                <span className="text-4xl font-extrabold text-[#121c2a]" style={{ fontFamily: "Geist, sans-serif" }}>250.000₫</span>
                <span className="text-[#727785] text-[13px] font-medium">/ tháng</span>
              </div>
              <div className="space-y-3 pt-2 border-t border-[#c2c6d6]/30">
                {[
                  "Truy vấn RAG không giới hạn lượt hỏi",
                  "Mô hình Gemini 2.5 Pro & Flash cao cấp nhất",
                  "Lưu trữ đám mây 100 GB",
                  "Truy xuất vector độ trễ thấp (< 500ms)",
                  "Hỗ trợ kỹ thuật ưu tiên 24/7"
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-[13px] text-[#121c2a] font-medium">
                    <CheckCircle2 size={16} className="text-[#0058be] shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {isPremium ? (
              <button disabled className="w-full py-3.5 rounded-2xl bg-amber-500 text-white font-bold text-[14px] shadow-md cursor-default flex items-center justify-center gap-1.5">
                <Sparkles size={16} /> Bạn Đang Sử Dụng Gói Này
              </button>
            ) : (
              <Link
                href="/user/payment/checkout?plan=ai"
                className="w-full py-3.5 rounded-2xl bg-[#0058be] hover:bg-[#004ca3] text-white font-bold text-[14px] shadow-lg shadow-[#0058be]/20 transition-all text-center block"
              >
                Nâng Cấp AI Pro Ngay
              </Link>
            )}
          </div>

          {/* Ultimate Card */}
          <div className="bg-white rounded-3xl p-7 border border-[#c2c6d6]/40 hover:border-[#0058be]/50 shadow-sm flex flex-col justify-between h-full space-y-6 transition-all">
            <div className="space-y-4">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-purple-100 text-purple-700">
                ANNUAL SAVINGS
              </span>
              <div>
                <h4 className="text-xl font-bold text-[#121c2a]">Ultimate (Gói Năm)</h4>
                <p className="text-[13px] text-[#727785] mt-1">Nghiên cứu trọn năm không lo ngắt quãng.</p>
              </div>
              <div className="flex items-baseline gap-1 pt-2">
                <span className="text-4xl font-extrabold text-[#121c2a]" style={{ fontFamily: "Geist, sans-serif" }}>490.000₫</span>
                <span className="text-[#727785] text-[13px] font-medium">/ 1 năm (Tiết kiệm 80%)</span>
              </div>
              <div className="space-y-3 pt-2 border-t border-[#c2c6d6]/30">
                {[
                  "Trọn vẹn quyền lợi gói AI Pro suốt 365 ngày",
                  "Lưu trữ đám mây 500 GB",
                  "Bảo chứng ưu tiên RAG không nghẽn giờ cao điểm",
                  "Chia sẻ không gian làm việc nhóm nghiên cứu"
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-[13px] text-[#424754]">
                    <CheckCircle2 size={16} className="text-purple-600 shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href="/user/payment/checkout?plan=ultimate"
              className="w-full py-3 rounded-2xl bg-[#f8f9ff] hover:bg-[#eff4ff] text-[#0058be] border border-[#0058be]/30 font-bold text-[14px] transition-all text-center block"
            >
              Đăng Ký Gói Ultimate
            </Link>
          </div>
        </div>
      </div>

      {/* Transaction History Section */}
      <div className="bg-white rounded-3xl border border-[#c2c6d6]/40 p-7 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#c2c6d6]/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#eff4ff] text-[#0058be] flex items-center justify-center">
              <Receipt size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#121c2a]" style={{ fontFamily: "Geist, sans-serif" }}>
                Lịch Sử Giao Dịch & Hóa Đơn
              </h3>
              <p className="text-[13px] text-[#727785]">Các đơn hàng chuyển khoản nâng cấp đã tạo trên tài khoản của bạn</p>
            </div>
          </div>
        </div>

        {loadingStats ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-[#727785]">
            <Loader2 size={32} className="animate-spin text-[#0058be]" />
            <p className="text-[13px] font-semibold">Đang truy xuất lịch sử giao dịch từ máy chủ...</p>
          </div>
        ) : receipts.length === 0 ? (
          <div className="py-14 text-center text-[#727785] space-y-2">
            <Receipt size={36} className="mx-auto text-[#c2c6d6]" />
            <p className="text-[15px] font-bold text-[#121c2a]">Bạn chưa có hóa đơn thanh toán nào</p>
            <p className="text-[13px]">Khi bạn đăng ký nâng cấp gói AI Pro hoặc Ultimate, hóa đơn sẽ tự động hiển thị tại đây.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f8f9ff] border-b border-[#c2c6d6]/40 text-[#727785] text-[11px] font-extrabold uppercase tracking-wider">
                  <th className="py-3.5 px-5">Mã Giao Dịch</th>
                  <th className="py-3.5 px-5">Gói Đăng Ký</th>
                  <th className="py-3.5 px-5">Số Tiền</th>
                  <th className="py-3.5 px-5">Nội Dung Chuyển Khoản</th>
                  <th className="py-3.5 px-5">Trạng Thái</th>
                  <th className="py-3.5 px-5 text-right">Ngày Tạo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c2c6d6]/30 text-[13px]">
                {receipts.map((rec) => (
                  <tr key={rec.id} className="hover:bg-[#f8f9ff]/70 transition-colors">
                    <td className="py-4 px-5 font-mono font-bold text-[#121c2a]">
                      {rec.id.slice(0, 8)}...
                    </td>
                    <td className="py-4 px-5 font-bold text-[#0058be]">
                      {rec.planId === "PREMIUM_MONTHLY" ? "AI Pro (1 Tháng)" : rec.planId === "PREMIUM_YEARLY" ? "Ultimate (1 Năm)" : rec.planId}
                    </td>
                    <td className="py-4 px-5 font-bold text-[#121c2a]">
                      {Number(rec.amount || 0).toLocaleString("vi-VN")}₫
                    </td>
                    <td className="py-4 px-5 font-mono text-[12px] text-red-600 font-bold">
                      {rec.transferContent}
                    </td>
                    <td className="py-4 px-5">
                      <span className={cn(
                        "px-2.5 py-1 rounded-lg text-[11px] font-extrabold inline-flex items-center gap-1",
                        rec.status === "COMPLETED" ? "bg-green-100 text-green-700" : rec.status === "FAILED" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-800"
                      )}>
                        {rec.status === "COMPLETED" ? <CheckCircle size={12} /> : rec.status === "FAILED" ? <XCircle size={12} /> : <Clock size={12} />}
                        {rec.status === "COMPLETED" ? "Đã xác nhận" : rec.status === "FAILED" ? "Thất bại/Hủy" : "Chờ thanh toán"}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right text-[#727785] font-medium">
                      {new Date(rec.createdAt).toLocaleDateString("vi-VN")} {new Date(rec.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
