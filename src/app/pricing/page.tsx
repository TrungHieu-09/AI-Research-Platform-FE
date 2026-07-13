"use client"

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { LandingHeader } from "@/components/layouts/landing-header";
import { useAuth } from "@/features/auth/auth-context";
import { api } from "@/lib/api";
import { Loader2, Check } from "lucide-react";

export default function PricingPage() {
  const { user, token } = useAuth();
  const [currentPlan, setCurrentPlan] = useState<"GUEST" | "FREE" | "PRO" | "ULTIMATE">("GUEST");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !user) {
      setCurrentPlan("GUEST");
      setLoading(false);
      return;
    }
    
    if (user.tier === "FREE") {
      setCurrentPlan("FREE");
      setLoading(false);
      return;
    }

    // If PREMIUM, check receipts to differentiate PRO (monthly) vs ULTIMATE (yearly)
    const checkPremiumPlan = async () => {
      try {
        const receipts = await api.get<any[]>("/api/payments/receipts").catch(() => []);
        if (Array.isArray(receipts) && receipts.length > 0) {
           const completed = receipts.filter(r => r.status === "COMPLETED")
             .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
           if (completed.length > 0) {
              const latest = completed[0];
              if (latest.planId === "PREMIUM_YEARLY") {
                 setCurrentPlan("ULTIMATE");
              } else {
                 setCurrentPlan("PRO");
              }
              setLoading(false);
              return;
           }
        }
        setCurrentPlan("PRO"); // Fallback
      } catch (err) {
        setCurrentPlan("PRO");
      } finally {
        setLoading(false);
      }
    };
    
    checkPremiumPlan();
  }, [token, user]);

  return (
    <>
      <div className="ambient-blob bg-primary-fixed w-[600px] h-[600px] top-[-200px] left-[-200px]"></div>
      <div className="ambient-blob bg-secondary-fixed w-[500px] h-[500px] top-[20%] right-[-100px]"></div>
      
      <LandingHeader />

      <main className="flex-grow pt-[120px] pb-[80px] w-full max-w-[1400px] mx-auto z-10 px-6">
        <div className="text-center mb-16">
          <h1 className="text-[40px] md:text-[56px] font-bold leading-[1.1] tracking-tight text-[#121c2a] mb-6">
            Bảng giá đơn giản, <span className="text-[#0058be]">minh bạch</span>
          </h1>
          <p className="text-[18px] text-[#424754] max-w-[672px] mx-auto leading-relaxed">
            Chọn gói phù hợp với nhu cầu nghiên cứu của bạn. Nâng cấp, hạ cấp hoặc hủy bất cứ lúc nào.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-[1200px] mx-auto group/cards">
          {/* Free Plan */}
          <div className="bg-white rounded-3xl p-8 flex flex-col h-full border border-[#c2c6d6]/40 transition-all duration-250 ease-out hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1 hover:border-[#0058be]/30 hover:z-10 relative">
            <h3 className="text-[20px] font-bold text-[#121c2a] mb-2">Explorer (Miễn phí)</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-[48px] font-bold text-[#121c2a] font-mono tracking-tight">0₫</span>
              <span className="text-[#727785] font-medium text-[15px]">/ vĩnh viễn</span>
            </div>
            <p className="text-[14px] text-[#424754] mb-8 h-[40px]">
              Hoàn hảo cho sinh viên và các nhà nghiên cứu muốn bắt đầu.
            </p>
            
            {loading ? (
              <button disabled className="w-full py-3 rounded-xl bg-gray-100 text-[#727785] mb-8 flex justify-center"><Loader2 size={20} className="animate-spin" /></button>
            ) : currentPlan === "GUEST" ? (
              <Link href="/signup" className="w-full py-3 rounded-xl bg-white border border-[#c2c6d6] text-[#424754] font-bold hover:bg-gray-50 transition-colors mb-8 shadow-sm text-center block">
                Bắt đầu miễn phí
              </Link>
            ) : currentPlan === "FREE" ? (
              <button disabled className="w-full py-3 rounded-xl bg-gray-100 text-[#727785] font-bold text-[14px] cursor-not-allowed mb-8 flex items-center justify-center gap-2">
                <Check size={18} /> Gói Hiện Tại Của Bạn
              </button>
            ) : (
              <button disabled className="w-full py-3 rounded-xl bg-gray-100 text-[#727785] font-bold text-[14px] cursor-not-allowed mb-8 flex items-center justify-center gap-2">
                Không thể hạ cấp
              </button>
            )}

            <ul className="flex flex-col gap-4">
              {["10-15 truy vấn RAG/ngày", "Lưu trữ đám mây 5 GB", "Truy xuất vector cơ bản", "Hỗ trợ cộng đồng diễn đàn"].map(feature => (
                <li key={feature} className="flex items-center gap-3 text-[14px] text-[#424754]">
                  <span className="material-symbols-outlined text-[18px] text-[#727785]">check_circle</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Pro Plan */}
          <div className="bg-white rounded-3xl p-8 flex flex-col h-full border-2 border-[#0058be] relative shadow-[0_8px_30px_rgb(0,88,190,0.12)] transition-all duration-250 ease-out hover:shadow-[0_20px_40px_rgb(0,88,190,0.25)] hover:scale-[1.02] hover:-translate-y-2 hover:border-[#004ca3] z-10 md:-translate-y-2">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#0058be] text-white px-5 py-1.5 rounded-full text-[12px] font-extrabold tracking-wider uppercase shadow-md whitespace-nowrap">
              PHỔ BIẾN NHẤT
            </div>
            <h3 className="text-[20px] font-bold text-[#0058be] mb-2">AI Pro (Gói Tháng)</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-[48px] font-bold text-[#121c2a] font-mono tracking-tight">250.000₫</span>
              <span className="text-[#727785] font-medium text-[15px]">/ tháng</span>
            </div>
            <p className="text-[14px] text-[#424754] mb-8 h-[40px]">
              Dành cho sinh viên làm khóa luận & đồ án tốt nghiệp cần phân tích sâu.
            </p>
            
            {loading ? (
              <button disabled className="w-full py-3 rounded-xl bg-[#0058be]/70 text-white mb-8 flex justify-center"><Loader2 size={20} className="animate-spin" /></button>
            ) : currentPlan === "GUEST" ? (
              <Link href="/login" className="w-full py-3 rounded-xl bg-[#0058be] text-white font-bold hover:bg-[#004ca3] transition-all duration-200 mb-8 shadow-[0_4px_14px_0_rgb(0,88,190,0.39)] hover:shadow-[0_6px_20px_rgba(0,88,190,0.23)] text-center block hover:scale-[0.98]">
                Đăng nhập để nâng cấp
              </Link>
            ) : currentPlan === "FREE" ? (
              <Link href="/user/payment/checkout?plan=ai" className="w-full py-3 rounded-xl bg-[#0058be] text-white font-bold hover:bg-[#004ca3] transition-all duration-200 mb-8 shadow-[0_4px_14px_0_rgb(0,88,190,0.39)] hover:shadow-[0_6px_20px_rgba(0,88,190,0.23)] text-center block hover:scale-[0.98]">
                Nâng Cấp AI Pro Ngay
              </Link>
            ) : currentPlan === "PRO" ? (
              <button disabled className="w-full py-3 rounded-xl bg-[#eff4ff] text-[#0058be] font-bold mb-8 cursor-default flex items-center justify-center gap-2 text-[14px]">
                <Check size={18} /> Gói Hiện Tại Của Bạn
              </button>
            ) : (
              <button disabled className="w-full py-3 rounded-xl bg-gray-100 text-[#727785] font-bold mb-8 cursor-not-allowed flex items-center justify-center gap-2 text-[14px]">
                Không thể hạ cấp
              </button>
            )}

            <ul className="flex flex-col gap-4">
              {[
                "Truy vấn RAG không giới hạn", 
                "Mô hình Gemini 2.5 Pro & Flash", 
                "Lưu trữ đám mây 100 GB", 
                "Truy xuất vector độ trễ thấp (<500ms)", 
                "Hỗ trợ kỹ thuật ưu tiên 24/7"
              ].map(feature => (
                <li key={feature} className="flex items-center gap-3 text-[14px] text-[#121c2a] font-medium">
                  <span className="material-symbols-outlined text-[18px] text-[#0058be]">check_circle</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Ultimate Plan */}
          <div className="bg-white rounded-3xl p-8 flex flex-col h-full border border-[#c2c6d6]/40 transition-all duration-250 ease-out hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1 hover:border-[#0058be]/30 hover:z-10 relative">
            <h3 className="text-[20px] font-bold text-[#121c2a] mb-2">Ultimate (Gói Năm)</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-[48px] font-bold text-[#121c2a] font-mono tracking-tight">490.000₫</span>
              <span className="text-[#727785] font-medium text-[15px]">/ 1 năm (tiết kiệm 80%)</span>
            </div>
            <p className="text-[14px] text-[#424754] mb-8 h-[40px]">
              Nghiên cứu trọn năm không lo ngắt quãng cho nhóm nghiên cứu.
            </p>
            
            {loading ? (
              <button disabled className="w-full py-3 rounded-xl border border-[#0058be]/30 text-[#0058be] mb-8 flex justify-center"><Loader2 size={20} className="animate-spin" /></button>
            ) : currentPlan === "GUEST" ? (
              <Link href="/login" className="w-full py-3 rounded-xl bg-white border border-[#0058be] text-[#0058be] font-bold hover:bg-[#f8f9ff] transition-all duration-200 mb-8 text-center block hover:scale-[0.98]">
                Đăng nhập để đăng ký
              </Link>
            ) : (currentPlan === "FREE" || currentPlan === "PRO") ? (
              <Link href="/user/payment/checkout?plan=ultimate" className="w-full py-3 rounded-xl bg-white border border-[#0058be] text-[#0058be] font-bold hover:bg-[#f8f9ff] transition-all duration-200 mb-8 text-center block hover:scale-[0.98]">
                {currentPlan === "PRO" ? "Nâng Cấp Lên Ultimate" : "Đăng Ký Gói Ultimate"}
              </Link>
            ) : (
              <button disabled className="w-full py-3 rounded-xl bg-[#f8f9ff] text-[#0058be] border border-[#0058be]/30 font-bold mb-8 cursor-default flex items-center justify-center gap-2 text-[14px]">
                <Check size={18} /> Gói Hiện Tại Của Bạn
              </button>
            )}

            <ul className="flex flex-col gap-4">
              {[
                "Trọn quyền lợi AI Pro trong 365 ngày", 
                "Lưu trữ đám mây 500 GB", 
                "Ưu tiên RAG không nghẽn giờ cao điểm", 
                "Chia sẻ không gian làm việc nhóm"
              ].map(feature => (
                <li key={feature} className="flex items-center gap-3 text-[14px] text-[#424754]">
                  <span className="material-symbols-outlined text-[18px] text-[#9333ea]">check_circle</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* FAQ Section */}
        <div className="mt-32 max-w-[800px] mx-auto">
          <h2 className="text-[28px] font-bold text-center text-[#121c2a] mb-12">Câu hỏi thường gặp</h2>
          <div className="flex flex-col gap-6">
            <div className="bg-white p-6 rounded-2xl border border-[#c2c6d6]/40 shadow-sm">
              <h4 className="text-[16px] font-bold text-[#121c2a] mb-2">Tôi có thể hủy đăng ký bất cứ lúc nào không?</h4>
              <p className="text-[15px] text-[#424754] leading-relaxed">Có, bạn có thể hủy đăng ký bất cứ lúc nào từ cài đặt tài khoản của mình. Bạn vẫn có quyền sử dụng các tính năng Pro cho đến cuối chu kỳ thanh toán hiện tại.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-[#c2c6d6]/40 shadow-sm">
              <h4 className="text-[16px] font-bold text-[#121c2a] mb-2">Điều gì xảy ra với tài liệu của tôi nếu tôi hạ cấp xuống gói Miễn phí?</h4>
              <p className="text-[15px] text-[#424754] leading-relaxed">Tài liệu của bạn vẫn được lưu trữ an toàn. Tuy nhiên, nếu thư viện vượt quá giới hạn 50 tài liệu, bạn sẽ không thể tải thêm cho đến khi xóa bớt hoặc nâng cấp lại.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-[#c2c6d6]/40 shadow-sm">
              <h4 className="text-[16px] font-bold text-[#121c2a] mb-2">Có chiết khấu cho các cơ sở giáo dục không?</h4>
              <p className="text-[15px] text-[#424754] leading-relaxed">Có! Chúng tôi giảm 50% cho sinh viên và giảng viên có email .edu. Vui lòng liên hệ đội ngũ hỗ trợ để nhận ưu đãi.</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full py-md px-margin-mobile md:px-margin-desktop flex justify-between items-center mt-auto border-t border-[#c2c6d6]/30 bg-white z-50 relative">
        <div className="text-[14px] font-semibold tracking-wider text-[#121c2a]">
          Lumis
        </div>
        <div className="text-[14px] text-[#727785]">
          © 2026 Lumis. Chuẩn xác trong từng khám phá.
        </div>
        <div className="flex gap-md">
          <Link
            href="#"
            className="text-[14px] text-[#727785] hover:text-[#121c2a] transition-colors"
          >
            Chính sách bảo mật
          </Link>
          <Link
            href="#"
            className="text-[14px] text-[#727785] hover:text-[#121c2a] transition-colors"
          >
            Điều khoản dịch vụ
          </Link>
        </div>
      </footer>
    </>
  );
}

