import { BookOpen, ChevronLeft, Plus, Save, Trash2, Search, FileText, User, Calendar, CheckCircle2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function SubjectDetailPage({ params }: { params: { id: string } }) {
  // Mock subject data
  const subject = {
    id: params.id,
    name: "Web Development",
    code: "WEB401",
    description: "Focuses on modern web technologies including React, Next.js, and backend integration. Students learn to build scalable and responsive applications.",
    status: "Active",
    createdAt: "2023-09-01",
    totalDocuments: 145,
    documents: [
      { id: 101, title: "React Lifecycle Hooks", owner: "Nguyen Van A", date: "2024-05-20" },
      { id: 102, title: "Tailwind CSS Guide", owner: "Tran Thi B", date: "2024-05-25" },
    ]
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link href="/subjects" className="p-2 hover:bg-surface-container-highest rounded-full transition-colors">
            <ChevronLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">Subject Details</h1>
            <p className="text-on-surface-variant font-medium">Manage course metadata and associated academic resources.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-2.5 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-secondary transition-all">
            <Save size={18} />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-panel p-8 space-y-6">
            <h3 className="text-xl font-bold text-on-surface">General Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[14px] font-bold text-on-surface">Subject Name</label>
                <input 
                  type="text" 
                  defaultValue={subject.name}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-2xl px-4 py-3 text-[14px] focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[14px] font-bold text-on-surface">Subject Code</label>
                <input 
                  type="text" 
                  defaultValue={subject.code}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-2xl px-4 py-3 text-[14px] focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[14px] font-bold text-on-surface">Description</label>
              <textarea 
                defaultValue={subject.description}
                className="w-full h-32 bg-surface-container-low border border-outline-variant rounded-2xl p-4 text-[14px] focus:ring-2 focus:ring-primary/20 outline-none resize-none"
              />
            </div>
          </div>

          <div className="glass-panel p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-on-surface">Related Documents</h3>
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[12px] font-bold">
                {subject.totalDocuments} total
              </span>
            </div>
            <div className="space-y-4">
              {subject.documents.map(doc => (
                <div key={doc.id} className="flex items-center justify-between p-4 bg-surface-container-low border border-outline-variant rounded-2xl hover:border-primary/30 transition-all cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-white text-primary rounded-xl">
                      <FileText size={20} />
                    </div>
                    <div>
                      <p className="text-[14px] font-bold text-on-surface group-hover:text-primary transition-colors">{doc.title}</p>
                      <p className="text-[12px] text-on-surface-variant">By {doc.owner} • {doc.date}</p>
                    </div>
                  </div>
                  <ChevronLeft className="rotate-180 text-on-surface-variant" size={18} />
                </div>
              ))}
            </div>
            <button className="w-full py-3 bg-surface border border-outline-variant rounded-2xl text-[14px] font-bold text-on-surface-variant hover:bg-surface-container-highest transition-all">
              View All Documents
            </button>
          </div>
        </div>

        <div className="space-y-8">
          <div className="glass-panel p-8 space-y-6">
            <h3 className="text-xl font-bold text-on-surface">Status & Visibility</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-2xl">
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={20} className="text-green-600" />
                  <span className="text-[14px] font-bold text-green-800">Active</span>
                </div>
                <div className="w-10 h-5 bg-green-600 rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                </div>
              </div>
              <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant space-y-2">
                <div className="flex items-center gap-2 text-[13px] font-bold text-on-surface">
                  <Calendar size={16} className="text-on-surface-variant" />
                  Created On
                </div>
                <p className="text-[14px] font-bold text-on-surface">{subject.createdAt}</p>
              </div>
            </div>
            <div className="pt-6 border-t border-outline-variant">
              <button className="w-full flex items-center justify-center gap-2 py-3 text-red-600 font-bold hover:bg-red-50 rounded-2xl transition-all">
                <Trash2 size={18} />
                Delete Subject
              </button>
            </div>
          </div>

          <div className="glass-panel p-6 bg-amber-50 border-amber-100 flex gap-4">
            <AlertCircle size={24} className="text-amber-600" />
            <div>
              <p className="text-[13px] font-bold text-amber-800">Subject Deletion</p>
              <p className="text-[12px] text-amber-700 leading-relaxed mt-1">
                Deleting a subject will re-categorize all {subject.totalDocuments} documents as "Uncategorized".
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
