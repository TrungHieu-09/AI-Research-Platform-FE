import { FileUp, Shield, Upload, ChevronLeft, Info, FileText, CheckCircle2 } from "lucide-react"
import Link from "next/link"

export default function UploadDocumentPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/documents" className="p-2 hover:bg-surface-container-highest rounded-full transition-colors">
            <ChevronLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">Upload Document</h1>
            <p className="text-on-surface-variant font-medium">Add academic materials directly to the platform storage.</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl">
        <div className="glass-panel p-10 space-y-8 bg-white border border-outline-variant shadow-xl shadow-primary/5">
          {/* Dropzone Area */}
          <div className="border-4 border-dashed border-primary/10 rounded-3xl p-16 flex flex-col items-center justify-center text-center space-y-4 hover:border-primary/30 hover:bg-primary/[0.01] transition-all cursor-pointer group">
            <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
              <Upload size={32} />
            </div>
            <div>
              <p className="text-xl font-bold text-on-surface">Drag and drop your files here</p>
              <p className="text-on-surface-variant">Supports PDF, DOCX, and PPTX up to 50MB.</p>
            </div>
            <button className="bg-primary text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-secondary transition-all">
              Choose Files
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
             <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-[14px] font-bold text-on-surface">Document Title</label>
                    <input 
                    type="text" 
                    placeholder="e.g. Week 1 Lecture Notes" 
                    className="w-full bg-surface-container-low border border-outline-variant rounded-2xl py-3.5 px-4 text-[14px] focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[14px] font-bold text-on-surface">Associate with Subject</label>
                    <select className="w-full bg-surface-container-low border border-outline-variant rounded-2xl py-3.5 px-4 text-[14px] focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all appearance-none cursor-pointer">
                        <option>Select a subject...</option>
                        <option>Web Development</option>
                        <option>Artificial Intelligence</option>
                        <option>Database Management</option>
                    </select>
                </div>
             </div>
             <div className="space-y-4">
                <div className="p-6 bg-surface-container-low rounded-2xl border border-outline-variant space-y-4">
                    <h4 className="text-[14px] font-bold text-on-surface flex items-center gap-2">
                        <Shield size={16} className="text-primary" />
                        Admin Privileges
                    </h4>
                    <div className="space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input type="checkbox" className="w-5 h-5 rounded-lg accent-primary" defaultChecked />
                            <span className="text-[14px] text-on-surface-variant group-hover:text-on-surface transition-colors">Auto-approve this document</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input type="checkbox" className="w-5 h-5 rounded-lg accent-primary" />
                            <span className="text-[14px] text-on-surface-variant group-hover:text-on-surface transition-colors">Notify relevant students</span>
                        </label>
                    </div>
                </div>
             </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-outline-variant">
            <button className="flex-[2] bg-primary hover:bg-secondary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2">
              <FileUp size={18} />
              <span>Upload and Save</span>
            </button>
            <Link href="/documents" className="flex-1 bg-surface-container-highest hover:bg-outline-variant text-on-surface py-4 rounded-2xl font-bold text-center transition-all">
              Cancel
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
