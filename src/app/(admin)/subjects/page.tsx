"use client"

import { BookOpen, Plus, Search, Filter, Trash2, CheckCircle, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

const subjects = [
  { id: 1, name: "Web Development", code: "WEB401", count: 145, status: "Active" },
  { id: 2, name: "Artificial Intelligence", code: "AI302", count: 89, status: "Active" },
  { id: 3, name: "Database Management", code: "DBM201", count: 210, status: "Active" },
  { id: 4, name: "Software Testing", code: "SWT401", count: 67, status: "Inactive" },
  { id: 5, name: "Human Computer Interaction", code: "HCI301", count: 112, status: "Active" },
]

const suggestions = [
  { id: 1, name: "Microservices Architecture", proposedBy: "Le Van C", date: "2024-06-10" },
  { id: 2, name: "Blockchain Fundamentals", proposedBy: "Nguyen Van A", date: "2024-06-11" },
]

export default function SubjectsPage() {
  const router = useRouter()

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-on-surface mb-2">Subject Management</h1>
          <p className="text-on-surface-variant font-medium">Organize academic subjects and review community-proposed documentation tags.</p>
        </div>
        <Link 
          href="/subjects/new"
          className="bg-primary hover:bg-secondary text-white px-6 py-2.5 rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all flex items-center gap-2 w-fit"
        >
          <Plus size={18} />
          <span>New Subject</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main List */}
        <div className="xl:col-span-2 space-y-6">
          <div className="glass-panel p-4 rounded-3xl flex flex-wrap gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
              <input 
                type="text" 
                placeholder="Search subjects..." 
                className="w-full bg-surface-container-low border border-outline/10 rounded-2xl py-2.5 pl-10 pr-4 text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-outline/10 rounded-2xl text-[14px] hover:bg-surface-container-high transition-all">
              <Filter size={18} />
              <span>Filter</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subjects.map((subject) => (
              <div 
                key={subject.id} 
                onClick={() => router.push(`/subjects/${subject.id}`)}
                className="glass-panel p-6 rounded-3xl group border border-outline/5 hover:border-primary/20 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                    <BookOpen size={20} />
                  </div>
                  <button className="p-2 text-on-surface-variant hover:text-destructive opacity-0 group-hover:opacity-100 transition-all">
                    <Trash2 size={18} />
                  </button>
                </div>
                <h3 className="font-bold text-on-surface text-lg">{subject.name}</h3>
                <p className="text-[14px] text-on-surface-variant mb-4 font-mono">{subject.code}</p>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-outline/5">
                  <span className="text-[12px] font-medium text-on-surface-variant">{subject.count} Documents</span>
                  <span className={`text-[12px] font-bold px-2 py-0.5 rounded-md ${
                    subject.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-surface-variant text-on-surface-variant'
                  }`}>
                    {subject.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Suggestions Sidebar */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl bg-secondary/5 border-secondary/10">
            <h2 className="text-xl font-semibold text-on-surface mb-6 flex items-center gap-2">
              <Plus className="text-secondary" size={20} />
              Pending Suggestions
            </h2>
            <div className="space-y-4">
              {suggestions.map((sug) => (
                <div key={sug.id} className="p-4 rounded-2xl bg-surface border border-outline/5 shadow-sm">
                  <h4 className="font-bold text-on-surface mb-1">{sug.name}</h4>
                  <p className="text-[12px] text-on-surface-variant mb-4">
                    By <span className="font-semibold">{sug.proposedBy}</span> • {sug.date}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="flex items-center justify-center gap-1.5 py-2 bg-green-50 text-green-700 rounded-xl text-[12px] font-bold hover:bg-green-100 transition-all">
                      <CheckCircle size={14} />
                      Approve
                    </button>
                    <button className="flex items-center justify-center gap-1.5 py-2 bg-red-50 text-red-700 rounded-xl text-[12px] font-bold hover:bg-red-100 transition-all">
                      <XCircle size={14} />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
              {suggestions.length === 0 && (
                <p className="text-[14px] text-on-surface-variant text-center py-8">No pending suggestions</p>
              )}
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl bg-primary/5 border-primary/10">
            <h3 className="font-bold text-on-surface mb-2">Did you know?</h3>
            <p className="text-[13px] text-on-surface-variant leading-relaxed">
              Consolidating duplicate subjects helps AI provide better cross-document context in the Chatbot.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
