"use client"

import { useState } from "react"
import { BookOpen, Plus, Save, ChevronLeft, Layout, FileText, Settings, Sparkles, Target, Hash, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/features/auth/auth-context"
import { cn } from "@/lib/utils"

export default function NewSubjectPage() {
  const router = useRouter()
  const { token } = useAuth()

  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [description, setDescription] = useState("")
  const [active, setActive] = useState(true)
  const [loading, setLoading] = useState(false)
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null)

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type })
    setTimeout(() => setToastMessage(null), 3500)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !name.trim() || !code.trim()) return
    setLoading(true)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
      const res = await fetch(`${baseUrl}/api/subjects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: name.trim(),
          code: code.trim().toUpperCase(),
          status: active ? "ACTIVE" : "SUSPENDED"
        })
      })

      if (res.ok) {
        showToast("Đã tạo môn học thành công!", "success")
        setTimeout(() => router.push("/admin/subjects"), 1000)
      } else {
        const err = await res.json()
        showToast(err.error || "Mã môn học hoặc tên đã tồn tại.", "error")
      }
    } catch (e) {
      showToast("Lỗi kết nối máy chủ.", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center py-12 px-4 animate-in fade-in zoom-in-95 duration-700">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 animate-in fade-in slide-in-from-top-5 duration-300">
          <div className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border text-[13px] font-semibold max-w-sm",
            toastMessage.type === "success" 
              ? "bg-white border-[#0058be]/20 text-[#121c2a]" 
              : "bg-red-50 border-red-200 text-red-700"
          )}>
            {toastMessage.type === "success" ? (
              <CheckCircle2 className="text-[#0058be] shrink-0" size={18} />
            ) : (
              <AlertCircle className="text-red-600 shrink-0" size={18} />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-5 gap-0 rounded-[32px] overflow-hidden border border-[#c2c6d6]/40 shadow-2xl shadow-[#0058be]/5 bg-white">
        
        {/* Left Informational Sidebar */}
        <div className="lg:col-span-2 bg-[#f8f9ff] p-10 flex flex-col justify-between border-r border-[#c2c6d6]/40">
          <div className="space-y-8">
            <Link href="/admin/subjects" className="inline-flex items-center gap-2 text-[#727785] hover:text-[#0058be] font-bold transition-colors group">
              <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span>Trở lại Danh mục</span>
            </Link>
            
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-[#0058be] text-white flex items-center justify-center shadow-lg shadow-[#0058be]/20 mb-6">
                <BookOpen size={30} />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-[#121c2a] leading-tight" style={{ fontFamily: "Geist, sans-serif" }}>Khởi tạo Môn học Mới</h1>
              <p className="text-[#727785] font-medium leading-relaxed text-[13px]">
                Thiết lập khung học phần mới. Cung cấp danh mục chính thức để sinh viên tải tài liệu nghiên cứu lên đúng chuyên ngành.
              </p>
            </div>

            <div className="space-y-6 pt-4">
               {[
                 { icon: Hash, title: "Mã học phần chuẩn hóa", text: "Dùng mã chính thức theo chương trình đào tạo." },
                 { icon: Target, title: "Phân loại rõ ràng", text: "Giúp Trợ lý AI tổng hợp kiến thức chính xác." }
               ].map((tip, i) => (
                 <div key={i} className="flex gap-4">
                    <div className="p-2 bg-white rounded-xl text-[#0058be] border border-[#c2c6d6]/40 h-fit">
                      <tip.icon size={18} />
                    </div>
                    <div>
                      <p className="text-[14px] font-bold text-[#121c2a]">{tip.title}</p>
                      <p className="text-[12px] text-[#727785]">{tip.text}</p>
                    </div>
                 </div>
               ))}
            </div>
          </div>

          <div className="p-6 bg-[#0058be]/5 rounded-2xl border border-[#0058be]/10 mt-8">
            <div className="flex items-center gap-2 text-[#0058be] font-bold text-[13px] mb-1">
              <Sparkles size={14} />
              <span>Hỗ trợ AI Vector</span>
            </div>
            <p className="text-[12px] text-[#727785]">Mỗi môn học tạo mới sẽ được tự động lập chỉ mục trong kho tri thức RAG của hệ thống.</p>
          </div>
        </div>

        {/* Right Form Area */}
        <div className="lg:col-span-3 p-12 bg-white">
          <form onSubmit={handleSave} className="space-y-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-[#727785] uppercase tracking-widest px-1">Thông tin Học phần</label>
                <div className="space-y-4">
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#727785] group-focus-within:text-[#0058be] transition-colors">
                      <Layout size={20} />
                    </div>
                    <input 
                      type="text" 
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Tên môn học (Ví dụ: Hệ quản trị cơ sở dữ liệu)" 
                      className="w-full bg-[#f8f9ff] border border-[#c2c6d6]/60 rounded-2xl py-4 pl-12 pr-4 text-[15px] text-[#121c2a] focus:outline-none focus:border-[#0058be] focus:bg-white transition-all font-bold"
                    />
                  </div>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#727785] group-focus-within:text-[#0058be] transition-colors">
                      <Settings size={20} />
                    </div>
                    <input 
                      type="text" 
                      required
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="Mã học phần (Ví dụ: DBM201, AI302...)" 
                      className="w-full bg-[#f8f9ff] border border-[#c2c6d6]/60 rounded-2xl py-4 pl-12 pr-4 text-[15px] text-[#0058be] focus:outline-none focus:border-[#0058be] focus:bg-white transition-all font-mono font-bold uppercase"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[13px] font-bold text-[#727785] uppercase tracking-widest px-1">Mô tả & Phạm vi nghiên cứu</label>
                <div className="relative group">
                   <div className="absolute left-4 top-4 text-[#727785] group-focus-within:text-[#0058be] transition-colors">
                      <FileText size={20} />
                    </div>
                    <textarea 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Giới thiệu nội dung môn học, các kiến thức cốt lõi (tùy chọn)..." 
                      className="w-full h-36 bg-[#f8f9ff] border border-[#c2c6d6]/60 rounded-2xl p-4 pl-12 text-[14px] text-[#121c2a] focus:outline-none focus:border-[#0058be] focus:bg-white transition-all resize-none font-medium leading-relaxed"
                    />
                </div>
              </div>

              <div className="flex items-center gap-2 px-1">
                 <input 
                   type="checkbox" 
                   className="w-5 h-5 rounded-lg accent-[#0058be] cursor-pointer" 
                   id="active" 
                   checked={active} 
                   onChange={(e) => setActive(e.target.checked)} 
                 />
                 <label htmlFor="active" className="text-[14px] font-bold text-[#121c2a] cursor-pointer">Kích hoạt hiển thị ngay cho sinh viên</label>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-[#c2c6d6]/30">
              <button 
                type="submit"
                disabled={loading || !name.trim() || !code.trim()}
                className="flex-[2] bg-[#0058be] hover:bg-[#004ca3] text-white py-4 rounded-2xl font-bold shadow-lg shadow-[#0058be]/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 disabled:opacity-40"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                <span>Lưu Môn Học Mới</span>
              </button>
              <Link href="/admin/subjects" className="flex-1 bg-gray-100 hover:bg-gray-200 text-[#121c2a] py-4 rounded-2xl font-bold text-center transition-all">
                Hủy bỏ
              </Link>
            </div>
          </form>
        </div>

      </div>
    </div>
  )
}
