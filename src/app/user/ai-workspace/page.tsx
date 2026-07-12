"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import {
  Bell, HelpCircle, ChevronDown, FileText, FlaskConical,
  AlertTriangle, ArrowRightLeft, Paperclip, Send, Sparkles,
  Layers, Share2, X
} from "lucide-react"
import { motion, AnimatePresence, Variants } from "framer-motion"
import { useAuth } from "@/features/auth/auth-context"

/* ─── Data ───────────────────────────────────── */
const mockDocs = [
  { id: 1, title: "Attention Is All You Need", authors: "Ashish Vaswani, Noam Shazeer, Niki Parmar" },
  { id: 2, title: "Language Models are Few-Shot Learners", authors: "Tom B. Brown, Benjamin Mann, Nick Ryder" },
  { id: 3, title: "Deep Residual Learning for Image Recognition", authors: "Kaiming He, Xiangyu Zhang, Shaoqing Ren" },
  { id: 4, title: "BERT: Pre-training of Deep Bidirectional Transformers", authors: "Jacob Devlin, Ming-Wei Chang, Kenton Lee" },
  { id: 5, title: "Generative Adversarial Nets", authors: "Ian Goodfellow, Jean Pouget-Abadie, Mehdi Mirza" },
]

const sourceReferences = [
  {
    id: 1, citationNumber: 1, author: "Fowler et al. (2023)",
    title: "High-threshold surface codes and fast classical decoding algorithms",
    excerpt: "We present a detailed analysis of planar surface code thresholds, confirming a practical limit near 1%...",
    tags: ["Tr. 42", "Phương pháp"],
  },
  {
    id: 2, citationNumber: 2, author: "Zhang & Liu (2024)",
    title: "Decoherence constraints in Majorana-based topological qubits",
    excerpt: "While non-Abelian statistics offer inherent protection, our simulations indicate that dynamic environmental...",
    tags: ["Tr. 15", "Kết quả"],
  },
  {
    id: 3, citationNumber: 3, author: "Chen (2023)",
    title: "Neural network decoders for scalable topological error...",
    excerpt: "By utilizing a convolutional neural network architecture, we achieve a decoding speedup of 40% over...",
    tags: ["Tr. 8", "Tóm tắt"],
  },
]

const quickActions = [
  { Icon: FileText, label: "Tóm tắt\nBộ sưu tập", color: "text-[#0058be]", bg: "bg-[#eff4ff]", hoverBg: "hover:bg-[#dbeafe]" },
  { Icon: FlaskConical, label: "Giải thích\nPhương pháp", color: "text-[#7c3aed]", bg: "bg-[#f5f3ff]", hoverBg: "hover:bg-[#ede9fe]" },
  { Icon: AlertTriangle, label: "Tìm kiếm\nHạn chế", color: "text-[#d93025]", bg: "bg-[#fff1f1]", hoverBg: "hover:bg-[#fee2e2]" },
  { Icon: ArrowRightLeft, label: "So sánh\nBài báo", color: "text-[#a16207]", bg: "bg-[#fefce8]", hoverBg: "hover:bg-[#fef9c3]" },
]

/* ─── Typing Dots ────────────────────────────── */
function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 py-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-2 h-2 rounded-full bg-[#0058be]/60"
          animate={{ y: [0, -6, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }}
        />
      ))}
    </div>
  )
}

/* ─── Message bubble variants ────────────────── */
const msgVariants: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
  exit: { opacity: 0, y: -8, scale: 0.97, transition: { duration: 0.2 } },
}

