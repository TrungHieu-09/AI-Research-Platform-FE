"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import {
  Bell, HelpCircle, ChevronDown, FileText, FlaskConical,
  AlertTriangle, ArrowRightLeft, Paperclip, Send, Sparkles,
  Layers, Share2, X, Info, CheckCircle2, Code2
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

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

/* ─── Message bubble variants ────────────────── */
const msgVariants: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
  exit: { opacity: 0, y: -8, scale: 0.97, transition: { duration: 0.2 } },
}

/* ─── Rich Formatting & Markdown Renderer ────── */
function parseInlineFormatting(text: string) {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*|`[^`]+`|\[[0-9,\s]+\]|\$[^\$]+\$)/g);

  return parts.map((part, idx) => {
    if (!part) return null;
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={idx} className="font-bold text-[#0f172a]">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={idx} className="px-1.5 py-0.5 bg-[#f1f5f9] text-[#0058be] rounded-md font-mono text-[12.5px] border border-[#cbd5e1] shadow-[0_1px_2px_rgba(0,0,0,0.03)] font-semibold">
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith("$") && part.endsWith("$")) {
      return (
        <span key={idx} className="px-1.5 py-0.5 bg-[#eff4ff] text-[#0058be] font-medium rounded-md font-mono text-[13px]">
          {part.slice(1, -1)}
        </span>
      );
    }
    if (part.match(/^\[[0-9,\s]+\]$/)) {
      const numbers = part.slice(1, -1).split(",").map(n => n.trim());
      return (
        <span key={idx} className="inline-flex items-center gap-1 ml-1 align-baseline">
          {numbers.map((num, nIdx) => (
            <span
              key={nIdx}
              className="inline-flex items-center justify-center px-1.5 py-0.2 text-[11px] font-bold bg-[#eff4ff] text-[#0058be] border border-[#0058be]/30 rounded-md hover:bg-[#0058be] hover:text-white transition-all cursor-pointer shadow-sm"
              title={`Trích dẫn nguồn [${num}]`}
            >
              #{num}
            </span>
          ))}
        </span>
      );
    }
    return part;
  });
}

function renderFormattedContent(text: string) {
  if (!text) return null;

  // 1. Separate fenced code blocks first so inner double newlines don't split code blocks
  const codeBlockRegex = /```([\w-]*)\n([\s\S]*?)```/g;
  const tokens: { type: "code" | "markdown"; content: string; lang?: string }[] = [];
  let lastIndex = 0;
  let match;
  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: "markdown", content: text.slice(lastIndex, match.index) });
    }
    tokens.push({ type: "code", lang: match[1] || "code", content: match[2].trim() });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    tokens.push({ type: "markdown", content: text.slice(lastIndex) });
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {tokens.map((token, tIdx) => {
        if (token.type === "code") {
          return (
            <div key={`code-${tIdx}`} className="my-2 rounded-xl overflow-hidden border border-[#334155] bg-[#0f172a] shadow-md w-full">
              <div className="flex items-center justify-between px-4 py-2 bg-[#1e293b] border-b border-[#334155] text-white/80 text-[12px] font-mono">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                  <span className="ml-1.5 font-bold tracking-wider uppercase text-[11px] text-[#94a3b8]">{token.lang}</span>
                </div>
                <Code2 size={14} className="text-[#94a3b8]" />
              </div>
              <pre className="p-4 text-[13px] text-[#f8fafc] font-mono overflow-x-auto leading-relaxed whitespace-pre">
                <code>{token.content}</code>
              </pre>
            </div>
          );
        }

        // Split markdown chunks by double newlines into blocks
        const blocks = token.content.split(/\n\n+/);
        return (
          <React.Fragment key={`md-${tIdx}`}>
            {blocks.map((block, bIdx) => {
              const trimmedBlock = block.trim();
              if (!trimmedBlock) return null;

              // A. Markdown Table check
              const lines = trimmedBlock.split("\n");
              const tableLines = lines.filter(l => l.trim().startsWith("|"));
              if (tableLines.length >= 2 && tableLines.length * 2 >= lines.length) {
                const parseRow = (rowStr: string) =>
                  rowStr.trim().replace(/^\||\|$/g, "").split("|").map(cell => cell.trim());
                
                const headers = parseRow(tableLines[0]);
                const dataRows = tableLines.slice(1).filter(r => !r.includes("---")).map(parseRow);

                return (
                  <div key={`tbl-${bIdx}`} className="my-2 border border-[#cbd5e1] rounded-xl overflow-hidden shadow-sm bg-white w-full">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gradient-to-r from-[#f8fafc] to-[#f1f5f9] border-b border-[#cbd5e1]">
                            {headers.map((h, hIdx) => (
                              <th key={hIdx} className="py-3 px-4 text-[13.5px] font-bold text-[#0f172a] tracking-tight">
                                {parseInlineFormatting(h)}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e2e8f0]">
                          {dataRows.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-[#f8fafc]/90 transition-colors">
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} className="py-3 px-4 text-[13.5px] text-[#334155] leading-relaxed">
                                  {parseInlineFormatting(cell)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              }

              // B. Blockquote / Alert callouts (> [!TIP], > [!NOTE], etc.)
              if (trimmedBlock.startsWith("> ") || trimmedBlock.startsWith(">&gt; ")) {
                const quoteLines = trimmedBlock.split("\n").map(l => l.replace(/^>\s*/, "").trim());
                const firstLine = quoteLines[0] || "";
                let alertType = "QUOTE";
                if (firstLine.includes("[!TIP]")) alertType = "TIP";
                else if (firstLine.includes("[!NOTE]")) alertType = "NOTE";
                else if (firstLine.includes("[!IMPORTANT]") || firstLine.includes("[!WARNING]")) alertType = "IMPORTANT";

                const contentLines = firstLine.match(/\[!.*\]/) ? quoteLines.slice(1) : quoteLines;
                const bodyText = contentLines.join("\n").trim();

                if (alertType === "TIP") {
                  return (
                    <div key={`quote-${bIdx}`} className="my-2 flex items-start gap-3 p-4 bg-gradient-to-r from-[#ecfdf5] to-[#f0fdf4] border-l-4 border-[#10b981] rounded-r-xl shadow-sm">
                      <CheckCircle2 size={20} className="text-[#10b981] shrink-0 mt-0.5" />
                      <div className="flex-1 text-[13.5px] text-[#065f46] leading-relaxed font-medium">
                        {parseInlineFormatting(bodyText || firstLine.replace(/\[!TIP\]\s*/, ""))}
                      </div>
                    </div>
                  );
                }
                if (alertType === "NOTE") {
                  return (
                    <div key={`quote-${bIdx}`} className="my-2 flex items-start gap-3 p-4 bg-gradient-to-r from-[#eff6ff] to-[#f8fafc] border-l-4 border-[#3b82f6] rounded-r-xl shadow-sm">
                      <Info size={20} className="text-[#3b82f6] shrink-0 mt-0.5" />
                      <div className="flex-1 text-[13.5px] text-[#1e40af] leading-relaxed font-medium">
                        {parseInlineFormatting(bodyText || firstLine.replace(/\[!NOTE\]\s*/, ""))}
                      </div>
                    </div>
                  );
                }
                if (alertType === "IMPORTANT") {
                  return (
                    <div key={`quote-${bIdx}`} className="my-2 flex items-start gap-3 p-4 bg-gradient-to-r from-[#fffbeb] to-[#fefce8] border-l-4 border-[#f59e0b] rounded-r-xl shadow-sm">
                      <AlertTriangle size={20} className="text-[#f59e0b] shrink-0 mt-0.5" />
                      <div className="flex-1 text-[13.5px] text-[#92400e] leading-relaxed font-medium">
                        {parseInlineFormatting(bodyText || firstLine.replace(/\[!.*\]\s*/, ""))}
                      </div>
                    </div>
                  );
                }
                return (
                  <blockquote key={`quote-${bIdx}`} className="my-2 p-4 bg-[#f8fafc] border-l-4 border-[#64748b] rounded-r-xl text-[14px] italic text-[#475569] leading-relaxed shadow-sm">
                    {parseInlineFormatting(trimmedBlock.replace(/^>\s*/gm, ""))}
                  </blockquote>
                );
              }

              // C. Horizontal rules
              if (trimmedBlock.match(/^[-*_]{3,}$/)) {
                return <hr key={`hr-${bIdx}`} className="my-3 border-t border-[#cbd5e1]/80" />;
              }

              // D. Headings (### or #### or bold titles)
              if (trimmedBlock.startsWith("### ") || trimmedBlock.startsWith("#### ") || (trimmedBlock.startsWith("**") && trimmedBlock.endsWith("**") && trimmedBlock.length < 120 && !trimmedBlock.includes("\n"))) {
                const isMainTitle = trimmedBlock.startsWith("### ");
                const titleText = trimmedBlock.replace(/^###?\s*/, "").replace(/^\*\*/, "").replace(/\*\*$/, "");
                return (
                  <div key={`hd-${bIdx}`} className="flex items-center gap-2.5 mt-3 first:mt-0 pt-2 first:pt-0 border-t border-[#e2e8f0]/40 first:border-none">
                    <div className={`w-1.5 ${isMainTitle ? "h-5 bg-gradient-to-b from-[#0058be] to-[#2563eb]" : "h-4 bg-[#0058be]"} rounded-full shrink-0 shadow-sm`} />
                    <h4 className={`${isMainTitle ? "text-[16px]" : "text-[14.5px]"} font-bold text-[#0f172a] tracking-tight`}>
                      {parseInlineFormatting(titleText)}
                    </h4>
                  </div>
                );
              }

              // E. Lists (*, -, •, 1., 2.)
              if (lines.length > 0 && lines.every(l => l.trim().match(/^([*\-•]|\d+\.)\s+/))) {
                return (
                  <ul key={`list-${bIdx}`} className="flex flex-col gap-2.5 pl-1 my-1.5">
                    {lines.map((item, iIdx) => {
                      const cleanItem = item.trim().replace(/^([*\-•]|\d+\.)\s*/, "");
                      return (
                        <li key={iIdx} className="flex items-start gap-2.5 text-[14px] text-[#334155] leading-relaxed">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#0058be] mt-2 shrink-0 shadow-[0_0_6px_rgba(0,88,190,0.4)]" />
                          <span className="flex-1">{parseInlineFormatting(cleanItem)}</span>
                        </li>
                      );
                    })}
                  </ul>
                );
              }

              // F. Mixed Paragraph / partial lists
              if (lines.length > 1 && lines.some(l => l.trim().match(/^([*\-•]|\d+\.)\s+/))) {
                return (
                  <div key={`mix-${bIdx}`} className="flex flex-col gap-2 text-[14px] text-[#334155] leading-relaxed">
                    {lines.map((line, lIdx) => {
                      const trimmed = line.trim();
                      if (trimmed.match(/^([*\-•]|\d+\.)\s+/)) {
                        return (
                          <div key={lIdx} className="flex items-start gap-2.5 pl-2 my-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#0058be] mt-2 shrink-0 shadow-[0_0_6px_rgba(0,88,190,0.4)]" />
                            <span className="flex-1">{parseInlineFormatting(trimmed.replace(/^([*\-•]|\d+\.)\s*/, ""))}</span>
                          </div>
                        );
                      }
                      if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
                        return <div key={lIdx} className="font-bold text-[#0f172a] text-[14.5px] mt-1.5">{parseInlineFormatting(trimmed)}</div>;
                      }
                      return <p key={lIdx}>{parseInlineFormatting(trimmed)}</p>;
                    })}
                  </div>
                );
              }

              // G. Default Paragraph
              return (
                <p key={`p-${bIdx}`} className="text-[14px] text-[#334155] leading-relaxed">
                  {parseInlineFormatting(trimmedBlock)}
                </p>
              );
            })}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ─── Main Component ─────────────────────────── */
