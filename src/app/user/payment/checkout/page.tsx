"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

const PLANS = {
  storage: {
    name: "Lưu trữ Pro",
    price: "125.000",
    features: ["Lưu trữ đám mây 100 GB", "500 truy vấn AI / tháng", "Hỗ trợ ưu tiên"]
  },
  ai: {
    name: "AI Pro",
    price: "250.000",
    features: ["Truy vấn AI không giới hạn", "Mô hình nâng cao (GPT-4)", "Lưu trữ đám mây 5 GB"]
  },
  ultimate: {
    name: "Ultimate",
    price: "300.000",
    features: ["Truy vấn và mô hình AI không giới hạn", "Lưu trữ đám mây 100 GB", "Hỗ trợ chuyên dụng 24/7"]
  }
}

function CheckoutContent() {
  const searchParams = useSearchParams()
  const planId = searchParams.get("plan") as keyof typeof PLANS
  const plan = PLANS[planId]

  // If no plan is selected or invalid plan, show error or redirect
  if (!plan) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20">
        <span className="material-symbols-outlined text-[48px] text-[#c2c6d6] mb-4">error</span>
        <h2 className="text-[20px] font-semibold mb-2 text-[#121c2a]">Gói được chọn không hợp lệ</h2>
        <Link href="/user/payment" className="text-[#004191] hover:underline font-medium text-[14px]">
          Quay lại Quản lý thanh toán
        </Link>
      </div>
    )
  }

  const transferCode = `PAY LUMIS ${planId.toUpperCase()}`

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/user/payment" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-[#424753] transition-colors">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </Link>
        <h2 className="font-semibold text-[24px] md:text-[28px] tracking-[-0.02em] text-[#121c2a]">Thanh toán an toàn</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Order Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#f8f9ff] rounded-xl border border-[#c2c6d6]/30 p-6">
            <h3 className="font-semibold text-[16px] text-[#121c2a] mb-4">Tóm tắt đơn hàng</h3>
            
            <div className="flex justify-between items-start mb-4 pb-4 border-b border-[#c2c6d6]/30">
              <div>
                <h4 className="font-medium text-[15px] text-[#004191]">Gói {plan.name}</h4>
                <p className="text-[13px] text-[#424753] mt-1">Đăng ký hàng tháng</p>
              </div>
              <div className="text-right">
                <span className="font-bold text-[18px] text-[#121c2a]">{plan.price}₫</span>
                <span className="text-[13px] text-[#424753]">/tháng</span>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {plan.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-[13px] text-[#424753]">
                  <span className="material-symbols-outlined text-[16px] text-[#004191]">check_circle</span>
                  {feature}
                </div>
              ))}
            </div>

            <div className="bg-white rounded-lg p-4 border border-[#c2c6d6]/30">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[14px] text-[#424753]">Tổng phụ</span>
                <span className="font-medium text-[14px] text-[#121c2a]">{plan.price}₫</span>
              </div>
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-dashed border-[#c2c6d6]/50">
                <span className="text-[14px] text-[#424753]">Thuế (0%)</span>
                <span className="font-medium text-[14px] text-[#121c2a]">0₫</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-[16px] text-[#121c2a]">Tổng thanh toán</span>
                <span className="font-bold text-[24px] text-[#004191]">{plan.price}₫</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Banking Information */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-xl border border-[#c2c6d6]/30 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#c2c6d6]/20">
              <div className="w-10 h-10 rounded-full bg-[#f0f7ff] flex items-center justify-center text-[#004191]">
                <span className="material-symbols-outlined text-[20px]">account_balance</span>
              </div>
              <div>
                <h3 className="font-semibold text-[18px] text-[#121c2a]">Chuyển khoản ngân hàng</h3>
                <p className="text-[13px] text-[#424753]">Quét mã QR hoặc chuyển khoản thủ công</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* QR Code Mock */}
              <div className="w-full md:w-[220px] shrink-0 flex flex-col items-center">
                <div className="w-[200px] h-[200px] bg-[#f8f9ff] border-2 border-dashed border-[#004191]/30 rounded-xl flex flex-col items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-[48px] text-[#004191]/40 mb-2">qr_code_2</span>
                  <span className="text-[12px] text-[#424753] font-medium text-center px-4">VietQR / Momo<br/>Quét để thanh toán</span>
                </div>
                <p className="text-[12px] text-[#424753] text-center">Mở ứng dụng ngân hàng của bạn để quét mã QR này.</p>
              </div>

              {/* Manual Bank Details */}
              <div className="flex-1 w-full space-y-4">
                <div>
                  <p className="text-[12px] text-[#727785] mb-1 uppercase font-semibold tracking-wider">Tên ngân hàng</p>
                  <div className="font-medium text-[15px] text-[#121c2a] bg-[#f8f9ff] p-3 rounded-lg border border-[#c2c6d6]/30 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[#004191]">account_balance</span>
                    Vietcombank (VCB)
                  </div>
                </div>
                
                <div>
                  <p className="text-[12px] text-[#727785] mb-1 uppercase font-semibold tracking-wider">Số tài khoản</p>
                  <div className="font-medium text-[15px] text-[#121c2a] bg-[#f8f9ff] p-3 rounded-lg border border-[#c2c6d6]/30 flex justify-between items-center group cursor-pointer hover:border-[#004191]/50 transition-colors">
                    <span className="tracking-widest">1023 4567 890</span>
                    <span className="material-symbols-outlined text-[18px] text-[#004191] opacity-60 group-hover:opacity-100 transition-opacity">content_copy</span>
                  </div>
                </div>

                <div>
                  <p className="text-[12px] text-[#727785] mb-1 uppercase font-semibold tracking-wider">Chủ tài khoản</p>
                  <div className="font-medium text-[15px] text-[#121c2a] bg-[#f8f9ff] p-3 rounded-lg border border-[#c2c6d6]/30">
                    LUMIS RESEARCH PLATFORM
                  </div>
                </div>

                <div>
                  <p className="text-[12px] text-[#ba1a1a] mb-1 uppercase font-semibold tracking-wider">Nội dung chuyển khoản (Quan trọng)</p>
                  <div className="font-mono font-bold text-[16px] text-[#ba1a1a] bg-[#fff5f5] p-3 rounded-lg border border-[#ba1a1a]/20 flex justify-between items-center group cursor-pointer hover:border-[#ba1a1a]/50 transition-colors">
                    <span>{transferCode}</span>
                    <span className="material-symbols-outlined text-[18px] text-[#ba1a1a] opacity-60 group-hover:opacity-100 transition-opacity">content_copy</span>
                  </div>
                  <p className="text-[11px] text-[#ba1a1a] mt-1.5 flex items-start gap-1">
                    <span className="material-symbols-outlined text-[14px]">info</span>
                    Bạn phải nhập chính xác nội dung này để chúng tôi có thể xác minh thanh toán của bạn.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 pt-6 border-t border-[#c2c6d6]/30 flex flex-col sm:flex-row gap-3">
              <button className="flex-1 bg-gradient-to-br from-[#004191] to-[#0051d6] text-white font-semibold text-[14px] py-3 rounded-lg hover:opacity-90 transition-opacity shadow-md flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                Tôi đã hoàn tất chuyển khoản
              </button>
              <Link href="/user/payment" className="flex-1 bg-white text-[#424753] border border-[#c2c6d6] font-semibold text-[14px] py-3 rounded-lg hover:bg-[#f8f9ff] transition-colors text-center flex items-center justify-center">
                Hủy
              </Link>
            </div>

            <div className="mt-4 text-center">
              <p className="text-[12px] text-[#727785]">Tài khoản của bạn sẽ được nâng cấp trong vòng 5-10 phút sau khi chuyển khoản thành công.</p>
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
      <React.Suspense fallback={<div className="p-8 text-center text-[#424753]">Đang tải chi tiết thanh toán...</div>}>
        <CheckoutContent />
      </React.Suspense>
    </div>
  )
}
