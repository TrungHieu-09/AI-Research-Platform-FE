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
          <h1
            className="text-3xl font-bold tracking-tight text-[#121c2a] mb-1.5"
            style={{ fontFamily: "Geist, sans-serif" }}
          >
            Document Management
          </h1>
          <p className="text-[#424754] font-medium text-[14px]">
            Moderate academic resources and manage the document lifecycle across all collections.
          </p>
        </div>
        <Link 
          href="/admin/documents/upload"
          className="bg-[#0058be] hover:bg-[#2170e4] text-white px-6 py-2.5 rounded-2xl font-bold shadow-md shadow-[#0058be]/20 transition-all flex items-center gap-2 w-fit text-[14px]"
        >
          <Plus size={18} />
          <span>Upload Document</span>
        </Link>
      </div>


      {/* Filter & Search Bar */}
      <div className="bg-white border border-[#c2c6d6]/40 p-4 rounded-3xl shadow-sm flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[280px] relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#727785]" size={18} />
          <input 
            type="text" 
            placeholder="Search documents by title, owner, or subject..." 
            className="w-full bg-[#f8f9ff] border border-[#c2c6d6]/50 rounded-2xl py-2.5 pl-11 pr-4 text-[14px] text-[#121c2a] placeholder:text-[#727785] focus:outline-none focus:border-[#0058be] transition-all"
          />
        </div>
        <div className="flex gap-1.5">
          {['All', 'Pending', 'Approved', 'Rejected'].map((filter) => (
            <button 
              key={filter}
              className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-all ${
                filter === 'All'
                  ? 'bg-[#0058be] text-white shadow-sm'
                  : 'bg-[#f8f9ff] hover:bg-[#eff4ff] text-[#424754]'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Document List */}
      <div className="grid grid-cols-1 gap-4">
        {documents.map((doc) => (
          <div 
            key={doc.id} 
            onClick={() => router.push(`/admin/documents/${doc.id}`)}
            className="bg-white p-5 rounded-3xl border border-[#c2c6d6]/40 hover:border-[#0058be]/40 transition-all shadow-sm hover:shadow-md flex flex-col md:flex-row md:items-center gap-6 cursor-pointer group"
          >
            <div className="p-4 bg-[#eff4ff] text-[#0058be] rounded-2xl self-start md:self-center shrink-0">
              <FileText size={28} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 mb-1.5">
                <h3 className="font-bold text-[#121c2a] text-[15px] truncate pr-2 group-hover:text-[#0058be] transition-colors">
                  {doc.title}
                </h3>
                <span className={`shrink-0 text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider border ${
                  doc.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200/60' : 
                  doc.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200/60' : 'bg-red-50 text-red-700 border-red-200/60'
                }`}>
                  {doc.status}
                </span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-[#727785]">
                <span className="flex items-center gap-1"><Clock size={14} /> {doc.date}</span>
                <span className="font-bold text-[#0058be]">#{doc.subject}</span>
                <span>By <span className="font-bold text-[#121c2a]">{doc.owner}</span></span>
                <span>{doc.size}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 border-t border-[#c2c6d6]/30 md:border-t-0 pt-4 md:pt-0 shrink-0">
              {doc.status === 'Pending' ? (
                <>
                  <button className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-xl text-[13px] font-bold hover:bg-green-700 transition-all shadow-sm">
                    <CheckCircle size={16} />
                    Approve
                  </button>
                  <button className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 border border-red-200/60 rounded-xl text-[13px] font-bold hover:bg-red-600 hover:text-white transition-all">
                    <XCircle size={16} />
                    Reject
                  </button>
                </>
              ) : (
                <button className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-[#f8f9ff] hover:bg-[#eff4ff] text-[#424754] hover:text-[#0058be] rounded-xl text-[13px] font-bold transition-all border border-[#c2c6d6]/40">
                  <Eye size={16} />
                  Preview
                </button>
              )}
              <button className="p-2.5 text-[#727785] hover:text-[#121c2a] hover:bg-[#f8f9ff] rounded-xl transition-all">
                <MoreHorizontal size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

