import Link from "next/link";
import { LandingHeader } from "@/components/layouts/landing-header";

export default function PricingPage() {
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
            Chọn gói phù hợp với nhu cầu nghiên cứu của bạn. Nâng cấp, hạ cấp hoặc hủy bất kỳ lúc nào.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-[1200px] mx-auto">
          {/* Free Plan */}
          <div className="bg-white rounded-3xl p-8 flex flex-col h-full border border-[#c2c6d6]/40 hover:border-[#0058be]/30 transition-all hover:shadow-lg hover:-translate-y-1">
            <h3 className="text-[20px] font-bold text-[#121c2a] mb-2">Explorer (Miễn phí)</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-[48px] font-bold text-[#121c2a]">$0</span>
              <span className="text-[#727785] font-medium">/ trọn đời</span>
            </div>
            <p className="text-[14px] text-[#424754] mb-8 h-[40px]">
              Hoàn hảo cho sinh viên và nhà nghiên cứu cá nhân mới bắt đầu.
            </p>
            <button className="w-full py-3 rounded-xl bg-white border border-[#c2c6d6] text-[#424754] font-bold hover:bg-gray-50 transition-colors mb-8 shadow-sm">
              Bắt đầu miễn phí
            </button>
            <ul className="flex flex-col gap-4">
              {["Tối đa 50 tài liệu", "AI tổng hợp cơ bản", "Tìm kiếm tiêu chuẩn", "1 Bộ sưu tập"].map(feature => (
                <li key={feature} className="flex items-center gap-3 text-[14px] text-[#424754]">
                  <span className="material-symbols-outlined text-[18px] text-[#0058be]">check_circle</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Pro Plan */}
          <div className="bg-white rounded-3xl p-8 flex flex-col h-full border-2 border-[#0058be] relative shadow-xl transform md:-translate-y-4">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#0058be] text-white px-4 py-1 rounded-full text-[12px] font-bold tracking-wide uppercase shadow-sm whitespace-nowrap">
              Phổ biến nhất
            </div>
            <h3 className="text-[20px] font-bold text-[#0058be] mb-2">Researcher Pro</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-[48px] font-bold text-[#121c2a]">$12</span>
              <span className="text-[#727785] font-medium">/ tháng</span>
            </div>
            <p className="text-[14px] text-[#424754] mb-8 h-[40px]">
              Dành cho giới học thuật và chuyên gia cần phân tích chuyên sâu.
            </p>
            <button className="w-full py-3 rounded-xl bg-[#0058be] text-white font-bold hover:bg-[#2170e4] transition-colors mb-8 shadow-md">
              Dùng thử miễn phí 14 ngày
            </button>
            <ul className="flex flex-col gap-4">
              {["Không giới hạn tài liệu", "AI tổng hợp nâng cao", "Tìm kiếm vector ngữ nghĩa", "Không giới hạn bộ sưu tập", "Hỗ trợ ưu tiên"].map(feature => (
                <li key={feature} className="flex items-center gap-3 text-[14px] text-[#424754]">
                  <span className="material-symbols-outlined text-[18px] text-[#0058be]">check_circle</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Team Plan */}
          <div className="bg-white rounded-3xl p-8 flex flex-col h-full border border-[#c2c6d6]/40 hover:border-[#0058be]/30 transition-all hover:shadow-lg hover:-translate-y-1">
            <h3 className="text-[20px] font-bold text-[#121c2a] mb-2">Lab & Nhóm</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-[48px] font-bold text-[#121c2a]">$29</span>
              <span className="text-[#727785] font-medium">/ thành viên / tháng</span>
            </div>
            <p className="text-[14px] text-[#424754] mb-8 h-[40px]">
              Thiết kế riêng cho các phòng thí nghiệm và nhóm nghiên cứu cộng tác.
            </p>
            <button className="w-full py-3 rounded-xl bg-white border border-[#c2c6d6] text-[#424754] font-bold hover:bg-gray-50 transition-colors mb-8 shadow-sm">
              Liên hệ bộ phận bán hàng
            </button>
            <ul className="flex flex-col gap-4">
              {["Bao gồm tất cả tính năng gói Pro", "Không gian làm việc chung", "Đồng tác giả & ghi chú chung", "Trang quản trị (Admin Dashboard)", "Tích hợp đăng nhập một lần (SSO)"].map(feature => (
                <li key={feature} className="flex items-center gap-3 text-[14px] text-[#424754]">
                  <span className="material-symbols-outlined text-[18px] text-[#0058be]">check_circle</span>
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
              <h4 className="text-[16px] font-bold text-[#121c2a] mb-2">Tôi có thể hủy gói đăng ký bất kỳ lúc nào không?</h4>
              <p className="text-[15px] text-[#424754] leading-relaxed">Có, bạn có thể hủy gói đăng ký bất cứ lúc nào trong phần cài đặt tài khoản. Bạn vẫn giữ quyền truy cập các tính năng Pro cho đến hết chu kỳ thanh toán hiện tại.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-[#c2c6d6]/40 shadow-sm">
              <h4 className="text-[16px] font-bold text-[#121c2a] mb-2">Điều gì xảy ra với tài liệu nếu tôi hạ cấp xuống gói Explorer (Miễn phí)?</h4>
              <p className="text-[15px] text-[#424754] leading-relaxed">Tài liệu của bạn vẫn được lưu trữ an toàn. Tuy nhiên, nếu thư viện của bạn vượt quá giới hạn 50 tài liệu của gói Explorer, bạn sẽ không thể tải thêm tài liệu mới cho đến khi xóa bớt tài liệu cũ hoặc nâng cấp lại.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-[#c2c6d6]/40 shadow-sm">
              <h4 className="text-[16px] font-bold text-[#121c2a] mb-2">Nền tảng có chính sách ưu đãi cho các cơ sở giáo dục không?</h4>
              <p className="text-[15px] text-[#424754] leading-relaxed">Có! Chúng tôi hỗ trợ giảm giá 50% cho sinh viên, giảng viên và nghiên cứu sinh có email học thuật hợp lệ. Vui lòng liên hệ với đội ngũ hỗ trợ của chúng tôi để nhận ưu đãi.</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full py-md px-margin-mobile md:px-margin-desktop flex justify-between items-center mt-auto border-t border-[#c2c6d6]/30 bg-white z-50 relative">
        <div className="text-[14px] font-semibold tracking-wider text-[#121c2a]">
          Lumis
        </div>
        <div className="text-[14px] text-[#727785]">
          © 2026 Lumis. Khám phá tri thức chính xác.
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
