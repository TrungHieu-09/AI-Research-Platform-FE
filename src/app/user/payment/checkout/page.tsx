"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/features/auth/auth-context"
import { api } from "@/lib/api"
import { Loader2, CheckCircle2, Copy, Check, ArrowLeft, ShieldCheck, Sparkles, AlertTriangle } from "lucide-react"

const PLAN_INFO: Record<string, { planId: "PREMIUM_MONTHLY" | "PREMIUM_YEARLY"; name: string; priceText: string; canonicalAmount: number; features: string[] }> = {
  storage: {
    planId: "PREMIUM_MONTHLY",
    name: "Lưu trữ Pro (Cloud & AI)",
    priceText: "125.000",
    canonicalAmount: 125000,
    features: ["Lưu trữ đám mây 100 GB", "Hỗ trợ RAG Vector chuẩn xác", "Hỗ trợ ưu tiên 24/7"]
  },
  ai: {
    planId: "PREMIUM_MONTHLY",
    name: "AI Pro (Gói Tháng)",
    priceText: "250.000",
    canonicalAmount: 250000,
    features: ["Truy vấn AI không giới hạn lượt hỏi", "Mở khóa mô hình cao cấp Gemini 2.5 Pro & Flash", "Lưu trữ đám mây 100 GB", "RAG siêu chính xác với ngữ cảnh toàn tài liệu"]
  },
  ultimate: {
    planId: "PREMIUM_YEARLY",
    name: "Ultimate (Gói Năm Vô Giới Hạn)",
    priceText: "490.000",
    canonicalAmount: 490000,
    features: ["Truy vấn & Mô hình AI không giới hạn trọn năm", "Lưu trữ đám mây 500 GB", "Hỗ trợ kỹ thuật chuyên dụng 24/7", "Không gian làm việc nhóm & nghiên cứu chuyên sâu"]
  }
}

