"use client"

import * as React from "react"
import {
  Save,
  User,
  Bell,
  CheckCircle2,
  Zap,
  Moon,
  LayoutGrid,
  Mail,
  Info,
  MessageSquare,
  Camera,
  Lock,
  ChevronDown,
  Send,
  AlertTriangle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/features/auth/auth-context"
import { useTheme } from "@/features/theme/theme-context"

/* ─── Toggle Component ─── */
function Toggle({ checked, defaultChecked, onChange }: { checked?: boolean; defaultChecked?: boolean; onChange?: () => void }) {
  const [on, setOn] = React.useState(checked ?? defaultChecked ?? false)
  const handleClick = () => {
    const next = !on
    setOn(next)
    onChange?.()
  }
  return (
    <button
      onClick={handleClick}
      aria-pressed={on}
      className={cn(
        "relative flex items-center w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0058be] focus-visible:ring-offset-2 shrink-0",
        on ? "bg-[#0058be]" : "bg-[#d1d5db]"
      )}
    >
      <span
        className={cn(
          "absolute w-[18px] h-[18px] bg-white rounded-full shadow-sm transition-transform duration-300",
          on ? "translate-x-[22px]" : "translate-x-[3px]"
        )}
      />
    </button>
  )
}

/* ─── Dark Mode Toggle — connected to ThemeContext ─── */
function DarkModeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === "dark"
  return (
    <button
      onClick={toggleTheme}
      aria-pressed={isDark}
      className={cn(
        "relative flex items-center w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0058be] focus-visible:ring-offset-2 shrink-0",
        isDark ? "bg-[#0058be]" : "bg-[#d1d5db]"
      )}
    >
      <span
        className={cn(
          "absolute w-[18px] h-[18px] bg-white rounded-full shadow-sm transition-transform duration-300",
          isDark ? "translate-x-[22px]" : "translate-x-[3px]"
        )}
      />
    </button>
  )
}

/* ─── Row trong Notification card ─── */
function NotifRow({ icon: Icon, title, desc, defaultChecked = false }: {
  icon: React.ElementType, title: string, desc: string, defaultChecked?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="p-2 bg-[#f0f4ff] text-[#0058be] rounded-xl shrink-0">
          <Icon size={15} />
        </div>
        <div className="min-w-0">
          <p className="text-[13.5px] font-semibold text-[#1a2333] truncate">{title}</p>
          <p className="text-[12px] text-[#8b90a0] mt-0.5 leading-snug">{desc}</p>
        </div>
      </div>
      <Toggle defaultChecked={defaultChecked} />
    </div>
  )
}

/* ─── Section Header ─── */
function SectionHeader({ title, subtitle }: { title: string, subtitle: string }) {
  return (
    <div className="mb-5">
      <h3 className="text-[15px] font-bold text-[#1a2333]">{title}</h3>
      <p className="text-[12px] text-[#8b90a0] mt-0.5">{subtitle}</p>
    </div>
  )
}


function isEmailVerifiedProfile(user: any) {
  const verificationStatus = String(user?.verificationStatus || user?.emailVerificationStatus || "").toUpperCase()
  return Boolean(
    user?.emailVerified ||
    user?.isEmailVerified ||
    user?.verified ||
    user?.emailVerifiedAt ||
    user?.verifiedAt ||
    verificationStatus === "VERIFIED" ||
    verificationStatus === "EMAIL_VERIFIED" ||
    String(user?.status || "").toUpperCase() === "ACTIVE"
  )
}
const TABS = [
  { id: "profile", label: "Hồ sơ", icon: User },
  { id: "notifications", label: "Thông báo", icon: Bell },
]