function WorkspaceContent() {
  const { token } = useAuth()
  const searchParams = useSearchParams()
  const docId = searchParams.get("docId")

  const [input, setInput] = React.useState("")
  const [messages, setMessages] = React.useState<{ role: string; content: string; attachedFile?: { name: string; size: number } }[]>([])
  const [isTyping, setIsTyping] = React.useState(false)
  const bottomRef = React.useRef<HTMLDivElement>(null)

  const [realSourceReferences, setRealSourceReferences] = React.useState<any[]>([])
  const sessionId = React.useMemo(() => crypto.randomUUID(), [])
  const [realAttachedDoc, setRealAttachedDoc] = React.useState<{ id: string, title: string } | null>(null)
  const [isDocAttached, setIsDocAttached] = React.useState(false)

  // Universal File Upload State
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [uploadedFile, setUploadedFile] = React.useState<{ name: string; size: number; fileUrl: string; fileHash?: string; mimeType: string } | null>(null)
  const [isUploadingFile, setIsUploadingFile] = React.useState(false)
  const [uploadFileProgress, setUploadFileProgress] = React.useState(0)

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

  const handleUniversalFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingFile(true)
    setUploadFileProgress(15)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("purpose", "chat")

      const result = await new Promise<{ fileUrl: string; fileHash: string; fileName: string; fileSize: number; mimeType: string }>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.upload.addEventListener("progress", (ev) => {
          if (ev.lengthComputable) {
            const pct = Math.round((ev.loaded / ev.total) * 90)
            setUploadFileProgress(pct)
          }
        })
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              resolve(JSON.parse(xhr.responseText))
            } catch {
              reject(new Error("Phản hồi không hợp lệ từ máy chủ."))
            }
          } else {
            try {
              const err = JSON.parse(xhr.responseText)
              reject(new Error(err.error || `Upload error (${xhr.status})`))
            } catch {
              reject(new Error(`Upload error (${xhr.status})`))
            }
          }
        })
        xhr.addEventListener("error", () => reject(new Error("Lỗi kết nối khi tải tệp lên.")))
        xhr.open("POST", `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/api/upload`)
        if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`)
        xhr.send(formData)
      })

      setUploadFileProgress(100)
      setUploadedFile({
        name: result.fileName || file.name,
        size: result.fileSize || file.size,
        fileUrl: result.fileUrl,
        fileHash: result.fileHash,
        mimeType: result.mimeType || file.type
      })
    } catch (err: any) {
      setMessages(prev => [...prev, { role: "ai", content: `❌ Lỗi tải tệp: ${err.message}` }])
    } finally {
      setIsUploadingFile(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleSend = async () => {
    if (!input.trim()) return
    const userMsg = input
    const currentUploadedFile = uploadedFile
    setMessages(prev => [...prev, { 
      role: "user", 
      content: userMsg,
      attachedFile: currentUploadedFile ? { name: currentUploadedFile.name, size: currentUploadedFile.size } : undefined
    }])
    setInput("")
    setUploadedFile(null)
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
          documentId: (isDocAttached && realAttachedDoc && !currentUploadedFile) ? realAttachedDoc.id : undefined,
          scope: (isDocAttached && realAttachedDoc && !currentUploadedFile) ? "SINGLE_DOCUMENT" : "GLOBAL",
          attachedFile: currentUploadedFile ? { url: currentUploadedFile.fileUrl, name: currentUploadedFile.name, type: currentUploadedFile.mimeType, hash: currentUploadedFile.fileHash } : undefined
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
                    className="self-end bg-gradient-to-br from-[#0058be] to-[#2170e4] text-white rounded-2xl rounded-tr-sm px-5 py-3.5 max-w-[80%] text-[14px] leading-relaxed shadow-md shadow-[#0058be]/15 flex flex-col gap-2.5"
                    variants={msgVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {msg.attachedFile && (
                      <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/25 px-3 py-1.5 rounded-xl text-[12px] font-medium text-white/95 w-fit shadow-sm">
                        <FileText size={14} className="text-white/90 shrink-0" />
                        <span className="truncate max-w-[220px] font-semibold">{msg.attachedFile.name}</span>
                        <span className="text-white/75 text-[11px] font-normal">({formatBytes(msg.attachedFile.size)})</span>
                      </div>
                    )}
                    <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                  </motion.div>
                ) : (
                  <motion.div
                    key={idx}
                    className="self-start bg-white border border-[#c2c6d6]/40 shadow-sm rounded-2xl rounded-tl-sm px-6 py-5 max-w-[95%] w-full"
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
                    <div className="w-full">
                      {renderFormattedContent(msg.content)}
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
              {isUploadingFile && (
                <motion.div
                  className="flex items-center justify-between gap-3 self-start bg-[#eff4ff]/95 border border-[#0058be]/30 px-3.5 py-2 rounded-xl backdrop-blur-md shadow-sm w-full max-w-[360px]"
                  initial={{ opacity: 0, y: 6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.95 }}
                >
                  <div className="flex items-center gap-2 text-[#0058be]">
                    <Sparkles size={14} className="animate-spin" />
                    <span className="text-[13px] font-semibold" style={{ fontFamily: "Geist, sans-serif" }}>Đang tải tệp lên... {uploadFileProgress}%</span>
                  </div>
                  <div className="w-24 bg-[#dfe9fc] h-1.5 rounded-full overflow-hidden shrink-0">
                    <div className="h-full bg-gradient-to-r from-[#0058be] to-[#316bf3] transition-all duration-200" style={{ width: `${uploadFileProgress}%` }} />
                  </div>
                </motion.div>
              )}

              {uploadedFile && (
                <motion.div
                  className="flex items-center gap-2.5 self-start bg-[#eff4ff] border border-[#0058be]/40 px-3 py-1.5 rounded-xl shadow-sm"
                  initial={{ opacity: 0, y: 6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="p-1 bg-[#0058be]/10 rounded-md text-[#0058be]">
                    <FileText size={15} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-semibold text-[#121c2a] truncate max-w-[240px]" style={{ fontFamily: "Geist, sans-serif" }}>{uploadedFile.name}</span>
                    <span className="text-[11px] text-[#424754] font-medium">{formatBytes(uploadedFile.size)} · Tệp đính kèm</span>
                  </div>
                  <button
                    onClick={() => setUploadedFile(null)}
                    className="p-1 text-[#727785] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/50 rounded-lg transition-colors ml-1"
                    title="Hủy đính kèm"
                  >
                    <X size={14} />
                  </button>
                </motion.div>
              )}

              {isDocAttached && realAttachedDoc && (
                <motion.div
                  className="flex items-center gap-2 self-start bg-white border border-[#0058be]/30 px-3 py-1.5 rounded-xl shadow-sm"
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
                  <input
                    ref={fileInputRef}
                    type="file"
                    hidden
                    onChange={handleUniversalFileUpload}
                  />
                  <motion.button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-[#727785] rounded-lg relative"
                    whileHover={{ scale: 1.1, color: "#0058be", backgroundColor: "#eff4ff" }}
                    whileTap={{ scale: 0.9 }}
                    title="Đính kèm tệp (PDF, DOCX, TXT, PNG...)"
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