/* ─── Main Component ─────────────────────────── */
function WorkspaceContent() {
  const { token } = useAuth()
  const searchParams = useSearchParams()
  const docId = searchParams.get("docId")

  const [input, setInput] = React.useState("")
  const [messages, setMessages] = React.useState<{ role: string; content: string }[]>([])
  const [isTyping, setIsTyping] = React.useState(false)
  const bottomRef = React.useRef<HTMLDivElement>(null)

  const [realSourceReferences, setRealSourceReferences] = React.useState<any[]>([])
  const sessionId = React.useMemo(() => crypto.randomUUID(), [])
  const [realAttachedDoc, setRealAttachedDoc] = React.useState<{ id: string, title: string } | null>(null)
  const [isDocAttached, setIsDocAttached] = React.useState(false)

  React.useEffect(() => {
    if (docId) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/api/documents/${docId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      .then(res => res.json())
      .then(data => {
        if (data.id) {
          setRealAttachedDoc({ id: data.id, title: data.title })
          setIsDocAttached(true)
        }
      })
      .catch(console.error)
    }
  }, [docId, token])

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  const handleSend = async () => {
    if (!input.trim()) return
    const userMsg = input
    setMessages(prev => [...prev, { role: "user", content: userMsg }])
    setInput("")
    setIsTyping(true)
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/api/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          message: userMsg,
          sessionId,
          documentId: (isDocAttached && realAttachedDoc) ? realAttachedDoc.id : undefined,
          scope: (isDocAttached && realAttachedDoc) ? "SINGLE_DOCUMENT" : "GLOBAL"
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lỗi khi gọi AI");
      
      setMessages(prev => [...prev, { role: "ai", content: data.answer }]);
      
      if (data.citations && data.citations.length > 0) {
        setRealSourceReferences(data.citations.map((c: any, i: number) => ({
          id: i, citationNumber: c.index, author: c.documentTitle, title: c.documentTitle, excerpt: c.excerpt, tags: [`Tr. ${c.pageNumber}`]
        })));
      }
    } catch (err: any) {
      setMessages(prev => [...prev, { role: "ai", content: `❌ Lỗi: ${err.message}` }]);
    } finally {
      setIsTyping(false);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-[#fafbff]">

      {/* ── Sub-toolbar ── */}
      <motion.div
        className="shrink-0 flex items-center justify-between px-6 py-3 border-b border-[#c2c6d6]/30 bg-white/80 backdrop-blur-sm"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <motion.button
          className="flex items-center gap-2 px-4 py-2 bg-white border border-[#c2c6d6]/50 rounded-lg text-[13px] font-bold text-[#424754] shadow-sm"
          whileHover={{ scale: 1.02, boxShadow: "0 4px 16px rgba(0,88,190,0.10)" }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Layers size={14} className="text-[#727785]" />
          Bộ sưu tập: Tài liệu điện toán lượng tử
          <ChevronDown size={14} className="text-[#727785] ml-1" />
        </motion.button>

        <div className="flex items-center gap-2">
          {[Bell, HelpCircle].map((Icon, i) => (
            <motion.button
              key={i}
              className="p-2 rounded-xl text-[#727785]"
              whileHover={{ scale: 1.12, backgroundColor: "#ffffff", color: "#121c2a", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
              whileTap={{ scale: 0.92 }}
            >
              <Icon size={17} />
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* ── Main Area ── */}
      <div className="flex-1 overflow-hidden flex">

        {/* Left: Chat */}
        <div className="flex-1 flex flex-col px-6 md:px-12 pt-8 pb-6 overflow-y-auto max-w-[800px] mx-auto">

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-4 gap-3 mb-10">
            {quickActions.map(({ Icon, label, color, bg, hoverBg }, i) => (
              <motion.button
                key={i}
                className={`flex flex-col items-center justify-center gap-2.5 text-center p-4 rounded-2xl border border-transparent transition-colors ${hoverBg}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                whileHover={{ y: -3, boxShadow: "0 8px 24px rgba(0,0,0,0.08)", borderColor: "rgba(0,0,0,0.08)" }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}
                  whileHover={{ rotate: 8, scale: 1.12 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Icon size={20} className={color} strokeWidth={1.5} />
                </motion.div>
                <span className="text-[11px] font-bold text-[#424754] leading-tight whitespace-pre-line">{label}</span>
              </motion.button>
            ))}
          </div>

          {/* Chat History */}
          <div className="flex flex-col gap-5 flex-1 mb-6 overflow-y-auto">
            <AnimatePresence initial={false}>
              {messages.length === 0 && !isTyping && (
                <motion.div
                  key="empty"
                  className="flex items-center justify-center h-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="text-center">
                    <motion.div
                      animate={{ scale: [1, 1.06, 1], opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      className="inline-flex mb-3"
                    >
                      <Sparkles size={28} className="text-[#0058be]/40" />
                    </motion.div>
                    <p className="text-[#727785] text-[14px] font-medium">
                      {isDocAttached && realAttachedDoc
                        ? `Hỏi điều gì đó về "${realAttachedDoc.title}"...`
                        : "Bắt đầu một cuộc trò chuyện mới..."}
                    </p>
                  </div>
                </motion.div>
              )}

              {messages.map((msg, idx) =>
                msg.role === "user" ? (
                  <motion.div
                    key={idx}
                    className="self-end bg-gradient-to-br from-[#0058be] to-[#2170e4] text-white rounded-2xl rounded-tr-sm px-5 py-3.5 max-w-[80%] text-[14px] leading-relaxed shadow-md shadow-[#0058be]/15"
                    variants={msgVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {msg.content}
                  </motion.div>
                ) : (
                  <motion.div
                    key={idx}
                    className="self-start bg-white border border-[#c2c6d6]/40 shadow-sm rounded-2xl rounded-tl-sm px-6 py-5 max-w-[95%]"
                    variants={msgVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <div className="flex items-center gap-2 mb-3 text-[#0058be]">
                      <motion.span
                        animate={{ rotate: [0, 12, -8, 0] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                      >
                        <Sparkles size={16} />
                      </motion.span>
                      <span className="text-[13px] font-bold">Lumis AI</span>
                    </div>
                    <div className="text-[14px] text-[#424754] leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </div>
                  </motion.div>
                )
              )}

              {isTyping && (
                <motion.div
                  key="typing"
                  className="self-start bg-white border border-[#c2c6d6]/40 shadow-sm rounded-2xl rounded-tl-sm px-6 py-4 max-w-[95%]"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="flex items-center gap-2 text-[#0058be] mb-1">
                    <Sparkles size={15} />
                    <span className="text-[12px] font-bold">Lumis đang suy nghĩ...</span>
                  </div>
                  <TypingDots />
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={bottomRef} />
          </div>

          {/* Input Area */}
          <div className="mt-auto flex flex-col gap-2">
            <AnimatePresence>
              {isDocAttached && realAttachedDoc && (
                <motion.div
                  className="flex items-center gap-2 self-start bg-white border border-[#0058be]/30 px-3 py-1.5 rounded-lg shadow-sm"
                  initial={{ opacity: 0, y: 6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <FileText size={14} className="text-[#0058be]" />
                  <span className="text-[12px] font-semibold text-[#121c2a] truncate max-w-[300px]">{realAttachedDoc.title}</span>
                  <button onClick={() => setIsDocAttached(false)} className="text-[#727785] hover:text-red-500 ml-1 transition-colors">
                    <X size={12} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="bg-white border border-[#c2c6d6]/50 rounded-2xl shadow-sm p-3 flex flex-col focus-within:border-[#0058be]/40 focus-within:shadow-[0_0_0_3px_rgba(0,88,190,0.08)] transition-all">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() }
                }}
                className="w-full bg-transparent border-none outline-none resize-none text-[14px] text-[#121c2a] placeholder:text-[#727785] min-h-[44px] max-h-[120px]"
                placeholder={
                  isDocAttached && realAttachedDoc
                    ? `Yêu cầu Lumis phân tích ${realAttachedDoc.title}...`
                    : "Yêu cầu Lumis tổng hợp, phân tích hoặc so sánh các tài liệu..."
                }
                rows={2}
              />
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#c2c6d6]/20">
                <div className="flex items-center gap-1">
                  <motion.button
                    className="p-2 text-[#727785] rounded-lg"
                    whileHover={{ scale: 1.1, color: "#121c2a", backgroundColor: "#f3f4f6" }}
                    whileTap={{ scale: 0.9 }}
                    title="Đính kèm tệp"
                  >
                    <Paperclip size={17} />
                  </motion.button>
                  <motion.button
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[#727785] rounded-lg text-[12px] font-semibold"
                    whileHover={{ scale: 1.04, color: "#0058be", backgroundColor: "#eff4ff" }}
                    whileTap={{ scale: 0.96 }}
                    title="Chia sẻ phiên này"
                  >
                    <Share2 size={14} />
                    Chia sẻ phiên
                  </motion.button>
                </div>
                <motion.button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="flex items-center gap-2 px-5 py-2 bg-[#0058be] disabled:opacity-40 text-white rounded-xl text-[14px] font-semibold shadow-md shadow-[#0058be]/20"
                  whileHover={{ scale: 1.04, backgroundColor: "#2170e4" }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Send size={15} />
                  Gửi
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Source References */}
        <motion.div
          className="w-[360px] shrink-0 border-l border-[#c2c6d6]/30 bg-[#fafbff] flex flex-col overflow-hidden"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.45 }}
        >
          <div className="px-6 py-5 border-b border-[#c2c6d6]/30 bg-white/60">
            <h2 className="text-[17px] font-bold text-[#121c2a]" style={{ fontFamily: "Geist, sans-serif" }}>
              Nguồn tham khảo
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
            {(realSourceReferences.length > 0 ? realSourceReferences : sourceReferences).map((ref, i) => (
              <motion.div
                key={ref.id}
                className="bg-white border border-[#c2c6d6]/40 rounded-xl overflow-hidden shadow-sm cursor-pointer"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + i * 0.1, duration: 0.4 }}
                whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(0,88,190,0.10)", borderColor: "rgba(0,88,190,0.25)" }}
              >
                <div className="flex border-l-[4px] border-[#0058be] flex-col p-4">
                  <div className="flex items-center justify-between mb-2">
                    <motion.span
                      className="inline-flex items-center justify-center w-[20px] h-[20px] rounded-[5px] bg-[#0058be] text-white text-[10px] font-bold"
                      whileHover={{ scale: 1.15 }}
                    >
                      {ref.citationNumber}
                    </motion.span>
                    <span className="text-[11px] font-semibold text-[#727785]">{ref.author}</span>
                  </div>
                  <h3 className="text-[13px] font-bold text-[#121c2a] leading-snug mb-1.5 group-hover:text-[#0058be] transition-colors">
                    {ref.title}
                  </h3>
                  <p className="text-[12px] text-[#424754] leading-relaxed mb-3 line-clamp-2">
                    {ref.excerpt}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {ref.tags.map((tag: string) => (
                      <span key={tag} className="px-2 py-0.5 bg-[#f0f4ff] text-[#0058be] rounded-[4px] text-[10px] font-bold border border-[#0058be]/10">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default function AIWorkspacePage() {
  return (
    <React.Suspense fallback={
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles size={24} className="text-[#0058be]" />
        </motion.div>
      </div>
    }>
      <WorkspaceContent />
    </React.Suspense>
  )
}