export default function UserSettingsPage() {
  const { user, updateProfile, token, refreshProfile } = useAuth()
  const [tab, setTab] = React.useState("profile")
  const [saved, setSaved] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState("")
  const [emailOtp, setEmailOtp] = React.useState("")
  const [emailVerifyLoading, setEmailVerifyLoading] = React.useState(false)
  const [emailVerifyMessage, setEmailVerifyMessage] = React.useState("")
  const [emailVerifyError, setEmailVerifyError] = React.useState("")

  // Local state for form fields
  const [firstName, setFirstName] = React.useState("")
  const [lastName, setLastName] = React.useState("")

  // Initialize state from user object
  React.useEffect(() => {
    if (user) {
      const nameParts = user.name.trim().split(" ")
      setFirstName(nameParts.length > 1 ? nameParts[nameParts.length - 1] : user.name)
      setLastName(nameParts.length > 1 ? nameParts.slice(0, -1).join(" ") : "")
    }
  }, [user])

  const handleSave = async () => {
    if (!user) return
    setError("")
    setLoading(true)
    try {
      const newName = `${lastName} ${firstName}`.trim()
      await updateProfile({ name: newName })
      setSaved(true)
      setTimeout(() => setSaved(false), 2800)
    } catch (err: any) {
      setError(err.message ?? "Lỗi khi cập nhật hồ sơ")
    } finally {
      setLoading(false)
    }
  }


  const requestEmailOtp = async () => {
    if (!user) return
    setEmailVerifyError("")
    setEmailVerifyMessage("")
    setEmailVerifyLoading(true)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
      const res = await fetch(`${baseUrl}/api/users/me/email-verification/request-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({}),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || data.message || "Không thể gửi OTP xác thực Gmail.")
      setEmailVerifyMessage("Đã gửi mã OTP xác thực về Gmail của bạn.")
    } catch (err: any) {
      setEmailVerifyError(err.message || "Không thể gửi OTP xác thực Gmail.")
    } finally {
      setEmailVerifyLoading(false)
    }
  }

  const verifyEmailOtp = async () => {
    if (!user) return
    if (!emailOtp.trim()) {
      setEmailVerifyError("Vui lòng nhập mã OTP.")
      return
    }
    setEmailVerifyError("")
    setEmailVerifyMessage("")
    setEmailVerifyLoading(true)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
      const res = await fetch(`${baseUrl}/api/users/me/email-verification/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ otpCode: emailOtp.trim() }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || data.message || "Mã OTP không hợp lệ hoặc đã hết hạn.")
      setEmailVerifyMessage("Xác thực Gmail thành công. Hồ sơ của bạn đã được cập nhật.")
      setEmailOtp("")
      await refreshProfile()
    } catch (err: any) {
      setEmailVerifyError(err.message || "Không thể xác thực Gmail.")
    } finally {
      setEmailVerifyLoading(false)
    }
  }
  if (!user) return null

  return (
    <div className="min-h-screen bg-[#f5f7fc] p-4 md:p-8 pb-24">

      {/* ── Toast ── */}
      {saved && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1a2333] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <CheckCircle2 size={16} className="text-[#4ade80] shrink-0" />
          <span className="text-[13px] font-semibold">Đã lưu thay đổi!</span>
        </div>
      )}

      {/* ── Page Header ── */}
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-[26px] font-extrabold text-[#1a2333] tracking-tight">Cài đặt</h1>
            <p className="text-[13px] text-[#8b90a0] mt-0.5">Tuỳ chỉnh tài khoản và thông báo của bạn</p>
          </div>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 bg-[#0058be] hover:bg-[#004fa8] text-white px-5 py-2.5 rounded-xl font-bold text-[13.5px] transition-all shadow-md shadow-[#0058be]/25 hover:-translate-y-px active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <span className="material-symbols-outlined text-[15px] animate-spin">progress_activity</span> : <Save size={15} />}
            {loading ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-center gap-3 text-red-600 text-[13.5px] font-medium">
            <Info size={16} /> {error}
          </div>
        )}

        {/* ── Avatar Card ── */}
        <div className="bg-white rounded-2xl border border-[#eaecf5] shadow-sm p-5 flex items-center gap-5 mb-6">
          <div className="relative shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0058be] to-[#4d8ef0] flex items-center justify-center font-extrabold text-white text-xl shadow-lg">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover rounded-2xl" />
              ) : (
                user.initials
              )}
            </div>
            <button className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-[#0058be] text-white rounded-lg flex items-center justify-center shadow-md hover:bg-[#004fa8] transition-colors">
              <Camera size={12} />
            </button>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-bold text-[#1a2333]">{user.name}</p>
            <p className="text-[12.5px] text-[#8b90a0] mt-0.5 truncate">{user.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[11px] font-bold text-[#0058be] bg-[#eff4ff] px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                {user.role}
              </span>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Hoạt động
              </span>
              <span className={cn(
                "text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1",
                isEmailVerifiedProfile(user) ? "text-emerald-700 bg-emerald-50" : "text-amber-800 bg-amber-50"
              )}>
                {isEmailVerifiedProfile(user) ? "Gmail đã xác thực" : "Gmail chưa xác thực"}
              </span>
            </div>
          </div>
          <button className="shrink-0 text-[12px] font-bold text-[#0058be] border border-[#0058be]/30 hover:bg-[#eff4ff] px-3.5 py-1.5 rounded-xl transition-all hidden sm:block">
            Đổi ảnh
          </button>
        </div>

        {/* ── Tab Navigation ── */}
        <div className="flex items-center bg-white border border-[#eaecf5] rounded-xl p-1 mb-6 shadow-sm w-fit gap-1">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all",
                tab === t.id
                  ? "bg-[#0058be] text-white shadow-sm"
                  : "text-[#6b7280] hover:text-[#1a2333] hover:bg-[#f5f7fc]"
              )}
            >
              <t.icon size={14} />
              {t.label}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════
            TAB: HỒ SƠ
        ══════════════════════════════════════ */}
        {tab === "profile" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">

            {/* Thông tin cơ bản */}
            <div className="bg-white rounded-2xl border border-[#eaecf5] shadow-sm p-6">
              <SectionHeader title="Thông tin cá nhân" subtitle="Tên hiển thị và vai trò trong hệ thống" />
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11.5px] font-bold text-[#6b7280] uppercase tracking-wider">Họ</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#f9fafb] border border-[#e5e7eb] rounded-xl text-[13.5px] text-[#1a2333] font-medium focus:outline-none focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/15 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11.5px] font-bold text-[#6b7280] uppercase tracking-wider">Tên</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#f9fafb] border border-[#e5e7eb] rounded-xl text-[13.5px] text-[#1a2333] font-medium focus:outline-none focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/15 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11.5px] font-bold text-[#6b7280] uppercase tracking-wider">Email</label>
                  <div className="relative">
                    <input
                      type="email"
                      defaultValue={user.email}
                      disabled
                      className="w-full px-3.5 py-2.5 bg-[#f3f4f6] border border-[#e5e7eb] rounded-xl text-[13.5px] text-[#9ca3af] cursor-not-allowed pr-28"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10.5px] font-bold text-[#9ca3af] bg-white border border-[#e5e7eb] px-2 py-0.5 rounded-lg flex items-center gap-1">
                      <Lock size={9} /> Không đổi được
                    </span>
                  </div>
                  <p className="text-[11.5px] text-[#9ca3af] flex items-center gap-1 mt-0.5">
                    <Info size={11} /> Liên hệ IT Support để thay đổi email trường.
                  </p>
                </div>

                <div className={cn(
                  "rounded-2xl border p-4",
                  isEmailVerifiedProfile(user) ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"
                )}>
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                      isEmailVerifiedProfile(user) ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"
                    )}>
                      {isEmailVerifiedProfile(user) ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13.5px] font-extrabold text-[#1a2333]">
                        {isEmailVerifiedProfile(user) ? "Gmail đã được xác thực" : "Xác thực Gmail để tăng độ uy tín"}
                      </p>
                      <p className="mt-1 text-[12px] font-medium leading-relaxed text-[#6b7280]">
                        {isEmailVerifiedProfile(user)
                          ? "Tài khoản này đã xác thực bằng OTP. Admin sẽ thấy trạng thái uy tín khi xét duyệt tài liệu công khai."
                          : "Nếu tài khoản do admin tạo, hãy gửi OTP và nhập mã xác thực để được đánh dấu là user đáng tin cậy."}
                      </p>
                    </div>
                  </div>

                  {!isEmailVerifiedProfile(user) && (
                    <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
                      <input
                        type="text"
                        value={emailOtp}
                        onChange={(event) => setEmailOtp(event.target.value)}
                        placeholder="Nhập mã OTP Gmail"
                        className="rounded-xl border border-amber-200 bg-white px-3.5 py-2.5 text-[13px] font-semibold text-[#1a2333] outline-none transition-all focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/15"
                      />
                      <button
                        type="button"
                        onClick={requestEmailOtp}
                        disabled={emailVerifyLoading}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#0058be]/20 bg-white px-4 py-2.5 text-[13px] font-bold text-[#0058be] transition-colors hover:bg-[#eff4ff] disabled:opacity-50"
                      >
                        <Send size={14} /> Gửi OTP
                      </button>
                      <button
                        type="button"
                        onClick={verifyEmailOtp}
                        disabled={emailVerifyLoading || !emailOtp.trim()}
                        className="rounded-xl bg-[#0058be] px-4 py-2.5 text-[13px] font-bold text-white shadow-md shadow-[#0058be]/20 transition-colors hover:bg-[#004fa8] disabled:opacity-50"
                      >
                        Xác thực
                      </button>
                    </div>
                  )}

                  {emailVerifyMessage && <p className="mt-3 text-[12px] font-bold text-emerald-700">{emailVerifyMessage}</p>}
                  {emailVerifyError && <p className="mt-3 text-[12px] font-bold text-red-600">{emailVerifyError}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11.5px] font-bold text-[#6b7280] uppercase tracking-wider">Vai trò nghiên cứu</label>
                  <div className="relative">
                    <select className="w-full px-3.5 py-2.5 bg-[#f9fafb] border border-[#e5e7eb] rounded-xl text-[13.5px] text-[#1a2333] font-medium focus:outline-none focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/15 transition-all appearance-none cursor-pointer pr-10">
                      <option>🎓 Nghiên cứu sinh (PhD Student)</option>
                      <option>👨‍🏫 Giảng viên (Professor)</option>
                      <option>🔬 Trợ lý nghiên cứu</option>
                      <option>📚 Sinh viên đại học</option>
                    </select>
                    <ChevronDown size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9ca3af] pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Workspace */}
            <div className="bg-white rounded-2xl border border-[#eaecf5] shadow-sm p-6">
              <SectionHeader title="Tuỳ chọn Workspace" subtitle="Giao diện và mô hình AI mặc định" />
              <div className="space-y-1 -mx-1">
                {[
                  {
                    icon: Zap,
                    label: "Mô hình AI mặc định",
                    desc: "Chọn engine AI cho việc tổng hợp tài liệu",
                    right: (
                      <div className="relative shrink-0">
                        <select className="pl-3 pr-8 py-1.5 bg-[#f0f4ff] border border-[#d0dcf8] rounded-lg text-[12px] font-bold text-[#0058be] focus:outline-none appearance-none cursor-pointer">
                          <option>Lumis Core ⚡</option>
                          <option>GPT-4o</option>
                          <option>Claude 3.5</option>
                        </select>
                        <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#0058be] pointer-events-none" />
                      </div>
                    )
                  },
                  {
                    icon: Moon,
                    label: "Chế độ tối",
                    desc: "Bật Dark Mode toàn bộ giao diện",
                    right: <DarkModeToggle />
                  },
                  {
                    icon: LayoutGrid,
                    label: "Chế độ thu gọn",
                    desc: "Hiển thị nhiều mục hơn trong thư viện",
                    right: <Toggle defaultChecked />
                  },
                ].map((item, i, arr) => (
                  <div key={i} className={cn("flex items-center justify-between gap-4 px-3 py-3.5 rounded-xl hover:bg-[#f9fafb] transition-colors", i < arr.length - 1 && "border-b border-[#f0f1f7]")}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 bg-[#f0f4ff] text-[#0058be] rounded-xl shrink-0">
                        <item.icon size={15} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13.5px] font-semibold text-[#1a2333]">{item.label}</p>
                        <p className="text-[11.5px] text-[#8b90a0] mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                    {item.right}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════
            TAB: THÔNG BÁO
        ══════════════════════════════════════ */}
        {tab === "notifications" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">

            <div className="bg-white rounded-2xl border border-[#eaecf5] shadow-sm p-6">
              <SectionHeader title="Thông báo Email" subtitle="Nhận email về hoạt động tài khoản của bạn" />
              <div className="divide-y divide-[#f3f4f6]">
                <NotifRow icon={Mail} title="Phân tích tài liệu hoàn tất" desc="Email khi tổng hợp tài liệu dài kết thúc." defaultChecked />
                <NotifRow icon={Mail} title="Bản tin hàng tuần" desc="Tóm tắt tiến độ đọc và mức sử dụng workspace." />
                <NotifRow icon={Mail} title="Cập nhật hệ thống" desc="Thông báo về mô hình AI và tính năng mới." defaultChecked />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#eaecf5] shadow-sm p-6">
              <SectionHeader title="Thông báo In-App" subtitle="Hiển thị trực tiếp trong giao diện hệ thống" />
              <div className="divide-y divide-[#f3f4f6]">
                <NotifRow icon={MessageSquare} title="Tài liệu được chia sẻ" desc="Khi người dùng khác chia sẻ tài liệu với bạn." defaultChecked />
                <NotifRow icon={MessageSquare} title="Cảnh báo hạn mức" desc="Khi bạn sắp đạt giới hạn truy vấn AI hoặc lưu trữ." defaultChecked />
              </div>
            </div>

            {/* Info banner */}
            <div className="flex items-start gap-3 bg-[#f0f4ff] border border-[#d0dcf8] rounded-2xl px-4 py-3.5">
              <Info size={15} className="text-[#0058be] mt-0.5 shrink-0" />
              <p className="text-[12.5px] text-[#424754] leading-relaxed">
                Thay đổi cài đặt thông báo có thể mất tới <span className="font-bold text-[#0058be]">5 phút</span> để có hiệu lực.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

