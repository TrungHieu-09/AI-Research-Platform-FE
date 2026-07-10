"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { BookOpen, CheckCircle, Filter, Plus, Search, Trash2, XCircle } from "lucide-react"

import {
  deleteSubject,
  getSubjectSuggestions,
  getSubjects,
  moderateSubjectSuggestion,
} from "@/features/subjects/api/subjects-api"
import type { Subject, SubjectSuggestion } from "@/features/subjects/types"

function formatStatus(status: Subject["status"]) {
  return status === "ACTIVE" ? "Active" : "Inactive"
}

function formatDate(value?: string) {
  if (!value) return "-"
  return new Intl.DateTimeFormat("vi-VN").format(new Date(value))
}

export default function SubjectsPage() {
  const router = useRouter()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [suggestions, setSuggestions] = useState<SubjectSuggestion[]>([])
  const [search, setSearch] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  const loadSubjects = useCallback(async () => {
    try {
      setIsLoading(true)
      setErrorMessage("")
      const [subjectItems, suggestionItems] = await Promise.all([
        getSubjects(),
        getSubjectSuggestions().catch(() => []),
      ])
      setSubjects(subjectItems)
      setSuggestions(suggestionItems)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Không thể tải subjects.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadSubjects()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [loadSubjects])

  const filteredSubjects = useMemo(() => {
    const keyword = search.toLowerCase()
    return subjects.filter(
      (subject) =>
        subject.name.toLowerCase().includes(keyword) ||
        subject.code.toLowerCase().includes(keyword),
    )
  }, [search, subjects])

  async function handleDeleteSubject(subjectId: string) {
    try {
      await deleteSubject(subjectId)
      await loadSubjects()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Không thể xóa subject.")
    }
  }

  async function handleModerateSuggestion(id: string, action: "APPROVED" | "REJECTED") {
    try {
      await moderateSubjectSuggestion(id, { action })
      await loadSubjects()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Không thể duyệt suggestion.")
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#121c2a] mb-1.5">
            Subject Management
          </h1>
          <p className="text-[#424754] font-medium text-[14px]">
            Manage approved subjects and review student suggestions before they appear in upload forms.
          </p>
        </div>
        <Link
          href="/admin/subjects/new"
          className="bg-[#0058be] hover:bg-[#2170e4] text-white px-6 py-2.5 rounded-2xl font-bold shadow-md shadow-[#0058be]/20 transition-all flex items-center gap-2 w-fit text-[14px]"
        >
          <Plus size={18} />
          <span>New Subject</span>
        </Link>
      </div>

      {errorMessage ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-[14px] font-semibold text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white border border-[#c2c6d6]/40 p-4 rounded-3xl shadow-sm flex flex-wrap gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#727785]" size={18} />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search subjects by name or code..."
                className="w-full bg-[#f8f9ff] border border-[#c2c6d6]/50 rounded-2xl py-2.5 pl-11 pr-4 text-[14px] text-[#121c2a] placeholder:text-[#727785] focus:outline-none focus:border-[#0058be] transition-all"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-[#f8f9ff] border border-[#c2c6d6]/50 rounded-2xl text-[14px] font-bold text-[#424754]">
              <Filter size={18} />
              <span>{filteredSubjects.length} subjects</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isLoading ? (
              <div className="bg-white p-6 rounded-3xl border border-[#c2c6d6]/40 text-[#727785]">
                Loading subjects...
              </div>
            ) : filteredSubjects.length === 0 ? (
              <div className="bg-white p-6 rounded-3xl border border-[#c2c6d6]/40 text-[#727785]">
                No subjects found.
              </div>
            ) : (
              filteredSubjects.map((subject) => (
                <div
                  key={subject.id}
                  onClick={() => router.push(`/admin/subjects/${subject.id}`)}
                  className="bg-white p-6 rounded-3xl border border-[#c2c6d6]/40 hover:border-[#0058be]/40 transition-all shadow-sm hover:shadow-md cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3.5 bg-[#eff4ff] text-[#0058be] rounded-2xl">
                        <BookOpen size={22} />
                      </div>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          void handleDeleteSubject(subject.id)
                        }}
                        className="p-2 text-[#727785] hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <h3 className="font-bold text-[#121c2a] text-lg group-hover:text-[#0058be] transition-colors">
                      {subject.name}
                    </h3>
                    <p className="text-[13px] text-[#727785] mb-5 font-mono">
                      {subject.code}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-[#c2c6d6]/30">
                    <span className="text-[12px] font-bold text-[#424754]">{formatDate(subject.createdAt)}</span>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider ${
                      subject.status === "ACTIVE" ? "bg-green-50 text-green-700 border border-green-200/60" : "bg-gray-100 text-gray-600"
                    }`}>
                      {formatStatus(subject.status)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-[#c2c6d6]/40 shadow-sm">
            <h2 className="text-lg font-bold text-[#121c2a] mb-5 flex items-center gap-2">
              <Plus className="text-[#0058be]" size={20} />
              Pending Suggestions
            </h2>
            <div className="space-y-4">
              {suggestions.length === 0 ? (
                <p className="text-[14px] text-[#727785] text-center py-8">No pending suggestions</p>
              ) : (
                suggestions.map((suggestion) => (
                  <div key={suggestion.id} className="p-4 rounded-2xl bg-[#f8f9ff] border border-[#c2c6d6]/40">
                    <h4 className="font-bold text-[#121c2a] mb-1">{suggestion.name}</h4>
                    <p className="text-[12px] text-[#727785] mb-4">
                      By <span className="font-bold text-[#424754]">{suggestion.proposedBy?.name ?? "Unknown"}</span> • {formatDate(suggestion.createdAt)}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => void handleModerateSuggestion(suggestion.id, "APPROVED")}
                        className="flex items-center justify-center gap-1.5 py-2 bg-green-600 text-white rounded-xl text-[12px] font-bold hover:bg-green-700 transition-all shadow-sm"
                      >
                        <CheckCircle size={14} />
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleModerateSuggestion(suggestion.id, "REJECTED")}
                        className="flex items-center justify-center gap-1.5 py-2 bg-red-50 text-red-600 border border-red-200/60 rounded-xl text-[12px] font-bold hover:bg-red-600 hover:text-white transition-all"
                      >
                        <XCircle size={14} />
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
