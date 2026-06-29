"use client"

import { FileText, Eye, MoreHorizontal, Download, Trash2, Clock, CheckCircle, XCircle, Search, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

const documents = [
  { id: 1, title: "Operating Systems Lecture Notes", subject: "Comp Science", owner: "Nguyen Van A", status: "Approved", size: "2.4 MB", date: "2024-06-05" },
  { id: 2, title: "Machine Learning Midterm Paper", subject: "Artificial Intelligence", owner: "Tran Thi B", status: "Pending", size: "5.1 MB", date: "2024-06-11" },
  { id: 3, title: "Database Normalization Tutorial", subject: "Database Mgmt", owner: "Le Van C", status: "Rejected", size: "1.2 MB", date: "2024-06-09" },
  { id: 4, title: "UX Design Principles", subject: "HCI", owner: "Pham Minh D", status: "Approved", size: "8.7 MB", date: "2024-05-28" },
  { id: 5, title: "Advanced React Patterns", subject: "Web Dev", owner: "Võ Hoàng E", status: "Pending", size: "3.5 MB", date: "2024-06-11" },
]

export default function DocumentsPage() {
  const router = useRouter()

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-on-surface mb-2">Document Management</h1>
          <p className="text-on-surface-variant font-medium">Moderate academic resources and manage the document lifecycle.</p>
        </div>
        <Link 
          href="/documents/upload"
          className="bg-primary hover:bg-secondary text-white px-6 py-2.5 rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all flex items-center gap-2 w-fit"
        >
          <Plus size={18} />
          <span>Upload Document</span>
        </Link>
      </div>

      <div className="glass-panel p-4 rounded-3xl flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[300px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
            <input 
            type="text" 
            placeholder="Search documents by title, owner, or subject..." 
            className="w-full bg-surface-container-low border border-outline/10 rounded-2xl py-2.5 pl-10 pr-4 text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
        </div>
        <div className="flex gap-2">
            {['All', 'Pending', 'Approved', 'Rejected'].map((filter) => (
                <button 
                    key={filter}
                    className={`px-4 py-2 rounded-xl text-[13px] font-medium transition-all ${
                        filter === 'All' ? 'bg-primary text-white' : 'bg-surface hover:bg-surface-container-high text-on-surface-variant'
                    }`}
                >
                    {filter}
                </button>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {documents.map((doc) => (
          <div 
            key={doc.id} 
            onClick={() => router.push(`/documents/${doc.id}`)}
            className="glass-panel p-5 rounded-3xl group border border-outline/5 hover:border-primary/20 transition-all flex flex-col md:flex-row md:items-center gap-6 cursor-pointer"
          >
            <div className="p-4 bg-primary/5 text-primary rounded-2xl self-start md:self-center">
              <FileText size={32} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-on-surface truncate pr-4">{doc.title}</h3>
                <span className={`flex-shrink-0 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider ${
                  doc.status === 'Approved' ? 'bg-green-100 text-green-700' : 
                  doc.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                }`}>
                  {doc.status}
                </span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-on-surface-variant">
                <span className="flex items-center gap-1"><Clock size={14} /> {doc.date}</span>
                <span className="font-medium text-primary">#{doc.subject}</span>
                <span>By <span className="font-semibold text-on-surface">{doc.owner}</span></span>
                <span>{doc.size}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 border-t md:border-t-0 pt-4 md:pt-0">
              {doc.status === 'Pending' ? (
                <>
                  <button className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-xl text-[13px] font-bold hover:bg-green-700 transition-all shadow-md shadow-green-600/20">
                    <CheckCircle size={16} />
                    Approve
                  </button>
                  <button className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-surface text-destructive border border-destructive/20 rounded-xl text-[13px] font-bold hover:bg-destructive hover:text-white transition-all">
                    <XCircle size={16} />
                    Reject
                  </button>
                </>
              ) : (
                <button className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-surface hover:bg-surface-container-high text-on-surface-variant rounded-xl text-[13px] font-bold transition-all border border-outline/10">
                  <Eye size={16} />
                  Preview
                </button>
              )}
              <button className="p-2.5 text-on-surface-variant hover:bg-surface-container-highest rounded-xl transition-all">
                <MoreHorizontal size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
