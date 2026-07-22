"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  FileText,
  Trash2,
  HardDrive,
  AlertTriangle,
  FolderOpen,
  FolderPlus,
  RefreshCw,
  TrendingUp,
  CloudUpload,
  Database,
  Loader2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useAuth } from "@/features/auth/auth-context"

export default function StoragePage() {
  const { user, token } = useAuth()
  const isPremium = user?.tier === "PREMIUM"
  const totalCapGB = isPremium ? 100 : 5 // 100 GB for Premium, 5 GB for Free

  const [documents, setDocuments] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])
  const [deleting, setDeleting] = React.useState(false)
  const [toastMessage, setToastMessage] = React.useState<{ text: string; type: "success" | "error" } | null>(null)

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type })
    setTimeout(() => setToastMessage(null), 3500)
  }

  const fetchDocuments = React.useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
      const res = await fetch(`${baseUrl}/api/documents`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        if (data && Array.isArray(data.items)) {
          setDocuments(data.items)
        } else {
          setDocuments([])
        }
      } else {
        setError("Không tải được danh sách tài liệu từ máy chủ.")
      }
    } catch (e) {
      setError("Lỗi kết nối máy chủ khi truy xuất lưu trữ.")
    } finally {
      setLoading(false)
    }
  }, [token])

  React.useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  // Calculate real storage metrics from live documents
  const stats = React.useMemo(() => {
    let pdfCount = 0, docxCount = 0, txtCount = 0
    let pdfBytes = 0, docxBytes = 0, txtBytes = 0

    documents.forEach((doc) => {
      // Estimate or use real fileSize (defaulting to ~500 KB per doc if missing)
      const sizeBytes = Number(doc.fileSize || (doc.content ? doc.content.length * 2 : 512000))
      const mime = (doc.mimeType || "").toLowerCase()

      if (mime.includes("pdf")) {
        pdfCount++
        pdfBytes += sizeBytes
      } else if (mime.includes("word") || mime.includes("document") || mime.includes("docx")) {
        docxCount++
        docxBytes += sizeBytes
      } else {
        txtCount++
        txtBytes += sizeBytes
      }
    })

    const totalBytes = pdfBytes + docxBytes + txtBytes
    const totalMB = totalBytes / (1024 * 1024)
    const totalGB = totalMB / 1024
    const usedPct = Math.min(100, Math.max(documents.length > 0 ? 1 : 0, Math.round((totalGB / totalCapGB) * 100)))

    const pdfMB = pdfBytes / (1024 * 1024)
    const docxMB = docxBytes / (1024 * 1024)
    const txtMB = txtBytes / (1024 * 1024)

    return {
      pdfCount, docxCount, txtCount,
      pdfMB: pdfMB.toFixed(1), docxMB: docxMB.toFixed(1), txtMB: txtMB.toFixed(1),
      totalMB: totalMB.toFixed(2),
      totalGB: totalGB < 0.01 && documents.length > 0 ? "< 0.01" : totalGB.toFixed(2),
      usedPct,
      breakdown: [
        { label: "PDF Documents", count: `${pdfCount} tệp`, mb: pdfMB.toFixed(1), color: "bg-red-500", textColor: "text-red-600", bgLight: "bg-red-50" },
        { label: "Word / DOCX", count: `${docxCount} tệp`, mb: docxMB.toFixed(1), color: "bg-[#0058be]", textColor: "text-[#0058be]", bgLight: "bg-[#eff4ff]" },
        { label: "Ghi chú & Text", count: `${txtCount} tệp`, mb: txtMB.toFixed(1), color: "bg-amber-500", textColor: "text-amber-600", bgLight: "bg-amber-50" },
      ]
    }
  }, [documents, totalCapGB])

  // Sort by estimated/real size descending for "Largest files"
  const largestFiles = React.useMemo(() => {
    return [...documents].sort((a, b) => {
      const sizeA = Number(a.fileSize || (a.content ? a.content.length * 2 : 512000))
      const sizeB = Number(b.fileSize || (b.content ? b.content.length * 2 : 512000))
      return sizeB - sizeA
    }).slice(0, 10).map((doc) => {
      const sizeBytes = Number(doc.fileSize || (doc.content ? doc.content.length * 2 : 512000))
      const sizeMB = (sizeBytes / (1024 * 1024)).toFixed(2)
      const mime = (doc.mimeType || "").toLowerCase()
      let iconColor = "text-gray-500"
      let iconBg = "bg-gray-100"
      let badgeText = "TXT"
      if (mime.includes("pdf")) { iconColor = "text-red-500"; iconBg = "bg-red-50"; badgeText = "PDF" }
      else if (mime.includes("word") || mime.includes("document")) { iconColor = "text-[#0058be]"; iconBg = "bg-[#eff4ff]"; badgeText = "DOCX" }

      return {
        id: doc.id,
        name: doc.title || "Tài liệu không tên",
        sizeMB,
        type: badgeText,
        iconColor,
        iconBg,
        date: new Date(doc.createdAt).toLocaleDateString("vi-VN")
      }
    })
  }, [documents])

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === largestFiles.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(largestFiles.map(f => f.id))
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0 || !token) return
    if (!window.confirm(`Bạn có chắc muốn xóa vĩnh viễn ${selectedIds.length} tệp đã chọn khỏi hệ thống?`)) return
    setDeleting(true)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
      await Promise.all(selectedIds.map(id =>
        fetch(`${baseUrl}/api/documents/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        })
      ))
      showToast(`Đã xóa thành công ${selectedIds.length} tài liệu khỏi lưu trữ đám mây!`, "success")
      setSelectedIds([])
      fetchDocuments()
    } catch (e) {
      showToast("Lỗi khi xóa tài liệu trên máy chủ.", "error")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Toast */}
      {toastMessage && (
        <div className={cn(
          "fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-xl border flex items-center gap-3 text-white font-semibold text-[13px] animate-in slide-in-from-bottom-2",
          toastMessage.type === "success" ? "bg-green-600 border-green-500" : "bg-red-600 border-red-500"
        )}>
          <CheckCircle2 size={18} />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Title & Refresh Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-[#121c2a] mb-1" style={{ fontFamily: "Geist, sans-serif" }}>
              Quản Lý Lưu Trữ Đám Mây
            </h1>
            <button
              onClick={fetchDocuments}
              disabled={loading}
              className="p-2 text-[#0058be] hover:bg-[#eff4ff] rounded-xl transition-colors disabled:opacity-50"
              title="Làm mới đồng bộ"
            >
              <RefreshCw size={18} className={cn(loading && "animate-spin")} />
            </button>
          </div>
          <p className="text-[#424754] font-medium text-[14px]">
            Theo dõi dung lượng thực tế, quản lý phân bổ tài liệu PDF/DOCX và dọn dẹp các tệp lớn trong không gian học tập.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/user/upload"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#0058be] hover:bg-[#004ca3] text-white font-bold text-[13px] shadow-md transition-all hover:scale-105"
          >
            <CloudUpload size={17} />
            <span>Tải tài liệu mới</span>
          </Link>
          {!isPremium && (
            <Link
              href="/user/payment"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-[13px] shadow-md transition-all hover:scale-105"
            >
              <Sparkles size={16} />
              <span>Nâng 100 GB</span>
            </Link>
          )}
        </div>
      </div>

      {/* Main Storage Capacity Overview Card */}
      <div className="bg-white rounded-3xl border border-[#c2c6d6]/40 p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#c2c6d6]/30">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#eff4ff] text-[#0058be] flex items-center justify-center shrink-0 shadow-inner">
              <HardDrive size={30} strokeWidth={1.75} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-[#121c2a]" style={{ fontFamily: "Geist, sans-serif" }}>
                  {loading ? "Đang đồng bộ..." : `${stats.totalMB} MB Đã Sử Dụng`}
                </h2>
                <span className={cn(
                  "px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider",
                  isPremium ? "bg-amber-100 text-amber-800 border border-amber-300" : "bg-blue-100 text-blue-800"
                )}>
                  {isPremium ? "PREMIUM 100 GB" : "FREE 5 GB"}
                </span>
              </div>
              <p className="text-[13px] text-[#727785] mt-1">
                Tổng dung lượng đã cấp phát: <strong className="text-[#121c2a] font-mono">{totalCapGB} GB</strong> ({documents.length} tài liệu đang lưu trữ)
              </p>
            </div>
          </div>

          <div className="text-left md:text-right">
            <span className="text-3xl font-extrabold text-[#0058be] font-mono">{stats.usedPct}%</span>
            <p className="text-[12px] text-[#727785] font-medium">Tỷ lệ sử dụng không gian</p>
          </div>
        </div>

        {/* Multi-color Storage Bar */}
        <div className="space-y-3">
          <div className="w-full h-4 bg-[#f0f4ff] rounded-full overflow-hidden flex p-0.5 shadow-inner">
            <div
              className="h-full bg-red-500 rounded-l-full transition-all duration-700"
              style={{ width: `${documents.length > 0 ? Math.max(4, (Number(stats.pdfMB) / Number(stats.totalMB || 1)) * stats.usedPct) : 0}%` }}
              title={`PDF: ${stats.pdfMB} MB`}
            />
            <div
              className="h-full bg-[#0058be] transition-all duration-700"
              style={{ width: `${documents.length > 0 ? Math.max(4, (Number(stats.docxMB) / Number(stats.totalMB || 1)) * stats.usedPct) : 0}%` }}
              title={`DOCX: ${stats.docxMB} MB`}
            />
            <div
              className="h-full bg-amber-500 rounded-r-full transition-all duration-700"
              style={{ width: `${documents.length > 0 ? Math.max(2, (Number(stats.txtMB) / Number(stats.totalMB || 1)) * stats.usedPct) : 0}%` }}
              title={`Ghi chú: ${stats.txtMB} MB`}
            />
          </div>

          {/* Breakdown cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {stats.breakdown.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-[#f8f9ff] border border-[#c2c6d6]/30">
                <div className="flex items-center gap-3">
                  <div className={cn("w-3.5 h-3.5 rounded-full shrink-0", item.color)} />
                  <div>
                    <p className="text-[13px] font-bold text-[#121c2a]">{item.label}</p>
                    <p className="text-[11px] text-[#727785] font-medium">{item.count}</p>
                  </div>
                </div>
                <span className="text-[13px] font-mono font-bold text-[#121c2a]">{item.mb} MB</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Largest Files Table Section */}
      <div className="bg-white rounded-3xl border border-[#c2c6d6]/40 p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#c2c6d6]/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#eff4ff] text-[#0058be] flex items-center justify-center">
              <Database size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#121c2a]" style={{ fontFamily: "Geist, sans-serif" }}>
                Danh Sách Tài Liệu Trong Bộ Nhớ
              </h3>
              <p className="text-[13px] text-[#727785]">Top tài liệu lưu trữ trong không gian làm việc của bạn</p>
            </div>
          </div>

          {selectedIds.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              disabled={deleting}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-[13px] shadow transition-all disabled:opacity-50"
            >
              <Trash2 size={16} />
              <span>Xóa ({selectedIds.length}) tệp đã chọn</span>
            </button>
          )}
        </div>

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-[#727785]">
            <Loader2 size={32} className="animate-spin text-[#0058be]" />
            <p className="text-[13px] font-medium">Đang kiểm tra tệp tin thực tế từ máy chủ...</p>
          </div>
        ) : largestFiles.length === 0 ? (
          <div className="py-16 text-center text-[#727785] space-y-3">
            <FolderOpen size={40} className="mx-auto text-[#c2c6d6]" />
            <p className="text-[16px] font-bold text-[#121c2a]">Bạn chưa tải lên tài liệu nào</p>
            <p className="text-[13px] px-4 sm:px-12 md:px-24">Tải lên các bài giảng PDF, khóa luận DOCX hoặc ghi chú để bắt đầu nghiên cứu và hỏi đáp AI.</p>
            <Link href="/user/upload" className="inline-flex items-center gap-2 px-6 py-3 bg-[#0058be] text-white font-bold text-[13px] rounded-2xl mt-2 hover:bg-[#004ca3] transition-colors">
              <CloudUpload size={17} />
              <span>Tải tài liệu ngay</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f8f9ff] border-b border-[#c2c6d6]/40 text-[#727785] text-[11px] font-extrabold uppercase tracking-wider">
                  <th className="py-3.5 px-5 w-[40px]">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === largestFiles.length && largestFiles.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-[#c2c6d6] text-[#0058be] focus:ring-[#0058be]"
                    />
                  </th>
                  <th className="py-3.5 px-5">Tên Tài Liệu</th>
                  <th className="py-3.5 px-5">Định Dạng</th>
                  <th className="py-3.5 px-5">Dung Lượng</th>
                  <th className="py-3.5 px-5 text-right">Ngày Tải Lên</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c2c6d6]/30 text-[13px]">
                {largestFiles.map((f) => (
                  <tr key={f.id} className="hover:bg-[#f8f9ff]/70 transition-colors">
                    <td className="py-4 px-5">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(f.id)}
                        onChange={() => toggleSelect(f.id)}
                        className="w-4 h-4 rounded border-[#c2c6d6] text-[#0058be] focus:ring-[#0058be]"
                      />
                    </td>
                    <td className="py-4 px-5 font-bold text-[#121c2a] max-w-[300px] truncate">
                      <Link href={`/user/ai-workspace?docId=${f.id}`} className="hover:text-[#0058be] transition-colors flex items-center gap-2.5">
                        <FileText size={16} className={f.iconColor} />
                        <span className="truncate">{f.name}</span>
                      </Link>
                    </td>
                    <td className="py-4 px-5">
                      <span className={cn("px-2.5 py-1 rounded-lg text-[11px] font-extrabold uppercase", f.iconBg, f.iconColor)}>
                        {f.type}
                      </span>
                    </td>
                    <td className="py-4 px-5 font-mono font-bold text-[#121c2a]">
                      {f.sizeMB} MB
                    </td>
                    <td className="py-4 px-5 text-right text-[#727785] font-medium">
                      {f.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
