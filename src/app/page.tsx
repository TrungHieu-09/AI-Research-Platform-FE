"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { LandingHeader } from "@/components/layouts/landing-header";
import { FadeInSection } from "@/components/animations/fade-in-section";

export default function Home() {
  const [showDemo, setShowDemo] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [videoKey, setVideoKey] = useState<number>(Date.now());
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeTab, setActiveTab] = useState<"transcript" | "summary">("transcript");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [voiceLang, setVoiceLang] = useState<"vi" | "en">("vi");
  const timelineRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const stepStartTimesVi = [0, 20, 39, 56];
  const stepStartTimesEn = [0, 21, 43, 65];
  const totalDurationVi = 73;
  const totalDurationEn = 87;

  const currentStepStartTimes = voiceLang === "vi" ? stepStartTimesVi : stepStartTimesEn;
  const totalDuration = voiceLang === "vi" ? totalDurationVi : totalDurationEn;

  const demoSteps = [
    {
      time: 0,
      title: "Step 1: Upload Documents",
      titleVi: "Bước 1: Tải lên Tài liệu Nghiên cứu",
      textEn: "Welcome to Lumis, the intelligent workspace designed to accelerate your scientific and academic research. To begin, simply drag and drop your research articles, PDFs, or Word documents into the secure Library. Lumis instantly parses your uploaded files and stores them safely in your personal cloud repository, ready for instant analysis.",
      textVi: "Chào mừng bạn đến với Lumis, nền tảng không gian làm việc thông minh được thiết kế để tăng tốc độ nghiên cứu khoa học và học thuật. Để bắt đầu, bạn chỉ cần kéo và thả các bài báo nghiên cứu, tệp PDF hoặc tài liệu Word vào Thư viện bảo mật. Lumis sẽ ngay lập tức phân tích và lưu trữ an toàn trên đám mây cá nhân của bạn, sẵn sàng cho việc phân tích tức thì.",
    },
    {
      time: 20,
      title: "Step 2: AI Organization",
      titleVi: "Bước 2: AI Đọc & Phân loại Tự động",
      textEn: "Once uploaded, Lumis' advanced AI models immediately read and comprehend your documents. The system automatically extracts key metadata, including author names, journal titles, publication dates, and abstracts. It then organizes and tags them by research fields and topics, turning your messy folder of files into a structured, searchable catalog.",
      textVi: "Ngay sau khi tải lên, các mô hình trí tuệ nhân tạo tiên tiến của Lumis lập tức đọc hiểu tài liệu của bạn. Hệ thống tự động trích xuất các thông tin siêu dữ liệu quan trọng như tên tác giả, tên tạp chí, ngày xuất bản và tóm tắt. Sau đó tự động phân loại theo chủ đề nghiên cứu, biến danh sách tài liệu rời rạc thành một danh mục có cấu trúc khoa học.",
    },
    {
      time: 39,
      title: "Step 3: Synthesize Knowledge",
      titleVi: "Bước 3: Tổng hợp Tri thức Đa tài liệu",
      textEn: "Now, let's unlock the true power of synthesis. Lumis analyzes semantic connections across all papers in your library. It helps you discover hidden patterns, cross-paper correlations, and critical research gaps. You can easily generate structured literature review drafts and compare different methodologies instantly, saving you weeks of manual reading.",
      textVi: "Tiếp theo là sức mạnh tổng hợp tri thức vượt trội. Lumis phân tích mối liên hệ ngữ nghĩa giữa tất cả các bài báo trong thư viện. Hệ thống giúp bạn phát hiện các mẫu ẩn, tương quan giữa các nghiên cứu và khoảng trống khoa học quan trọng, giúp bạn tạo bản thảo tổng quan tài liệu chỉ trong vài giây thay vì hàng tuần đọc thủ công.",
    },
    {
      time: 56,
      title: "Step 4: Ask & Explore",
      titleVi: "Bước 4: Trợ lý AI Q&A Kèm Trích dẫn",
      textEn: "Finally, navigate to the AI Workspace to chat with your collective library in natural language. Ask complex questions like 'What is the consensus on quantum error correction in these papers?', and Lumis will synthesize a comprehensive answer, backed by precise inline citations that link directly to the source documents. Empower your research and start your free workspace today!",
      textVi: "Cuối cùng, hãy vào Không gian làm việc AI để trò chuyện trực tiếp với toàn bộ thư viện bằng ngôn ngữ tự nhiên. Hãy đặt các câu hỏi chuyên sâu và Lumis sẽ tổng hợp câu trả lời toàn diện kèm trích dẫn chính xác liên kết trực tiếp đến từng tài liệu gốc. Hãy nâng tầm nghiên cứu và trải nghiệm Lumis ngay hôm nay!",
    },
  ];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const restartDemo = () => {
    setVideoKey(Date.now());
    setCurrentTime(0);
    setProgress(0);
    setActiveStep(0);
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  };

  const jumpToStep = (index: number) => {
    const targetTime = currentStepStartTimes[index];
    setCurrentTime(targetTime);
    setProgress((targetTime / totalDuration) * 100);
    setActiveStep(index);
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percentage = Math.min(Math.max((clickX / width) * 100, 0), 100);
    
    const newTime = (percentage / 100) * totalDuration;
    setCurrentTime(newTime);
    setProgress(percentage);

    // Determine corresponding step from timeline click
    let stepIdx = 0;
    for (let i = currentStepStartTimes.length - 1; i >= 0; i--) {
      if (newTime >= currentStepStartTimes[i]) {
        stepIdx = i;
        break;
      }
    }
    setActiveStep(stepIdx);
    setIsPlaying(true);
  };

  const handleAudioTimeUpdate = () => {
    if (!audioRef.current) return;
    const stepOffset = currentStepStartTimes[activeStep] || 0;
    const totalCurrent = stepOffset + audioRef.current.currentTime;
    setCurrentTime(Math.min(totalCurrent, totalDuration));
    setProgress(Math.min((totalCurrent / totalDuration) * 100, 100));
  };

  const handleAudioEnded = () => {
    if (activeStep < demoSteps.length - 1) {
      setActiveStep((prev) => prev + 1);
    } else {
      setIsPlaying(false);
    }
  };

  // Handle modal open/close
  useEffect(() => {
    if (showDemo) {
      setIsPlaying(true);
      setCurrentTime(0);
      setProgress(0);
      setActiveStep(0);
      setVideoKey(Date.now());
    } else {
      setIsPlaying(false);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  }, [showDemo]);

  // Handle audio step / play / mute synchronization
  useEffect(() => {
    if (!audioRef.current || !showDemo) return;
    if (isPlaying && !isMuted) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [activeStep, isPlaying, isMuted, voiceLang, showDemo]);

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
              <span>Giới thiệu AI Synthesis 2.0</span>
            </div>

            <h1 className="text-[48px] font-bold leading-[1.1] tracking-tight text-on-surface">
              Trí tuệ cho sự{" "}
              <span className="text-[#0058be]">Nghiên cứu</span> của bạn.
            </h1>

            <p className="text-[18px] leading-[1.6] text-[#424754] dark:text-[#c2c6d6] w-full max-w-[576px]">
              Tăng tốc quá trình khám phá tri thức của bạn với không gian làm việc tối ưu hóa bằng AI dành riêng cho nghiên cứu học thuật và chuyên môn sâu. Sắp xếp, phân tích và tổng hợp thông tin một cách dễ dàng.
            </p>

            <div className="flex flex-col sm:flex-row gap-md mt-sm w-full sm:w-auto">
              <Link href="/signup" className="w-full sm:w-auto">
                <button className="bg-gradient-to-r from-[#0058be] to-[#316bf3] hover:from-[#2170e4] hover:to-[#0051d5] text-white text-[14px] font-semibold py-[16px] px-[32px] rounded-2xl shadow-[0_10px_40px_rgba(31,41,55,0.15)] hover:shadow-[0_15px_50px_rgba(31,41,55,0.2)] transition-all duration-300 transform hover:-translate-y-1 w-full text-center border-none cursor-pointer">
                  Bắt đầu miễn phí
                </button>
              </Link>
              <button 
                onClick={() => setShowDemo(true)}
                className="glass-panel text-on-surface text-[14px] font-semibold py-[16px] px-[32px] rounded-2xl hover:bg-[#d9e3f6]/50 transition-all duration-300 w-full sm:w-auto text-center flex items-center justify-center gap-sm border border-black/5 dark:border-white/10 dark:text-white"
              >
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
              Thiết kế cho Công việc Chuyên sâu
            </h2>
            <p className="text-[18px] text-on-surface-variant max-w-[672px] mx-auto">
              Mọi thứ bạn cần để chuyển đổi từ dữ liệu thô sang tri thức tổng hợp sâu sắc.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
            <div className="md:col-span-2 glass-panel rounded-3xl p-lg flex flex-col justify-between overflow-hidden relative group h-[400px]">
              <div className="z-10 relative">
                <span className="material-symbols-outlined text-[32px] text-[#0058be] mb-sm block">
                  psychology
                </span>
                <h3 className="text-[24px] font-medium leading-[1.3] text-on-surface mb-sm">
                  Phân tích bằng Sức mạnh AI
                </h3>
                <p className="text-[16px] text-on-surface-variant max-w-[448px] mt-4">
                  Tóm tắt tài liệu ngay lập tức, trích xuất các phương pháp nghiên cứu chính và xác định những điểm tương đồng/mâu thuẫn trong toàn bộ thư viện bằng các mô hình ngôn ngữ tiên tiến.
                </p>
              </div>

              <div className="absolute right-[-5%] bottom-[-10%] w-2/3 h-2/3 bg-surface dark:bg-inverse-surface rounded-tl-3xl shadow-[-10px_-10px_30px_rgba(31,41,55,0.05)] p-md border-t border-l border-black/5 dark:border-white/10 transform group-hover:-translate-y-2 group-hover:-translate-x-2 transition-transform duration-500">
                <div className="flex items-center gap-sm mb-sm text-[#0058be]">
                  <span className="material-symbols-outlined text-[16px]">
                    auto_awesome
                  </span>
                  <span className="text-[12px] font-medium">
                    Tổng hợp Hoàn tất
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
                Tìm kiếm Toàn diện
              </h3>
              <p className="text-[16px] text-on-surface-variant mt-4 max-w-[448px]">
                Tìm chính xác các trích dẫn, biểu đồ hoặc khái niệm từ hàng ngàn tài liệu PDF trong tích tắc. Tìm kiếm ngữ nghĩa thấu hiểu ý định của bạn, chứ không chỉ là từ khóa.
              </p>
              <div className="mt-auto w-full bg-surface rounded-xl p-sm shadow-sm flex items-center gap-sm border border-black/5 dark:border-white/10 dark:bg-inverse-surface">
                <span className="material-symbols-outlined text-outline">
                  search
                </span>
                <span className="text-[14px] text-outline-variant">
                  "cơ chế phản ứng hạt nhân"
                </span>
              </div>
            </div>

            <div className="glass-panel rounded-3xl p-lg flex flex-col justify-start relative group h-[400px]">
              <span className="material-symbols-outlined text-[32px] text-[#924700] mb-sm block">
                group_work
              </span>
              <h3 className="text-[24px] font-medium leading-[1.3] text-on-surface mb-sm">
                Không gian làm việc Cộng tác
              </h3>
              <p className="text-[16px] text-on-surface-variant mt-4 max-w-[448px]">
                Chia sẻ các thư viện tài liệu đã chọn lọc, cùng viết ghi chú và tổng hợp phát hiện mới cùng với phòng thí nghiệm hoặc nhóm nghiên cứu theo thời gian thực.
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
                Sẵn sàng tổ chức lại kho tài liệu?
              </h3>
              <Link href="/signup">
                <button className="bg-[#0058be] hover:bg-[#2170e4] text-white text-[14px] font-semibold py-md px-lg rounded-full shadow-sm transition-all duration-200 mt-2 border-none cursor-pointer">
                  Bắt đầu không gian miễn phí
                </button>
              </Link>
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
              Từ tài liệu thô đến tri thức <span className="text-[#0058be]">thực sự</span>
            </h2>
            <p className="text-[18px] text-[#424754] max-w-[672px] mx-auto leading-relaxed">
              Lumis tiếp nhận thư viện nghiên cứu của bạn một cách liền mạch, thấu hiểu các mối liên kết ngữ nghĩa và cho phép bạn trò chuyện trực tiếp với toàn bộ cơ sở tri thức đó.
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
                  Nhập các file PDF, tài liệu Word và bài báo khoa học trực tiếp vào Thư viện bảo mật của bạn.
                </p>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center group bg-white p-6 rounded-3xl border border-[#c2c6d6]/40 shadow-sm hover:shadow-md hover:border-[#0058be]/30 transition-all lg:mt-8">
                <div className="w-16 h-16 rounded-2xl bg-white border border-[#0058be]/20 flex items-center justify-center text-[#0058be] mb-6 shadow-sm group-hover:scale-110 group-hover:bg-[#0058be] group-hover:text-white transition-all relative">
                  <span className="absolute -top-3 -left-3 text-[12px] font-bold text-[#c2c6d6] bg-white px-1">02</span>
                  <span className="material-symbols-outlined text-[28px]">auto_awesome</span>
                </div>
                <h3 className="text-[18px] font-bold text-[#121c2a] mb-3">AI Đọc & Sắp xếp</h3>
                <p className="text-[14px] text-[#424754] leading-relaxed">
                  Lumis tự động gắn nhãn siêu dữ liệu và phân loại tài liệu theo chủ đề và lĩnh vực tự động.
                </p>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center group bg-white p-6 rounded-3xl border border-[#c2c6d6]/40 shadow-sm hover:shadow-md hover:border-[#0058be]/30 transition-all">
                <div className="w-16 h-16 rounded-2xl bg-white border border-[#0058be]/20 flex items-center justify-center text-[#0058be] mb-6 shadow-sm group-hover:scale-110 group-hover:bg-[#0058be] group-hover:text-white transition-all relative">
                  <span className="absolute -top-3 -left-3 text-[12px] font-bold text-[#c2c6d6] bg-white px-1">03</span>
                  <span className="material-symbols-outlined text-[28px]">hub</span>
                </div>
                <h3 className="text-[18px] font-bold text-[#121c2a] mb-3">Tổng hợp Đa tài liệu</h3>
                <p className="text-[14px] text-[#424754] leading-relaxed">
                  Khám phá mối tương quan giữa các tài liệu, phát hiện khoảng trống nghiên cứu và xây dựng báo cáo tổng quan.
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
                  Truy vấn toàn bộ thư viện bằng ngôn ngữ tự nhiên. Nhận câu trả lời ngay lập tức kèm trích dẫn chính xác.
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
                    Tìm mối tương quan giữa bảo vệ cấu trúc liên kết và tỷ lệ lỗi trong 5 tài liệu này.
                  </div>
                  
                  <div className="self-start bg-white border border-[#c2c6d6]/40 shadow-sm rounded-2xl rounded-tl-sm px-6 py-5 max-w-[95%]">
                    <div className="flex items-center gap-2 mb-4 text-[#0058be]">
                      <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                      <span className="text-[14px] font-bold">Tổng hợp bởi Lumis</span>
                    </div>
                    <p className="text-[14px] text-[#424754] leading-relaxed mb-4">
                      Dựa trên thư viện của bạn, 4 trên 5 bài báo khoa học cho thấy rằng các anyon phi Abelian làm tăng mức độ bảo vệ cấu trúc liên kết thêm khoảng 87%, giúp giảm hiệu quả tỷ lệ lỗi logic xuống dưới ngưỡng chịu lỗi.
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
              Sẵn sàng để tăng tốc nghiên cứu của bạn?
            </h2>
            <p className="text-[16px] text-[#727785] mb-8">
              Tham gia cùng hàng ngàn nhà nghiên cứu sử dụng Lumis để tổng hợp kiến thức nhanh hơn và thông minh hơn.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup" className="w-full sm:w-auto">
                <button className="w-full bg-[#0058be] hover:bg-[#2170e4] text-white text-[15px] font-bold py-3 px-8 rounded-full shadow-md shadow-[#0058be]/20 transition-all hover:-translate-y-0.5 border-none cursor-pointer">
                  Bắt đầu miễn phí
                </button>
              </Link>
              <button 
                onClick={() => setShowDemo(true)}
                className="w-full sm:w-auto bg-white border-2 border-[#c2c6d6]/60 text-[#424754] text-[15px] font-bold py-3 px-8 rounded-full hover:bg-gray-50 hover:border-[#424754]/30 transition-all cursor-pointer"
              >
                Watch Demo
              </button>
          </div>
        </FadeInSection>
      </main>

      <footer className="w-full py-md px-margin-mobile md:px-margin-desktop flex justify-between items-center mt-auto border-t border-on-surface/5 bg-surface dark:bg-inverse-surface z-50 relative">
        <div className="text-[14px] font-semibold tracking-wider text-on-surface">
          Lumis
        </div>
        <div className="text-[14px] text-on-surface-variant">
          © 2026 Lumis. Precision in Discovery.
        </div>
        <div className="flex gap-md">
          <Link
            href="#"
            className="text-[14px] text-on-surface-variant hover:text-on-surface transition-colors"
          >
            Privacy Policy
          </Link>
          <Link
            href="#"
            className="text-[14px] text-on-surface-variant hover:text-on-surface transition-colors"
          >
            Terms of Service
          </Link>
        </div>
      </footer>

      {showDemo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 md:p-6 animate-fade-in">
          {/* Audio element for real studio AI voiceover */}
          <audio
            ref={audioRef}
            src={`/audio/${voiceLang}_step${activeStep}.mp3`}
            preload="auto"
            onTimeUpdate={handleAudioTimeUpdate}
            onEnded={handleAudioEnded}
          />

          <div className="relative w-full max-w-[1200px] bg-white rounded-3xl overflow-hidden shadow-2xl border border-black/10 flex flex-col md:flex-row h-[90vh] max-h-[720px]">
            
            {/* Left Side: Video Player Area */}
            <div className="flex-1 flex flex-col bg-[#0b0f17] relative h-full">
              {/* Video Player Header Overlay */}
              <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4 flex justify-between items-center text-white">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#316bf3] text-[22px]">play_circle</span>
                  <div>
                    <h4 className="text-[14px] font-bold tracking-tight">Lumis AI Product Tour</h4>
                    <p className="text-[10px] text-gray-300">Synchronized AI Voice & Video Walkthrough</p>
                  </div>
                </div>

                {/* Voice Language Selector & Mute Toggle */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setVoiceLang(voiceLang === "vi" ? "en" : "vi")}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 hover:bg-white/25 text-white text-[12px] font-semibold border border-white/20 transition-all cursor-pointer"
                    title="Chuyển đổi ngôn ngữ thuyết minh AI"
                  >
                    <span className="material-symbols-outlined text-[15px]">translate</span>
                    <span>{voiceLang === "vi" ? "🇻🇳 Giọng AI Việt Nam" : "🇺🇸 English AI Voice"}</span>
                  </button>

                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="w-8 h-8 rounded-full flex items-center justify-center bg-white/15 hover:bg-white/25 text-white border-none transition-all cursor-pointer"
                    title={isMuted ? "Unmute Voice" : "Mute Voice"}
                  >
                    <span className="material-symbols-outlined text-[17px]">
                      {isMuted ? "volume_off" : "volume_up"}
                    </span>
                  </button>

                  <button
                    onClick={() => setShowDemo(false)}
                    className="md:hidden w-8 h-8 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors border-none cursor-pointer text-white"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>
              </div>

              {/* Video frame/container */}
              <div className="flex-1 w-full relative flex items-center justify-center overflow-hidden">
                <img
                  key={videoKey}
                  src={`/videos/demo.webp?t=${videoKey}`}
                  alt="Lumis Product Demo"
                  className="w-full h-full object-contain"
                  onClick={() => setIsPlaying(!isPlaying)}
                />

                {/* Subtitle text overlay directly in the video frame */}
                <div className="absolute bottom-6 left-4 right-4 text-center z-10">
                  <div className="inline-block bg-black/85 text-white text-[13px] md:text-[14px] font-medium py-2.5 px-5 rounded-2xl backdrop-blur-sm max-w-[90%] border border-white/15 shadow-xl">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#316bf3] mb-0.5">
                      {voiceLang === "vi" ? demoSteps[activeStep]?.titleVi : demoSteps[activeStep]?.title}
                    </div>
                    {voiceLang === "vi" ? demoSteps[activeStep]?.textVi : demoSteps[activeStep]?.textEn}
                  </div>
                </div>
              </div>

              {/* Progress and Video Controls bar */}
              <div className="bg-black/95 border-t border-white/10 p-3 flex flex-col gap-2.5">
                {/* Single Clean Timeline Bar */}
                <div 
                  ref={timelineRef}
                  onClick={handleTimelineClick}
                  className="relative w-full h-2 bg-white/20 rounded-full overflow-hidden cursor-pointer hover:h-2.5 transition-all"
                  title="Click to seek"
                >
                  <div
                    className="h-full bg-gradient-to-r from-[#0058be] to-[#316bf3]"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* Control buttons */}
                <div className="flex items-center justify-between text-white text-[13px] px-1">
                  <div className="flex items-center gap-4">
                    {/* Play/Pause Button */}
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="text-white hover:text-[#316bf3] bg-transparent border-none cursor-pointer flex items-center gap-1.5 font-bold"
                      title={isPlaying ? "Pause walkthrough" : "Play walkthrough"}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {isPlaying ? "pause" : "play_arrow"}
                      </span>
                      <span>{isPlaying ? "Pause" : "Play"}</span>
                    </button>

                    {/* Restart Button */}
                    <button
                      onClick={restartDemo}
                      className="text-white hover:text-[#316bf3] bg-transparent border-none cursor-pointer flex items-center gap-1.5 font-bold"
                      title="Restart walkthrough from 0:00"
                    >
                      <span className="material-symbols-outlined text-[20px]">replay</span>
                      <span>Restart</span>
                    </button>

                    {/* Time Counter */}
                    <span className="text-[12px] text-gray-400 font-mono">
                      {formatTime(Math.round(currentTime))} / {formatTime(totalDuration)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-0.5 bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded text-[11px] font-mono uppercase tracking-wider">
                      STUDIO AI VOICE
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: Transcript & Summary Panel */}
            <div className="w-full md:w-[380px] border-t md:border-t-0 md:border-l border-gray-100 flex flex-col bg-white h-[40vh] md:h-full">
              {/* Sidebar Header & Tab Switcher */}
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/60 shrink-0">
                <div className="flex gap-1 bg-gray-200/60 p-0.5 rounded-xl">
                  <button
                    onClick={() => setActiveTab("transcript")}
                    className={`px-3 py-1.5 rounded-lg text-[12px] font-bold border-none transition-all cursor-pointer ${
                      activeTab === "transcript"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900 bg-transparent"
                    }`}
                  >
                    {voiceLang === "vi" ? "Lời thoại" : "Transcript"}
                  </button>
                  <button
                    onClick={() => setActiveTab("summary")}
                    className={`px-3 py-1.5 rounded-lg text-[12px] font-bold border-none transition-all cursor-pointer ${
                      activeTab === "summary"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900 bg-transparent"
                    }`}
                  >
                    {voiceLang === "vi" ? "Tóm tắt AI" : "Summary"}
                  </button>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={restartDemo}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all cursor-pointer border border-gray-200"
                    title="Phát lại từ đầu"
                  >
                    <span className="material-symbols-outlined text-[18px]">replay</span>
                    Replay
                  </button>

                  <button
                    onClick={() => setShowDemo(false)}
                    className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors border-none cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px] text-gray-700">close</span>
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                {activeTab === "transcript" ? (
                  <>
                    {/* Search box */}
                    <div className="relative shrink-0">
                      <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 text-[18px]">
                        search
                      </span>
                      <input
                        type="text"
                        placeholder={voiceLang === "vi" ? "Tìm kiếm lời thoại..." : "Search transcript..."}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-gray-100/80 border border-gray-200/80 rounded-xl text-[13px] outline-none focus:border-[#316bf3]/50 focus:bg-white transition-all text-gray-800"
                      />
                    </div>

                    {/* Transcript Items */}
                    <div className="flex flex-col gap-2">
                      {demoSteps
                        .filter(
                          (step) =>
                            step.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            step.titleVi.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            step.textEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            step.textVi.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map((step) => {
                          const originalIndex = demoSteps.indexOf(step);
                          const isActive = activeStep === originalIndex;
                          return (
                            <div
                              key={originalIndex}
                              onClick={() => jumpToStep(originalIndex)}
                              className={`flex items-start gap-3 p-3 rounded-2xl cursor-pointer transition-all border ${
                                isActive
                                  ? "bg-blue-50/50 border-[#316bf3]/20 shadow-sm"
                                  : "border-transparent hover:bg-gray-50"
                              }`}
                            >
                              <span className="px-2 py-0.5 bg-blue-100 text-[#0058be] text-[11px] font-bold font-mono rounded shrink-0">
                                {formatTime(currentStepStartTimes[originalIndex])}
                              </span>
                              <div className="flex flex-col gap-0.5">
                                <h5
                                  className={`text-[12px] font-bold ${
                                    isActive ? "text-[#0058be]" : "text-gray-900"
                                  }`}
                                >
                                  {voiceLang === "vi" ? step.titleVi : step.title}
                                </h5>
                                <p className="text-[12px] text-gray-600 leading-relaxed font-medium">
                                  {voiceLang === "vi" ? step.textVi : step.textEn}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </>
                ) : (
                  /* Summary tab content */
                  <div className="flex flex-col gap-4">
                    <div className="bg-gradient-to-br from-blue-50/30 to-[#316bf3]/5 border border-[#316bf3]/10 p-4 rounded-2xl">
                      <h4 className="text-[13px] font-bold text-gray-900 flex items-center gap-1.5 mb-2">
                        <span className="material-symbols-outlined text-[#0058be] text-[16px]">
                          auto_awesome
                        </span>
                        {voiceLang === "vi" ? "Tóm tắt Giá trị Cốt lõi" : "AI Key Insights & Summary"}
                      </h4>
                      <p className="text-[12px] text-gray-600 leading-relaxed font-medium">
                        {voiceLang === "vi"
                          ? "Lumis là không gian làm việc AI giúp tối ưu hóa quy trình nghiên cứu khoa học:"
                          : "Lumis is an AI-first workspace that simplifies the workflow for academic and professional researchers:"}
                      </p>
                    </div>

                    <ul className="flex flex-col gap-3 pl-1 text-[12px] text-gray-600 font-medium">
                      <li className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-green-500 text-[16px] shrink-0 mt-0.5">
                          check_circle
                        </span>
                        <span>
                          <strong>{voiceLang === "vi" ? "Quản lý Thư viện:" : "Document Library:"}</strong>{" "}
                          {voiceLang === "vi"
                            ? "Tải lên nhanh chóng PDF, Word và lưu trữ bảo mật trên cloud."
                            : "Seamless ingestion of PDFs, Word files, and papers."}
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-green-500 text-[16px] shrink-0 mt-0.5">
                          check_circle
                        </span>
                        <span>
                          <strong>{voiceLang === "vi" ? "AI Phân loại Tự động:" : "AI Categorization:"}</strong>{" "}
                          {voiceLang === "vi"
                            ? "Tự động trích xuất siêu dữ liệu và phân loại theo chủ đề."
                            : "Automatic topic modeling and extraction of core metadata fields."}
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-green-500 text-[16px] shrink-0 mt-0.5">
                          check_circle
                        </span>
                        <span>
                          <strong>{voiceLang === "vi" ? "Tổng hợp Đa tài liệu:" : "Cross-Paper Synthesis:"}</strong>{" "}
                          {voiceLang === "vi"
                            ? "Phát hiện mối liên hệ và khoảng trống nghiên cứu giữa các bài báo."
                            : "Discover links and correlation metrics between discrete research papers."}
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-green-500 text-[16px] shrink-0 mt-0.5">
                          check_circle
                        </span>
                        <span>
                          <strong>{voiceLang === "vi" ? "Hỏi đáp Kèm Trích dẫn:" : "Academic Citations:"}</strong>{" "}
                          {voiceLang === "vi"
                            ? "Trợ lý AI trả lời chuyên sâu kèm trích dẫn chuẩn xác đến từng tài liệu gốc."
                            : "Q&A with real-time academic citation backtracking and verification."}
                        </span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
