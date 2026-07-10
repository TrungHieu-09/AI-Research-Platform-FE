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
} from "lucide-react"
import { cn } from "@/lib/utils"

/* ─── Toggle Component ─── */
function Toggle({ defaultChecked = false }: { defaultChecked?: boolean }) {
  const [on, setOn] = React.useState(defaultChecked)
  return (
    <button
      onClick={() => setOn(!on)}
      aria-pressed={on}
      className={cn(
        "relative flex items-center w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0058be] focus-visible:ring-offset-2 shrink-0",
        on ? "bg-[#0058be]" : "bg-[#d1d5db]"
      )}
    >
      <span
        className={cn(
          "absolute w-4.5 h-[18px] w-[18px] bg-white rounded-full shadow-sm transition-transform duration-300",
          on ? "translate-x-[22px]" : "translate-x-[3px]"
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

const TABS = [
  { id: "profile", label: "Hồ sơ", icon: User },
  { id: "notifications", label: "Thông báo", icon: Bell },
]

export default function UserSettingsPage() {
  const [tab, setTab] = React.useState("profile")
  const [saved, setSaved] = React.useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2800)
  }

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
            className="flex items-center gap-2 bg-[#0058be] hover:bg-[#004fa8] text-white px-5 py-2.5 rounded-xl font-bold text-[13.5px] transition-all shadow-md shadow-[#0058be]/25 hover:-translate-y-px active:translate-y-0"
          >
            <Save size={15} />
            Lưu thay đổi
          </button>
        </div>

        {/* ── Avatar Card ── */}
        <div className="bg-white rounded-2xl border border-[#eaecf5] shadow-sm p-5 flex items-center gap-5 mb-6">
          <div className="relative shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0058be] to-[#4d8ef0] flex items-center justify-center font-extrabold text-white text-xl shadow-lg">
              JD
            </div>
            <button className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-[#0058be] text-white rounded-lg flex items-center justify-center shadow-md hover:bg-[#004fa8] transition-colors">
              <Camera size={12} />
            </button>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-bold text-[#1a2333]">Dr. Jane Doe</p>
            <p className="text-[12.5px] text-[#8b90a0] mt-0.5 truncate">jane.doe@university.edu</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[11px] font-bold text-[#0058be] bg-[#eff4ff] px-2.5 py-0.5 rounded-full">PhD Student</span>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Hoạt động
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
                      defaultValue="Jane"
                      className="w-full px-3.5 py-2.5 bg-[#f9fafb] border border-[#e5e7eb] rounded-xl text-[13.5px] text-[#1a2333] font-medium focus:outline-none focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/15 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11.5px] font-bold text-[#6b7280] uppercase tracking-wider">Tên</label>
                    <input
                      type="text"
                      defaultValue="Doe"
                      className="w-full px-3.5 py-2.5 bg-[#f9fafb] border border-[#e5e7eb] rounded-xl text-[13.5px] text-[#1a2333] font-medium focus:outline-none focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/15 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11.5px] font-bold text-[#6b7280] uppercase tracking-wider">Email</label>
                  <div className="relative">
                    <input
                      type="email"
                      defaultValue="jane.doe@university.edu"
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
                    right: <Toggle />
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
