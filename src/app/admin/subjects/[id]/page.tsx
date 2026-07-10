"use client"

import { use, useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AlertCircle, BookOpen, ChevronLeft, Save, Trash2 } from "lucide-react"

import {
  deleteSubject,
  getSubjects,
  updateSubject,
} from "@/features/subjects/api/subjects-api"
import type { Subject, SubjectStatus } from "@/features/subjects/types"

export default function SubjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const [subject, setSubject] = useState<Subject | null>(null)
  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [status, setStatus] = useState<SubjectStatus>("ACTIVE")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const loadSubject = useCallback(async () => {
    try {
      setIsLoading(true)
      setErrorMessage("")
      const items = await getSubjects()
      const found = items.find((item) => item.id === id) ?? null
      setSubject(found)
      setName(found?.name ?? "")
      setCode(found?.code ?? "")
      setStatus(found?.status ?? "ACTIVE")
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Không thể tải subject.")
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadSubject()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [loadSubject])

  async function handleUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      setIsSubmitting(true)
      setErrorMessage("")
      const updated = await updateSubject(id, { name, code, status })
      setSubject(updated)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Không thể cập nhật subject.")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm("Xóa/disable subject này?")) return
    try {
      setIsSubmitting(true)
      await deleteSubject(id)
      router.push("/admin/subjects")
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Không thể xóa subject.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/subjects" className="p-2 hover:bg-surface-container-highest rounded-full transition-colors">
            <ChevronLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">Subject Details</h1>
            <p className="text-on-surface-variant font-medium">
              Update subject details or disable it when it should no longer be available.
            </p>
          </div>
        </div>
      </div>

      {errorMessage ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] font-medium text-red-700">
          {errorMessage}
        </div>
      ) : null}

      {isLoading ? (
        <div className="glass-panel p-8 text-on-surface-variant">Loading subject...</div>
      ) : !subject ? (
        <div className="glass-panel p-8 text-on-surface-variant">Subject not found.</div>
      ) : (
        <form onSubmit={handleUpdate} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="glass-panel p-8 space-y-6">
              <h3 className="text-xl font-bold text-on-surface flex items-center gap-2">
                <BookOpen size={20} />
                General Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[14px] font-bold text-on-surface">Subject Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-2xl px-4 py-3 text-[14px] focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[14px] font-bold text-on-surface">Subject Code</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-2xl px-4 py-3 text-[14px] focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[14px] font-bold text-on-surface">Status</label>
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value as SubjectStatus)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-2xl px-4 py-3 text-[14px] focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="glass-panel p-8 space-y-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-8 py-3 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-secondary disabled:opacity-60"
              >
                <Save size={18} />
                Save Changes
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => void handleDelete()}
                className="w-full flex items-center justify-center gap-2 py-3 text-red-600 font-bold hover:bg-red-50 rounded-2xl"
              >
                <Trash2 size={18} />
                Delete Subject
              </button>
            </div>

            <div className="glass-panel p-6 bg-[#f8f9ff] border-[#d9e3f7] flex gap-4">
              <AlertCircle size={24} className="text-[#0058be]" />
              <div>
                <p className="text-[13px] font-bold text-[#121c2a]">Availability</p>
                <p className="text-[12px] text-[#727785] leading-relaxed mt-1">
                  Active subjects can be selected by students when they upload documents.
                </p>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}
