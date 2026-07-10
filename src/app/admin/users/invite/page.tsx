"use client"

import { useState } from "react"
import { Mail, Shield, UserPlus, ChevronLeft, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function InviteUserPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("Student")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setSubmitted(true)
    setTimeout(() => {
      router.push("/admin/users")
    }, 1500)
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/users"
          className="p-2.5 bg-white border border-[#c2c6d6]/40 hover:bg-[#eff4ff] hover:text-[#0058be] rounded-2xl transition-all shadow-sm"
        >
          <ChevronLeft size={22} />
        </Link>
        <div>
          <h1
            className="text-3xl font-bold tracking-tight text-[#121c2a]"
            style={{ fontFamily: "Geist, sans-serif" }}
          >
            Mời người dùng mới (Invite New User)
          </h1>
          <p className="text-[#424754] font-medium text-[14px]">
            Gửi email lời mời tham gia hệ thống Lumis AI tới thành viên mới trong tổ chức.
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 sm:p-10 rounded-3xl space-y-7 border border-[#c2c6d6]/40 shadow-sm"
        >
          {submitted ? (
            <div className="py-12 text-center space-y-4 animate-in fade-in duration-300">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-[#121c2a]">Đã gửi lời mời thành công!</h3>
              <p className="text-[#424754] text-[14px]">
                Lời mời kèm liên kết đăng ký đã được gửi tới <span className="font-bold">{email}</span>. Đang quay lại trang danh sách...
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-[#121c2a]">Địa chỉ Email trường học</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#727785]" size={18} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@fpt.edu.vn"
                      className="w-full bg-[#f8f9ff] border border-[#c2c6d6]/50 rounded-2xl py-3.5 pl-11 pr-4 text-[14px] text-[#121c2a] focus:outline-none focus:border-[#0058be] transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-[#121c2a]">Chọn vai trò (Role)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {["Student", "Admin"].map((r) => (
                      <label
                        key={r}
                        onClick={() => setRole(r)}
                        className={`relative flex items-center gap-3 p-4 border rounded-2xl cursor-pointer transition-all ${
                          role === r
                            ? "bg-[#eff4ff] border-[#0058be] text-[#0058be]"
                            : "bg-[#f8f9ff] border-[#c2c6d6]/40 text-[#121c2a] hover:border-[#0058be]/50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="role"
                          checked={role === r}
                          onChange={() => setRole(r)}
                          className="w-4 h-4 accent-[#0058be]"
                        />
                        <div className="flex flex-col">
                          <span className="text-[14px] font-bold">{r}</span>
                          <span className="text-[11px] text-[#727785]">Quyền truy cập</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="p-5 bg-[#eff4ff] rounded-2xl border border-[#0058be]/20 flex items-start gap-3.5">
                  <div className="p-2 bg-[#0058be] text-white rounded-xl shrink-0">
                    <Shield size={18} />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-[#121c2a]">Phân quyền và bảo mật</p>
                    <p className="text-[12px] text-[#424754] leading-relaxed mt-0.5">
                      Người dùng sẽ nhận được email hướng dẫn kích hoạt tài khoản và tự động được gắn phân quyền <span className="font-bold text-[#0058be]">{role}</span> khi đăng nhập lần đầu tiên.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-[#c2c6d6]/30">
                <button
                  type="submit"
                  className="flex-1 bg-[#0058be] hover:bg-[#2170e4] text-white py-3.5 rounded-2xl font-bold shadow-md shadow-[#0058be]/20 transition-all flex items-center justify-center gap-2 text-[14px]"
                >
                  <UserPlus size={18} />
                  <span>Gửi lời mời ngay</span>
                </button>
                <Link
                  href="/admin/users"
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-[#424754] py-3.5 rounded-2xl font-bold text-center transition-all text-[14px] flex items-center justify-center"
                >
                  Hủy bỏ
                </Link>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  )
}

