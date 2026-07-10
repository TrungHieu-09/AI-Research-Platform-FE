import Link from "next/link";
import { LandingHeader } from "@/components/layouts/landing-header";
import { FadeInSection } from "@/components/animations/fade-in-section";
import { GetStartedButton } from "@/components/ui/get-started-button";

export default function Home() {
  return (
    <>
      <div className="ambient-blob bg-primary-fixed w-[600px] h-[600px] top-[-200px] left-[-200px]"></div>
      <div className="ambient-blob bg-secondary-fixed w-[500px] h-[500px] top-[20%] right-[-100px]"></div>
      <div className="ambient-blob bg-surface-container-high w-[700px] h-[700px] bottom-[-200px] left-[20%]"></div>

      <LandingHeader />

      <main className="flex-grow pt-xl mt-lg px-margin-mobile md:px-margin-desktop w-full max-w-[1400px] mx-auto z-10 overflow-hidden">
        <FadeInSection className="flex flex-col lg:flex-row items-center justify-between gap-lg py-[80px] min-h-[80vh]">
          <div className="flex-1 flex flex-col items-start gap-lg w-full max-w-[672px]">
            <div className="inline-flex items-center gap-xs px-sm py-xs bg-surface-container-high rounded-full text-[#0058be] text-[12px] font-medium border border-[#adc6ff]">
              <span className="material-symbols-outlined text-[16px]">
                auto_awesome
              </span>
              <span>Giới thiệu Tổng hợp AI 2.0</span>
            </div>

            <h1 className="text-[48px] font-bold leading-[1.1] tracking-tight text-on-surface">
              Trợ lý thông minh cho{" "}
              <span className="text-[#0058be]">Nghiên cứu</span>.
            </h1>

            <p className="text-[18px] leading-[1.6] text-[#424754] dark:text-[#c2c6d6] w-full max-w-[576px]">
              Đẩy nhanh quá trình khám phá với không gian làm việc AI được thiết kế
              dành riêng cho nghiên cứu học thuật và chuyên sâu. Sắp xếp, phân tích
              và tổng hợp kiến thức một cách dễ dàng.
            </p>

            <div className="flex flex-col sm:flex-row gap-md mt-sm w-full sm:w-auto">
              <GetStartedButton className="bg-gradient-to-r from-[#0058be] to-[#316bf3] hover:from-[#2170e4] hover:to-[#0051d5] text-white text-[14px] font-semibold py-[16px] px-[32px] rounded-2xl shadow-[0_10px_40px_rgba(31,41,55,0.15)] hover:shadow-[0_15px_50px_rgba(31,41,55,0.2)] transition-all duration-300 transform hover:-translate-y-1 w-full sm:w-auto text-center border-none">
                Bắt đầu miễn phí
              </GetStartedButton>
              <button className="glass-panel text-on-surface text-[14px] font-semibold py-[16px] px-[32px] rounded-2xl hover:bg-[#d9e3f6]/50 transition-all duration-300 w-full sm:w-auto text-center flex items-center justify-center gap-sm border border-black/5 dark:border-white/10 dark:text-white">
                <span className="material-symbols-outlined">play_circle</span>
                Xem Demo
              </button>
            </div>
          </div>

          <div className="flex-1 relative w-full aspect-square max-w-[600px] lg:max-w-none">
            <div className="w-full h-full relative rounded-3xl overflow-hidden glass-panel ai-spark-border p-md flex items-center justify-center bg-surface/30">
              <img
                alt="Abstract AI documents"
                className="w-full h-full object-cover rounded-2xl opacity-90 mix-blend-overlay"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBshQc5MIFmp6ffxVLKfWm7uCD3mgKu9K06bdkPY1PFjAywp_okmhQroIWsQi8D7TzSsImrbWlVOrVuhQVZH7xnRg4_ELKsCjY3HXeLDvlMFjTCAQ1qijvWsElcvWQXLDW_MXoz9BRvfdZZ_cMcO7rxiduUJujlKXQM95RwcIAUgf2NPyEmRTlaGDGzdaNZCiVVp4LtB3Y0SO6Mf6WWZMhYXVh4fZ8GgjUWd552iADJuOugXMH4liNNTwQSHFsWpffe0lPvRaUe735f"
              />

              <div className="absolute inset-0 p-lg flex flex-col gap-md justify-center items-center z-10 pointer-events-none">
                <div className="glass-panel w-3/4 h-24 rounded-xl flex items-center p-md gap-md transform -rotate-2 hover:rotate-0 transition-transform duration-500">
                  <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-on-primary">
                    <span className="material-symbols-outlined">
                      description
                    </span>
                  </div>
                  <div className="flex-1 flex flex-col gap-xs">
                    <div className="h-3 w-1/2 bg-surface-container-highest rounded"></div>
                    <div className="h-2 w-3/4 bg-surface-container-highest rounded"></div>
                  </div>
                </div>

                <div className="glass-panel w-5/6 h-32 rounded-xl flex items-center p-md gap-md transform translate-x-4 ai-spark-border">
                  <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-primary">
                    <span className="material-symbols-outlined text-[20px]">
                      auto_awesome
                    </span>
                  </div>
                  <div className="flex-1 flex flex-col gap-sm">
                    <div className="h-2 w-full bg-surface-container-highest rounded"></div>
                    <div className="h-2 w-5/6 bg-surface-container-highest rounded"></div>
                    <div className="h-2 w-4/6 bg-surface-container-highest rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeInSection>

        <FadeInSection className="py-xl" id="features">
          <div className="text-center mb-xl">
            <h2 className="text-[32px] font-semibold leading-[1.2] tracking-tight text-on-surface mb-md">
              Được thiết kế cho Công việc Chuyên sâu
            </h2>
            <p className="text-[18px] text-on-surface-variant max-w-[672px] mx-auto">
              Mọi công cụ bạn cần để chuyển từ dữ liệu thô sang thông tin chi tiết được tổng hợp.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
            <div className="md:col-span-2 glass-panel rounded-3xl p-lg flex flex-col justify-between overflow-hidden relative group h-[400px]">
              <div className="z-10 relative">
                <span className="material-symbols-outlined text-[32px] text-[#0058be] mb-sm block">
                  psychology
                </span>
                <h3 className="text-[24px] font-medium leading-[1.3] text-on-surface mb-sm">
                  Phân tích bằng AI
                </h3>
                <p className="text-[16px] text-on-surface-variant max-w-[448px] mt-4">
                  Tóm tắt nhanh bài báo, trích xuất phương pháp chính và
                  nhận diện mâu thuẫn trên toàn bộ thư viện của bạn bằng
                  các mô hình ngôn ngữ tiên tiến.
                </p>
              </div>

              <div className="absolute right-[-5%] bottom-[-10%] w-2/3 h-2/3 bg-surface dark:bg-inverse-surface rounded-tl-3xl shadow-[-10px_-10px_30px_rgba(31,41,55,0.05)] p-md border-t border-l border-black/5 dark:border-white/10 transform group-hover:-translate-y-2 group-hover:-translate-x-2 transition-transform duration-500">
                <div className="flex items-center gap-sm mb-sm text-[#0058be]">
                  <span className="material-symbols-outlined text-[16px]">
                    auto_awesome
                  </span>
                  <span className="text-[12px] font-medium">
                    Đã hoàn thành Tổng hợp
                  </span>
                </div>
                <div className="h-2 w-full bg-surface-container-highest dark:bg-surface-variant/20 rounded mb-2"></div>
                <div className="h-2 w-5/6 bg-surface-container-highest dark:bg-surface-variant/20 rounded mb-2"></div>
                <div className="h-2 w-4/6 bg-surface-container-highest dark:bg-surface-variant/20 rounded"></div>
              </div>
            </div>

            <div className="glass-panel rounded-3xl p-lg flex flex-col justify-start relative group h-[400px]">
              <span className="material-symbols-outlined text-[32px] text-[#0051d5] mb-sm block">
                travel_explore
              </span>
              <h3 className="text-[24px] font-medium leading-[1.3] text-on-surface mb-sm">
                Tìm kiếm Đa năng
              </h3>
              <p className="text-[16px] text-on-surface-variant mt-4 max-w-[448px]">
                Tìm trích dẫn chính xác, hình ảnh hoặc khái niệm trên hàng nghìn
                PDF trong vài mili giây. Tìm kiếm ngữ nghĩa hiểu những gì bạn muốn nói,
                không chỉ những gì bạn gõ.
              </p>
              <div className="mt-auto w-full bg-surface rounded-xl p-sm shadow-sm flex items-center gap-sm border border-black/5 dark:border-white/10 dark:bg-inverse-surface">
                <span className="material-symbols-outlined text-outline">
                  search
                </span>
                <span className="text-[14px] text-outline-variant">
                  "cơ chế độ mềm dẻo của hệ thần kinh"
                </span>
              </div>
            </div>

            <div className="glass-panel rounded-3xl p-lg flex flex-col justify-start relative group h-[400px]">
              <span className="material-symbols-outlined text-[32px] text-[#924700] mb-sm block">
                group_work
              </span>
              <h3 className="text-[24px] font-medium leading-[1.3] text-on-surface mb-sm">
                Không gian làm việc chung
              </h3>
              <p className="text-[16px] text-on-surface-variant mt-4 max-w-[448px]">
                Chia sẻ thư viện đã chọn lọc, cùng ghi chú và tổng hợp
                kết quả với nhóm nghiên cứu hoặc phòng thí nghiệm theo thời gian thực.
              </p>
              <div className="mt-auto flex -space-x-3">
                <div className="w-10 h-10 rounded-full bg-[#2170e4] border-2 border-white flex items-center justify-center text-white text-[12px] font-medium">
                  A
                </div>
                <div className="w-10 h-10 rounded-full bg-[#316bf3] border-2 border-white flex items-center justify-center text-white text-[12px] font-medium">
                  B
                </div>
                <div className="w-10 h-10 rounded-full bg-[#b75b00] border-2 border-white flex items-center justify-center text-white text-[12px] font-medium">
                  C
                </div>
              </div>
            </div>

            <div className="md:col-span-2 glass-panel ai-spark-border rounded-3xl p-lg flex flex-col justify-center items-center text-center overflow-hidden h-[400px] bg-gradient-to-br from-surface to-surface-container-low">
              <span className="material-symbols-outlined text-[48px] text-[#0058be] mb-md block">
                library_add_check
              </span>
              <h3 className="text-[32px] font-semibold leading-[1.2] text-on-surface mb-md">
                Sẵn sàng sắp xếp mọi thứ ngăn nắp?
              </h3>
              <button className="bg-[#0058be] hover:bg-[#2170e4] text-white text-[14px] font-semibold py-md px-lg rounded-full shadow-sm transition-all duration-200 mt-2 border-none">
                Bắt đầu không gian làm việc miễn phí
              </button>
            </div>
          </div>
        </FadeInSection>

        <FadeInSection className="pt-xl pb-12" id="how-it-works">
          {/* Hero for How It Works */}
          <div className="text-center mb-xl">
            <div className="inline-block mb-4 px-3 py-1 bg-[#eff4ff] text-[#0058be] text-[12px] font-bold tracking-wide rounded-full border border-[#0058be]/20 uppercase">
              Đơn giản. Nhanh chóng. Thông minh.
            </div>
            <h2 className="text-[36px] md:text-[48px] font-bold leading-[1.2] tracking-tight text-[#121c2a] mb-md">
              Từ bài báo gốc đến <span className="text-[#0058be]">thông tin chi tiết</span> thực tế
            </h2>
            <p className="text-[18px] text-[#424754] max-w-[672px] mx-auto leading-relaxed">
              Lumis xử lý mượt mà toàn bộ thư viện nghiên cứu của bạn, hiểu các liên kết ngữ nghĩa và cho phép bạn trò chuyện với toàn bộ hệ thống cơ sở kiến thức.
            </p>
          </div>
          
          {/* 4-Step Process */}
          <div className="relative max-w-[1200px] mx-auto px-6 mb-24">
            {/* Connecting line for desktop */}
            <div className="hidden lg:block absolute top-[60px] left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-transparent via-[#c2c6d6]/50 to-transparent"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center group bg-white p-6 rounded-3xl border border-[#c2c6d6]/40 shadow-sm hover:shadow-md hover:border-[#0058be]/30 transition-all">
                <div className="w-16 h-16 rounded-2xl bg-white border border-[#0058be]/20 flex items-center justify-center text-[#0058be] mb-6 shadow-sm group-hover:scale-110 group-hover:bg-[#0058be] group-hover:text-white transition-all relative">
                  <span className="absolute -top-3 -left-3 text-[12px] font-bold text-[#c2c6d6] bg-white px-1">01</span>
                  <span className="material-symbols-outlined text-[28px]">upload_file</span>
                </div>
                <h3 className="text-[18px] font-bold text-[#121c2a] mb-3">Tải lên Tài liệu</h3>
                <p className="text-[14px] text-[#424754] leading-relaxed">
                  Nhập trực tiếp file PDF, Word và các bài báo nghiên cứu vào Thư viện bảo mật của bạn.
                </p>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center group bg-white p-6 rounded-3xl border border-[#c2c6d6]/40 shadow-sm hover:shadow-md hover:border-[#0058be]/30 transition-all lg:mt-8">
                <div className="w-16 h-16 rounded-2xl bg-white border border-[#0058be]/20 flex items-center justify-center text-[#0058be] mb-6 shadow-sm group-hover:scale-110 group-hover:bg-[#0058be] group-hover:text-white transition-all relative">
                  <span className="absolute -top-3 -left-3 text-[12px] font-bold text-[#c2c6d6] bg-white px-1">02</span>
                  <span className="material-symbols-outlined text-[28px]">auto_awesome</span>
                </div>
                <h3 className="text-[18px] font-bold text-[#121c2a] mb-3">AI Đọc & Phân loại</h3>
                <p className="text-[14px] text-[#424754] leading-relaxed">
                  Lumis tự động gắn thẻ siêu dữ liệu và phân loại tài liệu của bạn theo chủ đề và lĩnh vực hoàn toàn tự động.
                </p>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center group bg-white p-6 rounded-3xl border border-[#c2c6d6]/40 shadow-sm hover:shadow-md hover:border-[#0058be]/30 transition-all">
                <div className="w-16 h-16 rounded-2xl bg-white border border-[#0058be]/20 flex items-center justify-center text-[#0058be] mb-6 shadow-sm group-hover:scale-110 group-hover:bg-[#0058be] group-hover:text-white transition-all relative">
                  <span className="absolute -top-3 -left-3 text-[12px] font-bold text-[#c2c6d6] bg-white px-1">03</span>
                  <span className="material-symbols-outlined text-[28px]">hub</span>
                </div>
                <h3 className="text-[18px] font-bold text-[#121c2a] mb-3">Tổng hợp chéo các bài báo</h3>
                <p className="text-[14px] text-[#424754] leading-relaxed">
                  Khám phá mối tương quan giữa các bài báo, xác định những khoảng trống nghiên cứu và xây dựng các bài tổng quan toàn diện.
                </p>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col items-center text-center group bg-white p-6 rounded-3xl border border-[#c2c6d6]/40 shadow-sm hover:shadow-md hover:border-[#0058be]/30 transition-all lg:mt-8">
                <div className="w-16 h-16 rounded-2xl bg-white border border-[#0058be]/20 flex items-center justify-center text-[#0058be] mb-6 shadow-sm group-hover:scale-110 group-hover:bg-[#0058be] group-hover:text-white transition-all relative">
                  <span className="absolute -top-3 -left-3 text-[12px] font-bold text-[#c2c6d6] bg-white px-1">04</span>
                  <span className="material-symbols-outlined text-[28px]">chat</span>
                </div>
                <h3 className="text-[18px] font-bold text-[#121c2a] mb-3">Hỏi & Khám phá</h3>
                <p className="text-[14px] text-[#424754] leading-relaxed">
                  Truy vấn toàn bộ thư viện bằng ngôn ngữ tự nhiên. Nhận câu trả lời ngay lập tức cùng với trích dẫn chính xác.
                </p>
              </div>
            </div>
          </div>
        </FadeInSection>

        {/* Visual / Mockup Section */}
        <FadeInSection className="max-w-[1000px] mx-auto px-6 mb-32">
          <div className="bg-[#f8f9ff] border border-[#c2c6d6]/40 rounded-[32px] p-8 shadow-xl shadow-[#0058be]/5">
              <div className="bg-white border border-[#c2c6d6]/50 rounded-2xl overflow-hidden shadow-sm">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-[#c2c6d6]/30 bg-[#fafbff]">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  <div className="ml-4 text-[12px] font-semibold text-[#727785]">Thông tin Tổng hợp AI</div>
                </div>
                <div className="p-6 md:p-8 flex flex-col gap-6">
                  {/* Mockup Chat / Insight Panel */}
                  <div className="self-end bg-[#eef2fc] rounded-2xl rounded-tr-sm px-5 py-4 max-w-[85%] text-[14px] text-[#121c2a] shadow-sm">
                    Tìm mối tương quan giữa bảo vệ tô-pô và tỷ lệ lỗi trong 5 bài báo này.
                  </div>
                  
                  <div className="self-start bg-white border border-[#c2c6d6]/40 shadow-sm rounded-2xl rounded-tl-sm px-6 py-5 max-w-[95%]">
                    <div className="flex items-center gap-2 mb-4 text-[#0058be]">
                      <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                      <span className="text-[14px] font-bold">Tổng hợp Lumis</span>
                    </div>
                    <p className="text-[14px] text-[#424754] leading-relaxed mb-4">
                      Dựa trên thư viện của bạn, 4 trên 5 bài báo cho thấy anyon phi-Abel làm tăng khả năng bảo vệ tô-pô lên khoảng 87%, giảm thiểu hiệu quả tỷ lệ lỗi logic xuống dưới ngưỡng chịu lỗi.
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-[#f0f2f5] text-[#424754] rounded border border-[#c2c6d6]/30 text-[11px] font-semibold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">description</span> Fowler et al.
                      </span>
                      <span className="px-2 py-1 bg-[#f0f2f5] text-[#424754] rounded border border-[#c2c6d6]/30 text-[11px] font-semibold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">description</span> Zhang & Liu
                      </span>
                    </div>
                  </div>
                </div>
              </div>
          </div>
        </FadeInSection>

        {/* CTA Section */}
        <FadeInSection className="text-center max-w-[600px] mx-auto px-6 mb-32">
          <h2 className="text-[32px] font-bold text-[#121c2a] mb-4">
              Sẵn sàng đẩy nhanh tiến độ nghiên cứu?
            </h2>
            <p className="text-[16px] text-[#727785] mb-8">
              Gia nhập hàng nghìn nhà nghiên cứu đang sử dụng Lumis để tổng hợp kiến thức nhanh chóng và thông minh hơn.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <GetStartedButton className="w-full sm:w-auto bg-[#0058be] hover:bg-[#2170e4] text-white text-[15px] font-bold py-3 px-8 rounded-full shadow-md shadow-[#0058be]/20 transition-all hover:-translate-y-0.5 border-none">
                Bắt đầu miễn phí
              </GetStartedButton>
              <button className="w-full sm:w-auto bg-white border-2 border-[#c2c6d6]/60 text-[#424754] text-[15px] font-bold py-3 px-8 rounded-full hover:bg-gray-50 hover:border-[#424754]/30 transition-all">
                Xem Demo
              </button>
          </div>
        </FadeInSection>
      </main>

      <footer className="w-full py-md px-margin-mobile md:px-margin-desktop flex justify-between items-center mt-auto border-t border-on-surface/5 bg-surface dark:bg-inverse-surface z-50 relative">
        <div className="text-[14px] font-semibold tracking-wider text-on-surface">
          Lumis
        </div>
        <div className="text-[14px] text-on-surface-variant">
          © 2026 Lumis. Chuẩn xác trong từng khám phá.
        </div>
        <div className="flex gap-md">
          <Link
            href="#"
            className="text-[14px] text-on-surface-variant hover:text-on-surface transition-colors"
          >
            Chính sách bảo mật
          </Link>
          <Link
            href="#"
            className="text-[14px] text-on-surface-variant hover:text-on-surface transition-colors"
          >
            Điều khoản dịch vụ
          </Link>
        </div>
      </footer>
    </>
  );
}
