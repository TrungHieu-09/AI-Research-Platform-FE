"use client"

import * as React from "react"
import {
  Bell, HelpCircle, ChevronDown, FileText, FlaskConical,
  AlertTriangle, ArrowRightLeft, Paperclip, Send, Sparkles, User,
  Layers
} from "lucide-react"

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

export default function AIWorkspacePage() {
  return (
    <div className="flex flex-col h-[calc(100vh-0px)] overflow-hidden bg-[#fafbff]">
      {/* Top Header */}
      <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-[#c2c6d6]/30 bg-[#fafbff]">
        {/* Left: Collection Selector */}
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#c2c6d6]/50 rounded-lg text-[13px] font-bold text-[#424754] hover:bg-gray-50 shadow-sm transition-colors">
          <Layers size={14} className="text-[#727785]" />
          Collection: Quantum Computing Literature
          <ChevronDown size={14} className="text-[#727785] ml-1" />
        </button>

        {/* Right: Actions & User */}
        <div className="flex items-center gap-5">
          <button className="text-[#727785] hover:text-[#121c2a] transition-colors">
            <Bell size={18} />
          </button>
          <button className="text-[#727785] hover:text-[#121c2a] transition-colors">
            <HelpCircle size={18} />
          </button>
          <div className="w-8 h-8 rounded-full bg-[#e6eeff] border border-[#c2c6d6]/40 flex items-center justify-center overflow-hidden">
            {/* Placeholder for Avatar */}
            <User size={16} className="text-[#0058be]" />
          </div>
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
          <div className="flex flex-col gap-6 flex-1 mb-8">
            {/* User Message */}
            <div className="self-end bg-[#eef2fc] rounded-2xl rounded-tr-sm px-5 py-4 max-w-[85%] text-[14px] text-[#121c2a] leading-relaxed shadow-sm">
              Can you synthesize the key findings regarding error correction mechanisms in topological quantum computers from the recent papers in this collection?
            </div>

            {/* AI Message */}
            <div className="self-start bg-white border border-[#c2c6d6]/40 shadow-sm rounded-2xl rounded-tl-sm px-6 py-5 max-w-[95%]">
              <div className="flex items-center gap-2 mb-3 text-[#0058be]">
                <Sparkles size={16} />
                <span className="text-[13px] font-bold">Lumis Synthesis</span>
              </div>
              <div className="text-[14px] text-[#424754] leading-relaxed">
                <p className="mb-4">
                  Based on the selected collection, recent advancements in topological quantum error correction (TQEC) focus primarily on surface codes and their scalability. Here is a synthesis of the key findings:
                </p>
                <ul className="space-y-3 list-disc pl-5">
                  <li>
                    <strong className="text-[#121c2a]">Surface Code Thresholds:</strong> Fowler et al. (2023) demonstrate that the practical fault-tolerance threshold for planar surface codes remains near 1%, but novel decoder architectures can significantly reduce the classical computational overhead <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#0058be] text-white text-[9px] font-bold mx-0.5 relative -top-0.5">1</span>.
                  </li>
                  <li>
                    <strong className="text-[#121c2a]">Majorana Zero Modes:</strong> The implementation of non-Abelian anyons, specifically Majorana zero modes, offers intrinsic topological protection. However, Zhang & Liu (2024) highlight that environmental factors...
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Input Area */}
          <div className="relative mt-auto">
            <div className="bg-white border border-[#c2c6d6]/50 rounded-2xl shadow-sm focus-within:border-[#0058be]/40 focus-within:shadow-[0_0_0_3px_rgba(0,88,190,0.08)] transition-all p-3 flex flex-col">
              <textarea 
                className="w-full bg-transparent border-none outline-none resize-none text-[14px] text-[#121c2a] placeholder:text-[#727785] min-h-[44px] max-h-[120px]"
                placeholder="Ask Lumis to synthesize, analyze, or compare documents..."
                rows={2}
              />
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#c2c6d6]/20">
                <button className="p-2 text-[#727785] hover:text-[#121c2a] hover:bg-gray-100 rounded-lg transition-colors">
                  <Paperclip size={18} />
                </button>
                <button className="flex items-center gap-2 px-5 py-2 bg-[#0058be] hover:bg-[#2170e4] text-white rounded-xl text-[14px] font-semibold transition-all shadow-md shadow-[#0058be]/20">
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
