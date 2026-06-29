import { FileText, Eye, Clock, CheckCircle, XCircle, ChevronLeft, Download, Share2, MoreVertical, BookOpen, User, Info } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function DocumentDetailPage({ params }: { params: { id: string } }) {
  // Mock document data
  const doc = {
    id: params.id,
    title: "Operating Systems Lecture Notes",
    subject: "Comp Science",
    subjectCode: "CS301",
    owner: "Nguyen Van A",
    status: "Pending",
    size: "2.4 MB",
    date: "2024-06-05",
    pages: 42,
    description: "A comprehensive set of lecture notes covering process management, memory allocation, and file systems. Includes diagrams and exercise solutions.",
    tags: ["OS", "Kernel", "Notes", "FPTU"],
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link href="/documents" className="p-2 hover:bg-surface-container-highest rounded-full transition-colors">
            <ChevronLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">Review Document</h1>
            <p className="text-on-surface-variant font-medium">Moderate and verify the quality of academic resources.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-2xl font-bold shadow-lg shadow-green-600/20 hover:bg-green-700 transition-all">
            <CheckCircle size={18} />
            <span>Approve</span>
          </button>
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-surface border border-red-200 text-red-600 rounded-2xl font-bold hover:bg-red-50 transition-all">
            <XCircle size={18} />
            <span>Reject</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Preview Area */}
        <div className="lg:col-span-3 space-y-6">
          <div className="glass-panel min-h-[800px] flex flex-col items-center justify-start p-10 bg-surface-container-low border-dashed border-2 border-outline-variant relative overflow-hidden">
             {/* Simulated PDF Header */}
             <div className="w-full h-12 bg-surface-container-highest rounded-t-xl border border-outline-variant flex items-center px-4 justify-between">
                <div className="flex items-center gap-4">
                    <span className="text-[12px] font-bold text-on-surface-variant">Page 1 / {doc.pages}</span>
                    <div className="h-4 w-[1px] bg-outline-variant" />
                    <div className="flex items-center gap-2">
                        <button className="p-1 hover:bg-surface-container-high rounded">-</button>
                        <span className="text-[12px] font-bold">100%</span>
                        <button className="p-1 hover:bg-surface-container-high rounded">+</button>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-1.5 hover:bg-surface-container-high rounded">
                        <Download size={14} />
                    </button>
                    <button className="p-1.5 hover:bg-surface-container-high rounded">
                        <Share2 size={14} />
                    </button>
                </div>
             </div>

             {/* Simulated Page Content */}
             <div className="w-full max-w-[600px] bg-white shadow-2xl mt-12 p-16 space-y-8 aspect-[1/1.414]">
                <div className="space-y-4">
                    <div className="h-8 w-3/4 bg-surface-container-highest rounded-md" />
                    <div className="h-4 w-1/2 bg-surface-container-low rounded-md" />
                </div>
                <div className="space-y-4 pt-8">
                    <div className="h-3 w-full bg-surface-container-low rounded-sm" />
                    <div className="h-3 w-full bg-surface-container-low rounded-sm" />
                    <div className="h-3 w-5/6 bg-surface-container-low rounded-sm" />
                    <div className="h-3 w-full bg-surface-container-low rounded-sm" />
                </div>
                <div className="grid grid-cols-2 gap-8 pt-8">
                    <div className="h-32 bg-surface-container-low rounded-xl" />
                    <div className="h-32 bg-surface-container-low rounded-xl" />
                </div>
                <div className="space-y-4 pt-8">
                    <div className="h-3 w-full bg-surface-container-low rounded-sm" />
                    <div className="h-3 w-full bg-surface-container-low rounded-sm" />
                    <div className="h-3 w-4/6 bg-surface-container-low rounded-sm" />
                </div>
             </div>

             <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low via-transparent to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Sidebar Info Area */}
        <div className="space-y-6">
          <div className="glass-panel p-6 space-y-6">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 text-primary rounded-xl">
                    <Info size={18} />
                </div>
                <h3 className="font-bold text-on-surface">Document Info</h3>
            </div>
            
            <div className="space-y-4">
                <div>
                    <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Title</p>
                    <p className="text-[14px] font-bold text-on-surface">{doc.title}</p>
                </div>
                <div>
                    <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Subject</p>
                    <div className="flex items-center gap-2">
                        <BookOpen size={14} className="text-primary" />
                        <p className="text-[14px] font-bold text-on-surface">{doc.subject} ({doc.subjectCode})</p>
                    </div>
                </div>
                <div>
                    <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Uploaded By</p>
                    <div className="flex items-center gap-2">
                        <User size={14} className="text-secondary" />
                        <p className="text-[14px] font-bold text-on-surface">{doc.owner}</p>
                    </div>
                </div>
                <div>
                    <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Size & Pages</p>
                    <p className="text-[14px] font-bold text-on-surface">{doc.size} • {doc.pages} Pages</p>
                </div>
            </div>

            <div className="pt-6 border-t border-outline-variant">
                <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-3">Tags</p>
                <div className="flex flex-wrap gap-2">
                    {doc.tags.map(tag => (
                        <span key={tag} className="px-2.5 py-1 bg-surface-container-highest text-on-surface-variant rounded-lg text-[12px] font-bold">
                            #{tag}
                        </span>
                    ))}
                </div>
            </div>
          </div>

          <div className="glass-panel p-6 bg-primary/5 border-primary/10">
            <h4 className="font-bold text-on-surface mb-2">Moderator Note</h4>
            <p className="text-[13px] text-on-surface-variant leading-relaxed mb-4">
                Please ensure this document does not contain sensitive personal information or copyrighted exam papers before approving.
            </p>
            <textarea 
                placeholder="Add a review comment..." 
                className="w-full h-24 bg-white border border-outline-variant rounded-xl p-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
