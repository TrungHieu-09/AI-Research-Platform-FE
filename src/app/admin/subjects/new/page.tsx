"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { BookOpen, Save, ChevronLeft, Layout, FileText, Settings, Sparkles, Target, Hash } from "lucide-react"
import Link from "next/link"
import { createSubject } from "@/features/subjects/api/subjects-api"

export default function NewSubjectPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      setIsSubmitting(true)
      setErrorMessage("")
      await createSubject({ name, code })
      router.push("/admin/subjects")
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Không thể tạo subject.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center py-12 px-4 animate-in fade-in zoom-in-95 duration-700">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-5 gap-0 rounded-[32px] overflow-hidden border border-outline-variant shadow-2xl shadow-primary/5 bg-white">
        
        {/* Left Informational Sidebar */}
        <div className="lg:col-span-2 bg-surface-container-low p-10 flex flex-col justify-between border-r border-outline-variant">
          <div className="space-y-8">
            <Link href="/admin/subjects" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary font-bold transition-colors group">
              <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span>Back to Subjects</span>
            </Link>
            
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 mb-6">
                <BookOpen size={30} />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-on-surface leading-tight">Create a New Subject</h1>
              <p className="text-on-surface-variant font-medium leading-relaxed">
                Define a new academic course structure. This will act as a primary category for students to organize and search for relevant documents.
              </p>
            </div>

            <div className="space-y-6 pt-4">
               {[
                 { icon: Hash, title: "Standardized Codes", text: "Use official university curriculum codes." },
                 { icon: Target, title: "Clear Taxonomy", text: "Help our AI better group relevant documents." }
               ].map((tip, i) => (
                 <div key={i} className="flex gap-4">
                    <div className="p-2 bg-white rounded-xl text-primary border border-outline-variant h-fit">
                      <tip.icon size={18} />
                    </div>
                    <div>
                      <p className="text-[14px] font-bold text-on-surface">{tip.title}</p>
                      <p className="text-[12px] text-on-surface-variant">{tip.text}</p>
                    </div>
                 </div>
               ))}
            </div>
          </div>

          <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 mt-8">
            <div className="flex items-center gap-2 text-primary font-bold text-[13px] mb-1">
              <Sparkles size={14} />
              <span>AI Enhanced</span>
            </div>
            <p className="text-[12px] text-on-surface-variant">Creating a subject automatically prepares the AI model for ground-truth synthesis in this domain.</p>
          </div>
        </div>

        {/* Right Form Area */}
        <div className="lg:col-span-3 p-12 bg-white">
          <form className="space-y-8" onSubmit={handleSubmit}>
            {errorMessage ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-semibold text-red-700">
                {errorMessage}
              </div>
            ) : null}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-on-surface-variant uppercase tracking-widest px-1">Basic Details</label>
                <div className="space-y-4">
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">
                      <Layout size={20} />
                    </div>
                    <input 
                      type="text" 
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Subject Name (e.g. Distributed Systems)" 
                      required
                      className="w-full bg-surface-container-low/50 border border-outline-variant rounded-2xl py-4 pl-12 pr-4 text-[15px] focus:outline-none focus:ring-4 focus:ring-primary/5 focus:bg-white transition-all font-bold"
                    />
                  </div>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">
                      <Settings size={20} />
                    </div>
                    <input 
                      type="text" 
                      value={code}
                      onChange={(event) => setCode(event.target.value)}
                      placeholder="Course Code (e.g. PRN231)" 
                      required
                      className="w-full bg-surface-container-low/50 border border-outline-variant rounded-2xl py-4 pl-12 pr-4 text-[15px] focus:outline-none focus:ring-4 focus:ring-primary/5 focus:bg-white transition-all font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[13px] font-bold text-on-surface-variant uppercase tracking-widest px-1">Context & Description</label>
                <div className="relative group">
                   <div className="absolute left-4 top-4 text-on-surface-variant group-focus-within:text-primary transition-colors">
                      <FileText size={20} />
                    </div>
                    <textarea 
                      placeholder="What is this course about? Outline key concepts..." 
                      className="w-full h-48 bg-surface-container-low/50 border border-outline-variant rounded-2xl p-4 pl-12 text-[15px] focus:outline-none focus:ring-4 focus:ring-primary/5 focus:bg-white transition-all resize-none font-medium leading-relaxed"
                    />
                </div>
              </div>

              <div className="flex items-center gap-2 px-1">
                 <input type="checkbox" className="w-5 h-5 rounded-lg accent-primary cursor-pointer" id="active" defaultChecked />
                 <label htmlFor="active" className="text-[14px] font-bold text-on-surface cursor-pointer">Activate subject immediately</label>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-outline-variant">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-[2] bg-primary hover:bg-secondary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Save size={18} />
                <span>{isSubmitting ? "Saving..." : "Save New Subject"}</span>
              </button>
              <Link href="/admin/subjects" className="flex-1 bg-surface-container-highest hover:bg-outline-variant text-on-surface py-4 rounded-2xl font-bold text-center transition-all">
                Discard
              </Link>
            </div>
          </form>
        </div>

      </div>
    </div>
  )
}
