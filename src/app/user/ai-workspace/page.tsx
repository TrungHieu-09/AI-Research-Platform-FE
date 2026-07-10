"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import {
  Bell, HelpCircle, ChevronDown, FileText, FlaskConical,
  AlertTriangle, ArrowRightLeft, Paperclip, Send, Sparkles,
  Layers, Share2, X
} from "lucide-react"

const mockDocs = [
  { id: 1, title: "Attention Is All You Need", authors: "Ashish Vaswani, Noam Shazeer, Niki Parmar" },
  { id: 2, title: "Language Models are Few-Shot Learners", authors: "Tom B. Brown, Benjamin Mann, Nick Ryder" },
  { id: 3, title: "Deep Residual Learning for Image Recognition", authors: "Kaiming He, Xiangyu Zhang, Shaoqing Ren" },
  { id: 4, title: "BERT: Pre-training of Deep Bidirectional Transformers", authors: "Jacob Devlin, Ming-Wei Chang, Kenton Lee" },
  { id: 5, title: "Generative Adversarial Nets", authors: "Ian Goodfellow, Jean Pouget-Abadie, Mehdi Mirza" },
]

const sourceReferences = [
  {
    id: 1,
    citationNumber: 1,
    author: "Fowler et al. (2023)",
    title: "High-threshold surface codes and fast classical decoding algorithms",
    excerpt: "We present a detailed analysis of planar surface code thresholds, confirming a practical limit near 1%...",
    tags: ["p. 42", "Methodology"]
  },
  {
    id: 2,
    citationNumber: 2,
    author: "Zhang & Liu (2024)",
    title: "Decoherence constraints in Majorana-based topological qubits",
    excerpt: "While non-Abelian statistics offer inherent protection, our simulations indicate that dynamic environmental...",
    tags: ["p. 15", "Results"]
  },
  {
    id: 3,
    citationNumber: 3,
    author: "Chen (2023)",
    title: "Neural network decoders for scalable topological error...",
    excerpt: "By utilizing a convolutional neural network architecture, we achieve a decoding speedup of 40% over...",
    tags: ["p. 8", "Abstract"]
  }
]

