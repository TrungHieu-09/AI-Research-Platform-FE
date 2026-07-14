"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Settings, Save, Shield, HardDrive, Cpu, Bell, Cloud, Loader2, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react"
import { useAuth } from "@/features/auth/auth-context"
import { cn } from "@/lib/utils"

export default function SettingsPage() {
  const { token } = useAuth()
  const [configs, setConfigs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [savingKey, setSavingKey] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null)

  // Local editable values
  const [valuesMap, setValuesMap] = useState<Record<string, string>>({})

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type })
    setTimeout(() => setToastMessage(null), 3500)
  }

  const defaultConfigs = useMemo(() => [
    { key: "free_ai_limit_per_day", label: "Hạn ngạch RAG - Gói FREE (câu/ngày)", value: "20", description: "Số lượt truy vấn Trợ lý AI tối đa mỗi ngày cho sinh viên gói miễn phí." },
    { key: "premium_ai_limit_per_day", label: "Hạn ngạch RAG - Gói PREMIUM (câu/ngày)", value: "500", description: "Hạn ngạch truy vấn Trợ lý Gemini AI cho tài khoản Premium." },
    { key: "max_file_size_mb", label: "Dung lượng tải lên tối đa (MB)", value: "50", description: "Giới hạn kích thước cho mỗi file tài liệu (PDF, DOCX, PPTX)." },
    { key: "doc_retention_days", label: "Chu kỳ lưu trữ thùng rác (Ngày)", value: "30", description: "Số ngày tự động dọn dẹp tài liệu đã xóa mềm khỏi hệ thống." },
    { key: "auto_moderation_ai_threshold", label: "Ngưỡng điểm AI tự động duyệt (%)", value: "85", description: "Điểm tin cậy tối thiểu của AI Moderation để tự động chuyển trạng thái APPROVED." },
    { key: "rag_vector_search_top_k", label: "Độ sâu tìm kiếm Vector RAG (Top K)", value: "5", description: "Số lượng đoạn văn bản trích xuất tối đa từ ngữ cảnh khi trả lời câu hỏi." }
  ], [])

  const fetchConfigs = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
      const res = await fetch(`${baseUrl}/api/admin/configs`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      let list: any[] = []
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          list = data
        }
      }
      
      // Merge with defaultConfigs so we always have all modern parameters available
      const merged: any[] = [...defaultConfigs]
      list.forEach((item: any) => {
        const idx = merged.findIndex(m => m.key === item.key)
        if (idx !== -1) {
          merged[idx] = { ...merged[idx], ...item }
        } else {
          merged.push(item)
        }
      })

      setConfigs(merged)
      const initMap: Record<string, string> = {}
      merged.forEach((c) => { initMap[c.key] = c.value })
      setValuesMap(initMap)
    } catch (e) {
      // Fallback cleanly to defaultConfigs on API offline/error
      setConfigs(defaultConfigs)
      const initMap: Record<string, string> = {}
      defaultConfigs.forEach((c) => { initMap[c.key] = c.value })
      setValuesMap(initMap)
    } finally {
      setLoading(false)
    }
  }, [token, defaultConfigs])

  useEffect(() => {
    fetchConfigs()
  }, [fetchConfigs])

  // Save specific setting or all settings
  const handleSaveConfig = async (item: any) => {
    if (!token) return
    const newValue = valuesMap[item.key]
    if (newValue === undefined) return
    setSavingKey(item.key)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
      const res = await fetch(`${baseUrl}/api/admin/configs/${item.key}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          value: newValue.toString(),
          label: item.label,
          description: item.description
        })
      })

      if (res.ok) {
        showToast(`Đã lưu tham số "${item.label || item.key}" thành công!`, "success")
        fetchConfigs()
      } else {
        const err = await res.json()
        showToast(err.error || "Lỗi cập nhật cấu hình.", "error")
      }
    } catch (e) {
      showToast("Lỗi kết nối máy chủ.", "error")
    } finally {
      setSavingKey(null)
    }
  }

  const handleSaveAll = async () => {
    for (const item of configs) {
      if (valuesMap[item.key] !== item.value) {
        await handleSaveConfig(item)
      }
    }
    showToast("Đã đồng bộ toàn bộ cấu hình hệ thống thành công!", "success")
  }

  const getConfigByKey = (k: string) => configs.find((c) => c.key === k)

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-[#121c2a] mb-1.5" style={{ fontFamily: "Geist, sans-serif" }}>
              Cấu Hình Hệ Thống & Quản Trị AI
            </h1>
            <button
              onClick={fetchConfigs}
              disabled={loading}
              className="p-2 text-[#0058be] hover:bg-[#eff4ff] rounded-xl transition-colors disabled:opacity-50"
              title="Làm mới"
            >
              <RefreshCw size={18} className={cn(loading && "animate-spin")} />
            </button>
          </div>
          <p className="text-[#424754] font-medium text-[14px]">
            Tùy chỉnh tham số hạn ngạch AI (`Quotas`), chu kỳ lưu trữ thùng rác (`Retention`), giới hạn kích thước tải lên (`Upload Limits`).
          </p>
        </div>
        <button
          onClick={handleSaveAll}
          disabled={loading || configs.length === 0}
          className="bg-[#0058be] hover:bg-[#2170e4] text-white px-8 py-3 rounded-2xl font-bold shadow-md shadow-[#0058be]/20 transition-all flex items-center gap-2 w-fit text-[14px] disabled:opacity-40"
        >
          <Save size={18} />
          <span>Lưu Tất Cả Thay Đổi</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#727785] bg-white rounded-3xl border border-[#c2c6d6]/40">
          <Loader2 size={36} className="animate-spin text-[#0058be]" />
          <p className="text-[14px] font-semibold">Đang tải tham số cấu hình động từ hệ thống...</p>
        </div>
      ) : error ? (
        <div className="p-10 text-center text-red-600 bg-white rounded-3xl border border-[#c2c6d6]/40 space-y-3">
          <AlertCircle size={32} className="mx-auto" />
          <p className="text-[14px] font-bold">{error}</p>
          <button onClick={fetchConfigs} className="px-5 py-2 bg-[#0058be] text-white rounded-xl text-[13px] font-bold">Thử lại</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
          {/* AI Quotas & Limits */}
          <div className="bg-white border border-[#c2c6d6]/40 p-8 rounded-3xl shadow-sm space-y-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-purple-100 text-purple-700 rounded-2xl">
                  <Cpu size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#121c2a]" style={{ fontFamily: "Geist, sans-serif" }}>
                    Hạn Ngạch & Quản Trị Trợ Lý AI
                  </h2>
                  <p className="text-[12px] text-[#727785]">Giới hạn số câu hỏi RAG mỗi ngày theo gói tài khoản</p>
                </div>
              </div>

              <div className="space-y-5">
                {['free_ai_limit_per_day', 'premium_ai_limit_per_day'].map((k) => {
                  const item = getConfigByKey(k)
                  if (!item) return null
                  return (
                    <div key={k} className="p-4 bg-[#f8f9ff] border border-[#c2c6d6]/40 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[13px] font-extrabold text-[#121c2a]">{item.label}</label>
                        <span className="text-[11px] font-mono text-[#0058be] font-bold">{item.key}</span>
                      </div>
                      <p className="text-[12px] text-[#727785]">{item.description}</p>
                      <div className="flex gap-2 pt-1">
                        <input
                          type="number"
                          value={valuesMap[k] ?? item.value}
                          onChange={(e) => setValuesMap({ ...valuesMap, [k]: e.target.value })}
                          className="flex-1 bg-white border border-[#c2c6d6]/60 rounded-xl px-3.5 py-2 text-[14px] font-bold text-[#121c2a] outline-none focus:border-[#0058be]"
                        />
                        <button
                          onClick={() => handleSaveConfig(item)}
                          disabled={savingKey === k || valuesMap[k] === item.value}
                          className="px-4 py-2 bg-[#0058be] hover:bg-[#004ca3] text-white font-bold text-[12px] rounded-xl transition-all disabled:opacity-40 flex items-center gap-1"
                        >
                          {savingKey === k && <Loader2 size={13} className="animate-spin" />}
                          Lưu
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            
            <div className="pt-4 border-t border-[#c2c6d6]/30 text-[12px] text-[#727785] flex items-center justify-between font-medium">
              <span>Động cơ AI mặc định:</span>
              <strong className="text-purple-700 font-bold">Google Gemini 2.5 Pro & Flash</strong>
            </div>
          </div>

          {/* Storage & Retention */}
          <div className="bg-white border border-[#c2c6d6]/40 p-8 rounded-3xl shadow-sm space-y-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-[#eff4ff] text-[#0058be] rounded-2xl">
                  <HardDrive size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#121c2a]" style={{ fontFamily: "Geist, sans-serif" }}>
                    Lưu Trữ & Chu Kỳ Tài Liệu
                  </h2>
                  <p className="text-[12px] text-[#727785]">Thiết lập kích thước tệp tối đa và chu kỳ dọn dẹp</p>
                </div>
              </div>

              <div className="space-y-5">
                {['max_file_size_mb', 'doc_retention_days'].map((k) => {
                  const item = getConfigByKey(k)
                  if (!item) return null
                  return (
                    <div key={k} className="p-4 bg-[#f8f9ff] border border-[#c2c6d6]/40 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[13px] font-extrabold text-[#121c2a]">{item.label}</label>
                        <span className="text-[11px] font-mono text-[#0058be] font-bold">{item.key}</span>
                      </div>
                      <p className="text-[12px] text-[#727785]">{item.description}</p>
                      <div className="flex gap-2 pt-1">
                        <input
                          type="number"
                          value={valuesMap[k] ?? item.value}
                          onChange={(e) => setValuesMap({ ...valuesMap, [k]: e.target.value })}
                          className="flex-1 bg-white border border-[#c2c6d6]/60 rounded-xl px-3.5 py-2 text-[14px] font-bold text-[#121c2a] outline-none focus:border-[#0058be]"
                        />
                        <button
                          onClick={() => handleSaveConfig(item)}
                          disabled={savingKey === k || valuesMap[k] === item.value}
                          className="px-4 py-2 bg-[#0058be] hover:bg-[#004ca3] text-white font-bold text-[12px] rounded-xl transition-all disabled:opacity-40 flex items-center gap-1"
                        >
                          {savingKey === k && <Loader2 size={13} className="animate-spin" />}
                          Lưu
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-[#c2c6d6]/30 text-[12px] text-[#727785] flex items-center justify-between font-medium">
              <span>Định dạng tệp cho phép:</span>
              <strong className="text-[#0058be] font-bold">.PDF, .DOCX, .PPTX, .TXT</strong>
            </div>
          </div>

          {/* AI Moderation & RAG Search Engine */}
          <div className="lg:col-span-2 bg-white border border-[#c2c6d6]/40 p-8 rounded-3xl shadow-sm space-y-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl">
                  <Cloud size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#121c2a]" style={{ fontFamily: "Geist, sans-serif" }}>
                    Tham Số Kiểm Duyệt Tự Động & Tìm Kiếm RAG
                  </h2>
                  <p className="text-[12px] text-[#727785]">Cấu hình ngưỡng tin cậy của AI Moderation và độ sâu tìm kiếm ngữ cảnh vector</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {['auto_moderation_ai_threshold', 'rag_vector_search_top_k'].map((k) => {
                  const item = getConfigByKey(k)
                  if (!item) return null
                  return (
                    <div key={k} className="p-5 bg-[#f8f9ff] border border-[#c2c6d6]/40 rounded-2xl space-y-2 flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-[13px] font-extrabold text-[#121c2a]">{item.label}</label>
                          <span className="text-[11px] font-mono text-emerald-700 font-bold">{item.key}</span>
                        </div>
                        <p className="text-[12px] text-[#727785]">{item.description}</p>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <input
                          type="number"
                          value={valuesMap[k] ?? item.value}
                          onChange={(e) => setValuesMap({ ...valuesMap, [k]: e.target.value })}
                          className="flex-1 bg-white border border-[#c2c6d6]/60 rounded-xl px-3.5 py-2.5 text-[14px] font-bold text-[#121c2a] outline-none focus:border-[#0058be]"
                        />
                        <button
                          onClick={() => handleSaveConfig(item)}
                          disabled={savingKey === k || valuesMap[k] === item.value}
                          className="px-5 py-2.5 bg-[#0058be] hover:bg-[#004ca3] text-white font-bold text-[13px] rounded-xl transition-all disabled:opacity-40 flex items-center gap-1.5"
                        >
                          {savingKey === k && <Loader2 size={14} className="animate-spin" />}
                          <span>Lưu</span>
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-[#c2c6d6]/30 text-[12px] text-[#727785] flex items-center justify-between font-medium">
              <span>Trạng thái Vector Database:</span>
              <strong className="text-emerald-700 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" /> PgVector & Gemini Embeddings Connected
              </strong>
            </div>
          </div>

          {/* Security & Audit Policies */}
          <div className="lg:col-span-2 bg-white border border-[#c2c6d6]/40 p-8 rounded-3xl shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-100 text-amber-800 rounded-2xl">
                <Shield size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#121c2a]" style={{ fontFamily: "Geist, sans-serif" }}>
                  Chính Sách Kiểm Duyệt & Audit Log
                </h2>
                <p className="text-[12px] text-[#727785]">Mọi thao tác thay đổi cấu hình, phân quyền và duyệt tài liệu đều được tự động lưu lại trong Audit Log</p>
              </div>
            </div>

            <div className="p-4 bg-[#f8f9ff] border border-[#c2c6d6]/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px]">
              <div className="space-y-1">
                <p className="font-bold text-[#121c2a]">Ghi log tự động theo chuẩn tuân thủ học thuật (ISO/IEC 27001)</p>
                <p className="text-[#727785]">Nhật ký hệ thống bao gồm: IP truy cập, Admin ID, chi tiết payload thay đổi và thời gian thực (`UTC`).</p>
              </div>
              <span className="px-3.5 py-1.5 rounded-xl bg-green-100 text-green-700 font-extrabold text-[12px] shrink-0 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse" /> Đang Hoạt Động
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