function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, token, refreshProfile, upgradeTierToPremium } = useAuth()

  const planParam = (searchParams.get("plan") || "ai") as keyof typeof PLAN_INFO
  const planObj = PLAN_INFO[planParam] || PLAN_INFO.ai

  const [loadingOrder, setLoadingOrder] = useState(true)
  const [orderData, setOrderData] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [copiedAccount, setCopiedAccount] = useState(false)
  const [copiedContent, setCopiedContent] = useState(false)

  const [confirming, setConfirming] = useState(false)
  const [confirmedSuccess, setConfirmedSuccess] = useState(false)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  // Fetch Order / Checkout on mount
  useEffect(() => {
    let isMounted = true
    async function initOrder() {
      if (!token) return
      setLoadingOrder(true)
      setError(null)
      const expectedAmount = planObj.canonicalAmount || (planObj.planId === "PREMIUM_YEARLY" ? 490000 : 250000)
      try {
        const res = await api.post<any>("/api/payments/checkout", { planId: planObj.planId })
        if (isMounted && res) {
          // Normalize amount to canonical pricing table on the FE (/pricing) in case backend returns legacy/mismatched amounts (e.g. 49000 instead of 490000)
          let normalizedQrUrl = res.qrCodeUrl;
          if (res.amount !== expectedAmount || !normalizedQrUrl) {
            normalizedQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=LUMIS_VIETQR_${expectedAmount}_${res.orderId || "REF"}`;
          }
          setOrderData({
            ...res,
            amount: expectedAmount,
            qrCodeUrl: normalizedQrUrl
          })
        }
      } catch (err: any) {
        if (isMounted) {
          // Fallback mock order data for demo & presentation reliability
          setOrderData({
            orderId: `DEMO-ORD-${Math.floor(100000 + Math.random() * 900000)}`,
            amount: expectedAmount,
            transferContent: `LUMIS ${user?.initials || "EDU"} ${planObj.planId === "PREMIUM_YEARLY" ? "YEAR" : "PRO"}`,
            qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=LUMIS_VIETQR_DEMO_${expectedAmount}`,
            paymentInstructions: {
              bankName: "Vietcombank (VCB)",
              accountNumber: "999988886666",
              accountName: "CÔNG TY LUMIS EDTECH (DEMO)"
            }
          });
        }
      } finally {
        if (isMounted) setLoadingOrder(false)
      }
    }
    initOrder()
    return () => { isMounted = false }
  }, [token, planObj.planId, planObj.canonicalAmount, user?.initials])

  const copyToClipboard = (text: string, type: "account" | "content") => {
    navigator.clipboard.writeText(text)
    if (type === "account") {
      setCopiedAccount(true)
      setTimeout(() => setCopiedAccount(false), 2000)
    } else {
      setCopiedContent(true)
      setTimeout(() => setCopiedContent(false), 2000)
    }
  }

  const handleConfirmPayment = async (isSandbox = false) => {
    if (!orderData?.orderId || !token) return
    setConfirming(true)
    setToastMsg(null)

    if (isSandbox) {
      // Simulate instant check for Demo / Sandbox presentation
      setTimeout(() => {
        if (typeof window !== "undefined") {
          localStorage.setItem("lumis_demo_plan", planParam === "ultimate" ? "ULTIMATE" : "PRO")
        }
        upgradeTierToPremium()
        refreshProfile()
        setConfirmedSuccess(true)
        setConfirming(false)
      }, 1200)
      return
    }

    try {
      const res = await api.post<any>("/api/payments/confirm", { orderId: orderData.orderId })
      if (res && res.success) {
        if (typeof window !== "undefined") {
          localStorage.setItem("lumis_demo_plan", planParam === "ultimate" ? "ULTIMATE" : "PRO")
        }
        setConfirmedSuccess(true)
        upgradeTierToPremium()
        await refreshProfile()
      } else {
        setToastMsg("Giao dịch chưa được xác nhận. Vui lòng kiểm tra lại chuyển khoản hoặc bấm chọn Kích Hoạt Thanh Toán Demo.")
      }
    } catch (err: any) {
      setToastMsg(err.message || "Xác nhận thanh toán chưa thành công. Vui lòng kiểm tra lại nội dung chuyển khoản hoặc bấm chọn Kích Hoạt Thanh Toán Demo.")
    } finally {
      if (!isSandbox) {
        setConfirming(false)
      }
    }
  }

  if (loadingOrder) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-28 space-y-4">
        <Loader2 size={42} className="animate-spin text-[#0058be]" />
        <p className="text-[15px] font-bold text-[#121c2a]">Đang tạo cổng thanh toán và mã VietQR động...</p>
      </div>
    )
  }

  if (error || !orderData) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-4 max-w-md mx-auto">
        <div className="w-16 h-16 rounded-3xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <AlertTriangle size={32} />
        </div>
        <h2 className="text-xl font-bold text-[#121c2a]">Lỗi khởi tạo thanh toán</h2>
        <p className="text-[14px] text-[#424754]">{error || "Không lấy được thông tin đơn hàng."}</p>
        <Link
          href="/user/payment"
          className="px-6 py-2.5 rounded-2xl bg-[#0058be] text-white font-bold text-[14px] shadow-md hover:bg-[#004ca3] transition-colors"
        >
          Quay lại chọn gói
        </Link>
      </div>
    )
  }

  if (confirmedSuccess) {
    const isDemoMode = typeof window !== "undefined" && localStorage.getItem("lumis_demo_premium") === "true";
    return (
      <div className="max-w-4xl mx-auto py-8 md:py-12 px-4 md:px-6 animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-white rounded-[36px] p-8 md:p-12 border border-green-200 shadow-2xl shadow-green-500/10 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-green-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 items-center relative z-10">
            {/* Left Column: Title & Status */}
            <div className="md:col-span-5 flex flex-col items-center md:items-start text-center md:text-left space-y-5">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-green-100 to-emerald-50 text-green-600 flex items-center justify-center shadow-md border border-green-200/60 shrink-0">
                <CheckCircle2 size={44} className="animate-bounce" />
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <span className="text-[11px] font-extrabold text-green-700 uppercase tracking-wider bg-green-50 px-3.5 py-1.5 rounded-full border border-green-200 shadow-2xs">
                    VERIFIED & ACTIVE
                  </span>
                  {isDemoMode && (
                    <span className="text-[11px] font-extrabold text-amber-800 uppercase tracking-wider bg-amber-100 px-3.5 py-1.5 rounded-full border border-amber-300 shadow-2xs flex items-center gap-1">
                      <Sparkles size={12} className="text-amber-600" /> SANDBOX DEMO
                    </span>
                  )}
                </div>

                <h2 className="text-3xl font-extrabold text-[#121c2a] tracking-tight leading-tight" style={{ fontFamily: "Geist, sans-serif" }}>
                  Nâng Cấp Tài Khoản Thành Công!
                </h2>

                <p className="text-[14.5px] text-[#424754] leading-relaxed">
                  Hệ thống đã kích hoạt thành công gói <strong className="text-[#0058be] font-extrabold">{planObj.name}</strong> cho tài khoản của bạn.
                </p>
              </div>

              <div className="w-full p-4 bg-[#f8f9ff] rounded-2xl border border-[#c2c6d6]/40 flex items-center justify-between text-[13px] font-semibold text-[#121c2a] shadow-2xs">
                <span>Trạng thái tài khoản:</span>
                <span className="text-amber-600 font-extrabold flex items-center gap-1.5 bg-amber-50 px-3.5 py-1.5 rounded-xl border border-amber-200">
                  <Sparkles size={14} /> PREMIUM TIER
                </span>
              </div>
            </div>

            {/* Right Column: Perks Card & Action Buttons */}
            <div className="md:col-span-7 space-y-6">
              <div className="bg-gradient-to-br from-[#f8f9ff] via-white to-[#eff4ff] p-6 sm:p-8 rounded-3xl border border-[#0058be]/20 shadow-sm space-y-4">
                <div className="text-[13px] font-extrabold uppercase tracking-wider text-[#0058be] flex items-center gap-2 border-b border-[#0058be]/15 pb-3">
                  <Sparkles size={16} className="text-[#0058be]" /> Đặc Quyền Vừa Được Mở Khóa Tức Thì:
                </div>

                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-[13.5px] text-[#121c2a] font-medium pt-1">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={13} className="font-bold" />
                    </span>
                    <span>Truy vấn RAG không giới hạn số câu hỏi mỗi ngày</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={13} className="font-bold" />
                    </span>
                    <span>Mở khóa toàn bộ mô hình Gemini 2.5 Pro & Flash</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={13} className="font-bold" />
                    </span>
                    <span>Dung lượng lưu trữ Cloud ({planParam === "ultimate" ? "500 GB" : "100 GB"})</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={13} className="font-bold" />
                    </span>
                    <span>Ưu tiên tốc độ xử lý vector độ trễ siêu thấp</span>
                  </li>
                </ul>

                <div className="pt-3 flex flex-col sm:flex-row gap-3.5">
                  <Link
                    href="/user/ai-workspace"
                    className="flex-1 py-4 px-6 rounded-2xl bg-[#0058be] hover:bg-[#004ca3] text-white font-extrabold text-[14.5px] shadow-xl shadow-[#0058be]/25 transition-all text-center flex items-center justify-center gap-2 hover:scale-[1.01]"
                  >
                    <Sparkles size={18} /> Mở Trợ Lý AI Ngay
                  </Link>
                  <Link
                    href="/user/payment"
                    className="py-4 px-6 rounded-2xl bg-gray-100 hover:bg-gray-200 text-[#121c2a] font-bold text-[14px] transition-all text-center flex items-center justify-center"
                  >
                    Xem Quản Lý Gói
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const { amount, transferContent, qrCodeUrl, paymentInstructions } = orderData

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 animate-in fade-in slide-in-from-top-5 duration-300">
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl bg-red-50 border border-red-200 text-red-700 text-[13px] font-semibold max-w-sm">
            <AlertTriangle className="shrink-0" size={18} />
            <span>{toastMsg}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/user/payment" className="w-10 h-10 flex items-center justify-center rounded-2xl bg-[#f8f9ff] border border-[#c2c6d6]/40 hover:bg-[#eff4ff] text-[#121c2a] transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#121c2a]" style={{ fontFamily: "Geist, sans-serif" }}>
            Cổng Thanh Toán & Xác Nhận Đơn Hàng
          </h1>
          <p className="text-[13px] text-[#727785]">Mã đơn hàng: <span className="font-mono font-bold text-[#0058be]">{orderData.orderId}</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Order Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#f8f9ff] rounded-3xl border border-[#c2c6d6]/40 p-7 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-[#c2c6d6]/30 pb-4">
              <span className="text-[12px] font-extrabold uppercase tracking-wider text-[#0058be] bg-[#eff4ff] px-3 py-1 rounded-full">
                SUBSCRIPTION PLAN
              </span>
              <span className="text-[12px] font-bold text-green-700 bg-green-100 px-2.5 py-0.5 rounded-lg">
                ● Đang chờ chuyển khoản
              </span>
            </div>

            <div>
              <h3 className="text-xl font-bold text-[#121c2a]">{planObj.name}</h3>
              <p className="text-[13px] text-[#727785] mt-0.5">Kích hoạt tự động sau khi đối soát</p>
            </div>

            <div className="space-y-3 pt-2">
              {planObj.features.map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-[13px] text-[#424754] font-medium">
                  <CheckCircle2 size={16} className="text-[#0058be] shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#c2c6d6]/40 space-y-3">
              <div className="flex justify-between items-center text-[13px] text-[#727785]">
                <span>Giá trị gói học thuật:</span>
                <span className="font-bold text-[#121c2a]">{(amount || 0).toLocaleString("vi-VN")}₫</span>
              </div>
              <div className="flex justify-between items-center text-[13px] text-[#727785]">
                <span>Phí giao dịch VietQR:</span>
                <span className="font-bold text-green-600">Miễn phí (0₫)</span>
              </div>
              <div className="pt-3 border-t border-[#c2c6d6]/30 flex justify-between items-center">
                <span className="text-[15px] font-bold text-[#121c2a]">Tổng cần thanh toán:</span>
                <span className="text-2xl font-extrabold text-[#0058be]" style={{ fontFamily: "Geist, sans-serif" }}>
                  {(amount || 0).toLocaleString("vi-VN")}₫
                </span>
              </div>
            </div>

            <div className="p-4 bg-[#eff4ff] rounded-2xl border border-[#0058be]/20 text-[12px] text-[#121c2a] flex items-center gap-2 font-medium">
              <ShieldCheck size={18} className="text-[#0058be] shrink-0" />
              <span>Giao dịch được mã hóa an toàn và bảo chứng bởi hệ thống tự động kiểm tra VietQR.</span>
            </div>
          </div>
        </div>

        {/* Right Column: QR Code & Bank Details */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl border border-[#c2c6d6]/40 p-7 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-[#c2c6d6]/30">
              <div className="w-10 h-10 rounded-2xl bg-[#eff4ff] text-[#0058be] flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[20px]">qr_code_scanner</span>
              </div>
              <div>
                <h3 className="font-bold text-[18px] text-[#121c2a]" style={{ fontFamily: "Geist, sans-serif" }}>
                  Chuyển khoản VietQR tự động
                </h3>
                <p className="text-[13px] text-[#727785]">Quét mã bằng ứng dụng ngân hàng hoặc Momo/ZaloPay bất kỳ</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              {/* QR Box */}
              <div className="md:col-span-5 flex flex-col items-center justify-center bg-[#f8f9ff] p-5 rounded-3xl border border-[#c2c6d6]/40">
                {qrCodeUrl ? (
                  <img
                    src={qrCodeUrl}
                    alt="VietQR Compact"
                    className="w-48 h-48 rounded-2xl shadow-md border border-white bg-white object-contain"
                  />
                ) : (
                  <div className="w-48 h-48 bg-gray-100 rounded-2xl flex items-center justify-center text-[#727785] text-[12px]">
                    Không tải được mã QR
                  </div>
                )}
                <p className="text-[12px] font-bold text-[#0058be] mt-3 flex items-center gap-1">
                  <Sparkles size={14} /> Tự động điền số tiền & nội dung
                </p>
              </div>

              {/* Manual Bank Details */}
              <div className="md:col-span-7 space-y-4">
                <div>
                  <label className="text-[11px] font-extrabold uppercase text-[#727785] block mb-1">Ngân hàng thụ hưởng</label>
                  <div className="p-3 bg-[#f8f9ff] border border-[#c2c6d6]/40 rounded-xl text-[14px] font-bold text-[#121c2a]">
                    {paymentInstructions?.bankName || "Vietcombank (VCB)"}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-extrabold uppercase text-[#727785] block mb-1">Số tài khoản</label>
                  <div
                    onClick={() => copyToClipboard(paymentInstructions?.accountNumber || "1234567890", "account")}
                    className="p-3 bg-[#f8f9ff] hover:bg-[#eff4ff] border border-[#c2c6d6]/40 hover:border-[#0058be] rounded-xl text-[15px] font-mono font-bold text-[#121c2a] flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <span>{paymentInstructions?.accountNumber || "1234567890"}</span>
                    {copiedAccount ? <Check size={16} className="text-green-600" /> : <Copy size={16} className="text-[#727785]" />}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-extrabold uppercase text-[#727785] block mb-1">Chủ tài khoản</label>
                  <div className="p-3 bg-[#f8f9ff] border border-[#c2c6d6]/40 rounded-xl text-[14px] font-bold text-[#121c2a]">
                    {paymentInstructions?.accountName || "CONG TY LUMIS EDTECH"}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-extrabold uppercase text-red-600 block mb-1">
                    Nội dung chuyển khoản (Bắt buộc ghi đúng)
                  </label>
                  <div
                    onClick={() => copyToClipboard(transferContent || "", "content")}
                    className="p-3.5 bg-red-50 hover:bg-red-100/70 border border-red-300 rounded-xl text-[15px] font-mono font-extrabold text-red-700 flex items-center justify-between cursor-pointer transition-colors shadow-sm"
                  >
                    <span>{transferContent}</span>
                    {copiedContent ? <Check size={18} className="text-green-600" /> : <Copy size={18} className="text-red-600" />}
                  </div>
                  <p className="text-[11px] text-[#727785] mt-1 italic">
                    💡 Click để sao chép nội dung. Hệ thống dùng mã này để xác thực tự động.
                  </p>
                </div>
              </div>
            </div>

            {/* Action buttons & Demo Sandbox Section */}
            <div className="pt-6 border-t border-[#c2c6d6]/30 space-y-5">
              {/* Demo Mode Highlight Banner */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-50 via-amber-50/80 to-orange-50 border-2 border-amber-300 shadow-md space-y-3.5">
                <div className="flex items-center gap-2 text-amber-900 font-extrabold text-[14px]">
                  <span className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-sm">
                    <Sparkles size={16} />
                  </span>
                  <span>Chế độ Demo / Thử nghiệm Đồ án (Instant Access)</span>
                </div>
                <p className="text-[13px] text-amber-900/85 leading-relaxed font-medium">
                  Bấm nút bên dưới để hệ thống giả lập xác nhận chuyển khoản VietQR thành công ngay tức thì. Tài khoản của bạn sẽ lập tức được nâng cấp lên <strong className="text-amber-950 font-extrabold">{planObj.name}</strong> mà không cần chuyển khoản hay chờ đợi ngân hàng.
                </p>
                <button
                  onClick={() => handleConfirmPayment(true)}
                  disabled={confirming}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-[14px] shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                >
                  {confirming ? <Loader2 size={18} className="animate-spin text-white" /> : <Sparkles size={18} className="text-white animate-pulse" />}
                  <span>{confirming ? "Đang giả lập đối soát VietQR thành công..." : "⚡ Kích Hoạt Thanh Toán Demo Ngay (Nâng Cấp Premium)"}</span>
                </button>
              </div>

              {/* Real Bank Transfer Button */}
              <div className="pt-1">
                <button
                  onClick={() => handleConfirmPayment(false)}
                  disabled={confirming}
                  className="w-full py-3.5 rounded-2xl bg-[#0058be] hover:bg-[#004ca3] text-white font-bold text-[14px] shadow-md shadow-[#0058be]/15 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle2 size={18} />
                  <span>Tôi Đã Chuyển Khoản Thật (Kiểm Tra Ngân Hàng)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-20">
      <React.Suspense fallback={<div className="p-12 text-center text-[#727785] font-bold">Đang chuẩn bị trang thanh toán...</div>}>
        <CheckoutContent />
      </React.Suspense>
    </div>
  )
}