function WorkspaceContent() {
  const searchParams = useSearchParams()
  const docId = searchParams.get("docId")
  const attachedDoc = docId ? mockDocs.find(d => d.id === Number(docId)) : null

  const [input, setInput] = React.useState("")
  const [messages, setMessages] = React.useState<{role: string, content: string}[]>([])
  const [isTyping, setIsTyping] = React.useState(false)
  const [isDocAttached, setIsDocAttached] = React.useState(!!attachedDoc)

  const handleSend = () => {
    if (!input.trim()) return
    const userMsg = input
    setMessages(prev => [...prev, { role: "user", content: userMsg }])
    setInput("")
    setIsTyping(true)

    setTimeout(() => {
      setIsTyping(false)
      setMessages(prev => [...prev, { 
        role: "ai", 
        content: (isDocAttached && attachedDoc)
          ? `Based on the document "${attachedDoc.title}", here is an analysis...\n\n(This is a mock response demonstrating the flow.)` 
          : `Here is an analysis based on the entire collection...\n\n(This is a mock response demonstrating the flow without a specific document.)`
      }])
    }, 1500)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-[#fafbff]">
      {/* Sub-toolbar: Collection selector + actions */}
      <div className="shrink-0 flex items-center justify-between px-6 py-3 border-b border-[#c2c6d6]/30 bg-[#fafbff]">
        {/* Left: Collection Selector */}
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#c2c6d6]/50 rounded-lg text-[13px] font-bold text-[#424754] hover:bg-gray-50 shadow-sm transition-colors">
          <Layers size={14} className="text-[#727785]" />
          Collection: Quantum Computing Literature
          <ChevronDown size={14} className="text-[#727785] ml-1" />
        </button>

        {/* Right: Quick actions */}
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-xl text-[#727785] hover:text-[#121c2a] hover:bg-white hover:shadow-sm transition-all">
            <Bell size={17} />
          </button>
          <button className="p-2 rounded-xl text-[#727785] hover:text-[#121c2a] hover:bg-white hover:shadow-sm transition-all">
            <HelpCircle size={17} />
          </button>
        </div>
      </div>


      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex">
        
        {/* Left Column: Chat Workspace */}
        <div className="flex-1 flex flex-col px-6 md:px-12 pt-8 pb-6 overflow-y-auto max-w-[800px] mx-auto">
          
          {/* Action Buttons */}
          <div className="grid grid-cols-4 gap-4 mb-10">
            <button className="flex flex-col items-center justify-center gap-2 text-center p-3 rounded-2xl hover:bg-white border border-transparent hover:border-[#c2c6d6]/40 hover:shadow-sm transition-all group">
              <FileText size={22} className="text-[#0058be] group-hover:scale-110 transition-transform" strokeWidth={1.5} />
              <span className="text-[12px] font-bold text-[#424754] leading-tight">Summarize<br/>Collection</span>
            </button>
            <button className="flex flex-col items-center justify-center gap-2 text-center p-3 rounded-2xl hover:bg-white border border-transparent hover:border-[#c2c6d6]/40 hover:shadow-sm transition-all group">
              <FlaskConical size={22} className="text-[#0058be] group-hover:scale-110 transition-transform" strokeWidth={1.5} />
              <span className="text-[12px] font-bold text-[#424754] leading-tight">Explain<br/>Methodology</span>
            </button>
            <button className="flex flex-col items-center justify-center gap-2 text-center p-3 rounded-2xl hover:bg-white border border-transparent hover:border-[#c2c6d6]/40 hover:shadow-sm transition-all group">
              <AlertTriangle size={22} className="text-[#d93025] group-hover:scale-110 transition-transform" strokeWidth={1.5} />
              <span className="text-[12px] font-bold text-[#424754] leading-tight">Find<br/>Limitations</span>
            </button>
            <button className="flex flex-col items-center justify-center gap-2 text-center p-3 rounded-2xl hover:bg-white border border-transparent hover:border-[#c2c6d6]/40 hover:shadow-sm transition-all group">
              <ArrowRightLeft size={22} className="text-[#a16207] group-hover:scale-110 transition-transform" strokeWidth={1.5} />
              <span className="text-[12px] font-bold text-[#424754] leading-tight">Compare<br/>Papers</span>
            </button>
          </div>

          {/* Chat History */}
          <div className="flex flex-col gap-6 flex-1 mb-8 overflow-y-auto">
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-full text-[#727785] text-[14px]">
                {(isDocAttached && attachedDoc) ? `Ask something about "${attachedDoc.title}"...` : "Start a new conversation..."}
              </div>
            )}
            
            {messages.map((msg, idx) => (
              msg.role === "user" ? (
                <div key={idx} className="self-end bg-[#eef2fc] rounded-2xl rounded-tr-sm px-5 py-4 max-w-[85%] text-[14px] text-[#121c2a] leading-relaxed shadow-sm">
                  {msg.content}
                </div>
              ) : (
                <div key={idx} className="self-start bg-white border border-[#c2c6d6]/40 shadow-sm rounded-2xl rounded-tl-sm px-6 py-5 max-w-[95%]">
                  <div className="flex items-center gap-2 mb-3 text-[#0058be]">
                    <Sparkles size={16} />
                    <span className="text-[13px] font-bold">Lumis Synthesis</span>
                  </div>
                  <div className="text-[14px] text-[#424754] leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </div>
                </div>
              )
            ))}

            {isTyping && (
              <div className="self-start bg-white border border-[#c2c6d6]/40 shadow-sm rounded-2xl rounded-tl-sm px-6 py-5 max-w-[95%]">
                <div className="flex items-center gap-2 text-[#0058be]">
                  <Sparkles size={16} className="animate-pulse" />
                  <span className="text-[13px] font-bold animate-pulse">Lumis is thinking...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="relative mt-auto flex flex-col gap-3">
            {/* Attached File Indicator */}
            {(isDocAttached && attachedDoc) && (
              <div className="flex items-center gap-2 self-start bg-white border border-[#0058be]/30 px-3 py-1.5 rounded-lg shadow-sm">
                <FileText size={14} className="text-[#0058be]" />
                <span className="text-[12px] font-semibold text-[#121c2a] truncate max-w-[300px]">{attachedDoc.title}</span>
                <button onClick={() => setIsDocAttached(false)} className="text-[#727785] hover:text-red-500 ml-1"><X size={12} /></button>
              </div>
            )}

            <div className="bg-white border border-[#c2c6d6]/50 rounded-2xl shadow-sm focus-within:border-[#0058be]/40 focus-within:shadow-[0_0_0_3px_rgba(0,88,190,0.08)] transition-all p-3 flex flex-col">
              <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                className="w-full bg-transparent border-none outline-none resize-none text-[14px] text-[#121c2a] placeholder:text-[#727785] min-h-[44px] max-h-[120px]"
                placeholder={(isDocAttached && attachedDoc) ? `Ask Lumis to analyze ${attachedDoc.title}...` : "Ask Lumis to synthesize, analyze, or compare documents..."}
                rows={2}
              />
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#c2c6d6]/20">
                <div className="flex items-center gap-1">
                  <button className="p-2 text-[#727785] hover:text-[#121c2a] hover:bg-gray-100 rounded-lg transition-colors" title="Attach file">
                    <Paperclip size={17} />
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-[#727785] hover:text-[#0058be] hover:bg-[#eff4ff] rounded-lg transition-colors text-[12px] font-semibold" title="Share this session">
                    <Share2 size={14} />
                    Share session
                  </button>
                </div>
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="flex items-center gap-2 px-5 py-2 bg-[#0058be] disabled:opacity-50 hover:bg-[#2170e4] text-white rounded-xl text-[14px] font-semibold transition-all shadow-md shadow-[#0058be]/20"
                >
                  <Send size={16} />
                  Send
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Source References */}
        <div className="w-[380px] shrink-0 border-l border-[#c2c6d6]/30 bg-[#fafbff] flex flex-col overflow-hidden">
          <div className="px-6 py-5 border-b border-[#c2c6d6]/30">
            <h2 className="text-[18px] font-bold text-[#121c2a]" style={{ fontFamily: "Geist, sans-serif" }}>
              Source References
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
            {sourceReferences.map((ref) => (
              <div key={ref.id} className="bg-white border border-[#c2c6d6]/40 rounded-xl overflow-hidden shadow-sm flex flex-col">
                {/* Thick Blue Left Border effect */}
                <div className="flex border-l-[4px] border-[#0058be] flex-col p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-[4px] bg-[#0058be] text-white text-[10px] font-bold">
                      {ref.citationNumber}
                    </span>
                    <span className="text-[11px] font-semibold text-[#727785]">{ref.author}</span>
                  </div>
                  <h3 className="text-[13px] font-bold text-[#121c2a] leading-snug mb-1.5">
                    {ref.title}
                  </h3>
                  <p className="text-[12px] text-[#424754] leading-relaxed mb-3 line-clamp-2">
                    {ref.excerpt}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {ref.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 bg-[#f0f2f5] text-[#424754] rounded-[4px] text-[10px] font-semibold">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

export default function AIWorkspacePage() {
  return (
    <React.Suspense fallback={<div className="p-10 text-center text-[#727785]">Loading workspace...</div>}>
      <WorkspaceContent />
    </React.Suspense>
  )
}
