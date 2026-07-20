"use client"

import * as React from "react"

import { useSearchParams } from "next/navigation"
import {
  Bell, HelpCircle, ChevronDown, FileText, FlaskConical,
  AlertTriangle, ArrowRightLeft, Paperclip, Send, Sparkles,
  Layers, X, Info, CheckCircle2, Code2,
  Copy, Check, Edit3, Trash2, Download, ExternalLink, MoreVertical, Plus, History, Upload, BookOpen, PanelLeft
} from "lucide-react"
import { motion, AnimatePresence, Variants } from "framer-motion"
import { useAuth } from "@/features/auth/auth-context"

/* ─── Data ───────────────────────────────────── */
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

// Removed quickActions

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

/* ─── Code Block Component with Copy Button ──── */
function CodeBlock({ lang, content }: { lang: string; content: string }) {
  const [copied, setCopied] = React.useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="my-3 rounded-xl overflow-hidden border border-[#334155] bg-[#0f172a] shadow-lg w-full transition-all hover:border-[#475569]">
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#1e293b] border-b border-[#334155] text-white/80 text-[12px] font-mono">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
          <span className="ml-1.5 font-bold tracking-wider uppercase text-[11px] text-[#94a3b8]">{lang || "CODE"}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#334155]/70 hover:bg-[#475569] text-[#e2e8f0] text-[11px] font-sans font-medium transition-all cursor-pointer border border-white/10"
        >
          {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} className="text-[#94a3b8]" />}
          <span>{copied ? "Đã sao chép" : "Sao chép code"}</span>
        </button>
      </div>
      <pre className="p-4 text-[13px] text-[#f8fafc] font-mono overflow-x-auto leading-relaxed whitespace-pre">
        <code>{content}</code>
      </pre>
    </div>
  );
}

/* ─── Rich Formatting & Markdown Renderer ────── */
function parseInlineFormatting(text: string, onCitationClick?: (num: number) => void) {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*|\*[^\*\n]+\*|`[^`]+`|\[[0-9,\s]+\]|#[0-9]+|\$[^\$]+\$)/g);

  return parts.map((part, idx) => {
    if (!part) return null;
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={idx} className="font-bold text-[#0f172a]">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*") && !part.startsWith("**")) {
      return <em key={idx} className="italic text-[#1e293b] font-medium">{part.slice(1, -1)}</em>;
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
    if (part.match(/^#[0-9]+$/)) {
      const num = Number(part.slice(1));
      return (
        <span
          key={idx}
          onClick={(e) => {
            e.stopPropagation();
            if (onCitationClick) onCitationClick(num);
          }}
          className="inline-flex items-center justify-center px-1.5 py-0.5 ml-1 text-[11px] font-bold bg-[#eff4ff] text-[#0058be] border border-[#0058be]/30 rounded-md hover:bg-[#0058be] hover:text-white transition-all cursor-pointer shadow-sm align-baseline"
          title={`Click để xem chi tiết trích dẫn [${num}]`}
        >
          #{num}
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
              onClick={(e) => {
                e.stopPropagation();
                if (onCitationClick) onCitationClick(Number(num));
              }}
              className="inline-flex items-center justify-center px-1.5 py-0.5 text-[11px] font-bold bg-[#eff4ff] text-[#0058be] border border-[#0058be]/30 rounded-md hover:bg-[#0058be] hover:text-white transition-all cursor-pointer shadow-sm"
              title={`Click để xem chi tiết trích dẫn [${num}]`}
            >
              #{num}
            </span>
          ))}
        </span>
      );
    }
    // For regular text parts, clean up any stray leading/trailing asterisks or weird bullet asterisks
    const cleanPart = part.replace(/^[ \t]*\*[ \t]+/g, "");
    return cleanPart;
  });
}

function renderFormattedContent(text: string, onCitationClick?: (num: number) => void) {
  if (!text) return null;

  // 0. Preprocess text before block parsing:
  // Convert lines starting with "* " into "- " for uniform, clean list formatting
  // Convert "#1" or "\n#1" into "[1]" inline citation so they format nicely
  let normalizedText = text
    .replace(/^[ \t]*\*\s+/gm, "- ")
    .replace(/([^\n])\s*\n+[ \t]*(#[0-9]+|\[[0-9,\s]+\])\s*(?=\n|$)/g, "$1 $2")
    .replace(/(\s|^)#([0-9]+)(?=\s|$|\.|,)/g, "$1[$2]");

  // 0.a. Unwrap massive multi-sentence paragraphs (> 100 chars with period) accidentally wrapped in outer **bold**
  normalizedText = normalizedText.replace(/^\*\*([^\n*]{100,}\.[^\n*]*)\*\*$/gm, "$1");

  // 0.b. Break inline numbered items like "1. Item one 2. Item two" onto clean new lines
  normalizedText = normalizedText.replace(/([^\n])\s+(?=(?:\d+\.|\-|\•)\s+[A-ZÀ-Ỹa-zà-ỹ0-9"'(/**])/g, "$1\n");

  // 0.c. Ensure DOUBLE line break (\n\n) before any section heading/emoji so it separates into Block D (Heading)
  normalizedText = normalizedText
    .replace(/([.!?:;)"']|\d|[a-zà-ỹ])\s+(?=(?:###\s*)?(?:[📌💡🛠️📑🚀✨⚠️🔍📊🎯📁👤]|Tóm [Tt]ắt|Khuyến [Nn]ghị [Tt]iếp [Tt]heo|Tại sao cách viết này hiệu quả hơn|Thông [Tt]in [Cc]hung|Đánh [Gg]iá [Kk]ỹ [Nn]ăng|Đề [Xx]uất & [Cc]ải [Tt]hiện)\b)/g, "$1\n\n")
    // If heading/emoji is stuck right BEFORE body text or before a numbered list item on the exact same line, insert \n\n AFTER the heading:
    .replace(/((?:###\s*)?(?:[📌💡🛠️📑🚀✨⚠️🔍📊🎯📁👤]\s*[^\n.!?:;]+?[.!?:;]?|Tóm [Tt]ắt|Khuyến [Nn]ghị [Tt]iếp [Tt]heo|Tại sao cách viết này hiệu quả hơn[?]?|Thông [Tt]in [Cc]hung|Đánh [Gg]iá [Kk]ỹ [Nn]ăng|Đề [Xx]uất & [Cc]ải [Tt]hiện))\s+(?=(?:\d+\.|\-|\•|[A-ZÀ-Ỹ][^.!?\n]{15,}))/g, "$1\n\n");

  // 1. Separate fenced code blocks first so inner double newlines don't split code blocks
  const codeBlockRegex = /```([\w-]*)\n([\s\S]*?)```/g;
  const tokens: { type: "code" | "markdown"; content: string; lang?: string }[] = [];
  let lastIndex = 0;
  let match;
  while ((match = codeBlockRegex.exec(normalizedText)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: "markdown", content: normalizedText.slice(lastIndex, match.index) });
    }
    tokens.push({ type: "code", lang: match[1] || "code", content: match[2].trim() });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < normalizedText.length) {
    tokens.push({ type: "markdown", content: normalizedText.slice(lastIndex) });
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {tokens.map((token, tIdx) => {
        if (token.type === "code") {
          return <CodeBlock key={`code-${tIdx}`} lang={token.lang || "code"} content={token.content} />;
        }

        // Split markdown chunks by double newlines into blocks
        const blocks = token.content.split(/\n\n+/);
        return (
          <React.Fragment key={`md-${tIdx}`}>
            {blocks.map((block, bIdx) => {
              const trimmedBlock = block.trim();
              if (!trimmedBlock) return null;

              // A. Markdown Table check (supports both | pipe tables and \t tab tables)
              const lines = trimmedBlock.split("\n");
              const tableLines = lines.filter(l => l.trim().startsWith("|") || (l.includes("\t") && lines.length >= 2));
              if (tableLines.length >= 2 && tableLines.length * 2 >= lines.length) {
                const parseRow = (rowStr: string) => {
                  if (rowStr.includes("|")) {
                    return rowStr.trim().replace(/^\||\|$/g, "").split("|").map(cell => cell.trim());
                  }
                  return rowStr.trim().split(/\t+/).map(cell => cell.trim());
                };

                const headers = parseRow(tableLines[0]);
                const dataRows = tableLines.slice(1).filter(r => !r.includes("---") && !r.match(/^[\-\s\|]+$/)).map(parseRow);

                return (
                  <div key={`tbl-${bIdx}`} className="my-2 border border-[#cbd5e1] rounded-xl overflow-hidden shadow-sm bg-white w-full">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gradient-to-r from-[#f8fafc] to-[#f1f5f9] border-b border-[#cbd5e1]">
                            {headers.map((h, hIdx) => (
                              <th key={hIdx} className="py-3 px-4 text-[13.5px] font-bold text-[#0f172a] tracking-tight">
                                {parseInlineFormatting(h, onCitationClick)}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e2e8f0]">
                          {dataRows.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-[#f8fafc]/90 transition-colors">
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} className="py-3 px-4 text-[13.5px] text-[#334155] leading-relaxed">
                                  {parseInlineFormatting(cell, onCitationClick)}
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
                        {parseInlineFormatting(bodyText || firstLine.replace(/\[!TIP\]\s*/, ""), onCitationClick)}
                      </div>
                    </div>
                  );
                }
                if (alertType === "NOTE") {
                  return (
                    <div key={`quote-${bIdx}`} className="my-2 flex items-start gap-3 p-4 bg-gradient-to-r from-[#eff6ff] to-[#f8fafc] border-l-4 border-[#3b82f6] rounded-r-xl shadow-sm">
                      <Info size={20} className="text-[#3b82f6] shrink-0 mt-0.5" />
                      <div className="flex-1 text-[13.5px] text-[#1e40af] leading-relaxed font-medium">
                        {parseInlineFormatting(bodyText || firstLine.replace(/\[!NOTE\]\s*/, ""), onCitationClick)}
                      </div>
                    </div>
                  );
                }
                if (alertType === "IMPORTANT") {
                  return (
                    <div key={`quote-${bIdx}`} className="my-2 flex items-start gap-3 p-4 bg-gradient-to-r from-[#fffbeb] to-[#fefce8] border-l-4 border-[#f59e0b] rounded-r-xl shadow-sm">
                      <AlertTriangle size={20} className="text-[#f59e0b] shrink-0 mt-0.5" />
                      <div className="flex-1 text-[13.5px] text-[#92400e] leading-relaxed font-medium">
                        {parseInlineFormatting(bodyText || firstLine.replace(/\[!.*\]\s*/, ""), onCitationClick)}
                      </div>
                    </div>
                  );
                }
                return (
                  <blockquote key={`quote-${bIdx}`} className="my-2 p-4 bg-[#f8fafc] border-l-4 border-[#64748b] rounded-r-xl text-[14px] italic text-[#475569] leading-relaxed shadow-sm">
                    {parseInlineFormatting(trimmedBlock.replace(/^>\s*/gm, ""), onCitationClick)}
                  </blockquote>
                );
              }

              // C. Horizontal rules
              if (trimmedBlock.match(/^[-*_]{3,}$/)) {
                return <hr key={`hr-${bIdx}`} className="my-3 border-t border-[#cbd5e1]/80" />;
              }

              // D. Headings (### or #### or bold titles or plain document headings like PHẦN 1, TÓM TẮT)
              const isMarkdownHeading = trimmedBlock.startsWith("### ") || trimmedBlock.startsWith("#### ");
              const isBoldHeading = trimmedBlock.startsWith("**") && trimmedBlock.endsWith("**") && trimmedBlock.length < 90 && !trimmedBlock.includes("\n") && !trimmedBlock.includes(". ");
              const isPlainDocHeading = trimmedBlock.length < 100 && !trimmedBlock.includes("\n") && (
                trimmedBlock.match(/^(PHẦN|CHƯƠNG|BÁO CÁO|TÓM TẮT|KHUYẾN NGHỊ|MỤC|ĐỀ XUẤT|SUMMARY|RECOMMENDATION)\s/i) ||
                trimmedBlock === "Tóm tắt" || trimmedBlock === "Khuyến nghị tiếp theo" ||
                trimmedBlock.match(/^[A-ZÀ-Ỹ0-9\s:\-\/]{5,}$/)
              );

              if (isMarkdownHeading || isBoldHeading || isPlainDocHeading) {
                const isMainTitle = trimmedBlock.startsWith("### ") || trimmedBlock.match(/^(PHẦN|CHƯƠNG|BÁO CÁO|TÓM TẮT|KHUYẾN NGHỊ)/i) || trimmedBlock === "Tóm tắt" || trimmedBlock === "Khuyến nghị tiếp theo";
                const titleText = trimmedBlock.replace(/^###?\s*/, "").replace(/^\*\*/, "").replace(/\*\*$/, "");
                return (
                  <div key={`hd-${bIdx}`} className="flex items-center gap-2.5 mt-3 first:mt-0 pt-2 first:pt-0 border-t border-[#e2e8f0]/40 first:border-none">
                    <div className={`w-1.5 ${isMainTitle ? "h-5 bg-gradient-to-b from-[#0058be] to-[#2563eb]" : "h-4 bg-[#0058be]"} rounded-full shrink-0 shadow-sm`} />
                    <h4 className={`${isMainTitle ? "text-[16px]" : "text-[14.5px]"} font-bold text-[#0f172a] tracking-tight`}>
                      {parseInlineFormatting(titleText, onCitationClick)}
                    </h4>
                  </div>
                );
              }

              // E. Lists (*, -, •, 1., 2.)
              if (lines.length > 0 && lines.every(l => l.trim().match(/^([*\-•]|\d+\.)\s+/))) {
                return (
                  <ul key={`list-${bIdx}`} className="flex flex-col gap-2.5 pl-1 my-1.5">
                    {lines.map((item, iIdx) => {
                      const numMatch = item.trim().match(/^(\d+\.)\s+/);
                      const numStr = numMatch ? numMatch[1] : null;
                      const cleanItem = item.trim().replace(/^([*\-•]|\d+\.)\s*/, "");
                      return (
                        <li key={iIdx} className="flex items-start gap-2.5 text-[14px] text-[#334155] leading-relaxed">
                          {numStr ? (
                            <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1 rounded-md bg-[#eff4ff] text-[#0058be] font-bold text-[12.5px] border border-[#0058be]/20 mt-0.5 shrink-0 shadow-sm">{numStr}</span>
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#0058be] mt-2 shrink-0 shadow-[0_0_6px_rgba(0,88,190,0.4)]" />
                          )}
                          <span className="flex-1">{parseInlineFormatting(cleanItem, onCitationClick)}</span>
                        </li>
                      );
                    })}
                  </ul>
                );
              }

              // F. Mixed Paragraph / partial lists
              if (lines.length > 1 && lines.some(l => l.trim().match(/^([*\-•]|\d+\.)\s+/))) {
                return (
                  <div key={`mix-${bIdx}`} className="flex flex-col gap-2.5 text-[14px] text-[#334155] leading-relaxed my-1">
                    {lines.map((line, lIdx) => {
                      const trimmed = line.trim();
                      const numMatch = trimmed.match(/^(\d+\.)\s+/);
                      const numStr = numMatch ? numMatch[1] : null;
                      if (trimmed.match(/^([*\-•]|\d+\.)\s+/)) {
                        return (
                          <div key={lIdx} className="flex items-start gap-2.5 pl-1 my-0.5">
                            {numStr ? (
                              <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1 rounded-md bg-[#eff4ff] text-[#0058be] font-bold text-[12.5px] border border-[#0058be]/20 mt-0.5 shrink-0 shadow-sm">{numStr}</span>
                            ) : (
                              <span className="w-1.5 h-1.5 rounded-full bg-[#0058be] mt-2 shrink-0 shadow-[0_0_6px_rgba(0,88,190,0.4)]" />
                            )}
                            <span className="flex-1">{parseInlineFormatting(trimmed.replace(/^([*\-•]|\d+\.)\s*/, ""), onCitationClick)}</span>
                          </div>
                        );
                      }
                      if (trimmed.startsWith("**") && trimmed.endsWith("**") && trimmed.length < 90 && !trimmed.includes(". ")) {
                        return <div key={lIdx} className="font-bold text-[#0f172a] text-[14.5px] mt-1.5">{parseInlineFormatting(trimmed, onCitationClick)}</div>;
                      }
                      if (trimmed.endsWith("?") || trimmed.endsWith(":") || trimmed.match(/^(Khuyến nghị|Tóm tắt|Tại sao|Lý do|Ví dụ|Đề xuất|Phần \d+|Chương \d+)/i)) {
                        return <div key={lIdx} className="font-bold text-[#0f172a] text-[15px] mt-2 pt-1 border-t border-slate-100 first:border-none first:mt-0">{parseInlineFormatting(trimmed, onCitationClick)}</div>;
                      }
                      return <p key={lIdx}>{parseInlineFormatting(trimmed, onCitationClick)}</p>;
                    })}
                  </div>
                );
              }

              // G. Default Paragraph
              return (
                <p key={`p-${bIdx}`} className="text-[14px] text-[#334155] leading-relaxed">
                  {parseInlineFormatting(trimmedBlock, onCitationClick)}
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
  const [messages, setMessages] = React.useState<{ role: string; content: string; attachedFile?: { name: string; size: number; fileUrl?: string } }[]>([])
  const [isTyping, setIsTyping] = React.useState(false)
  const bottomRef = React.useRef<HTMLDivElement>(null)

  const [realSourceReferences, setRealSourceReferences] = React.useState<any[]>([])
  const [sessionId, setSessionId] = React.useState(() => typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `session-${Date.now()}`)
  const [chatSessions, setChatSessions] = React.useState<any[]>([])
  const [editingSessionId, setEditingSessionId] = React.useState<string | null>(null)
  const [editingTitle, setEditingTitle] = React.useState("")
  const [selectedCitationModal, setSelectedCitationModal] = React.useState<any | null>(null)
  const [showSessionsSidebar, setShowSessionsSidebar] = React.useState(true)

  const [realAttachedDoc, setRealAttachedDoc] = React.useState<{ id: string, title: string } | null>(null)
  const [isDocAttached, setIsDocAttached] = React.useState(false)

  // Universal File Upload State
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [uploadedFile, setUploadedFile] = React.useState<{ name: string; size: number; fileUrl: string; fileHash?: string; mimeType: string } | null>(null)
  const [isUploadingFile, setIsUploadingFile] = React.useState(false)
  const [uploadFileProgress, setUploadFileProgress] = React.useState(0)

  // Library Picker Modal State
  const [showLibraryPicker, setShowLibraryPicker] = React.useState(false)
  const [libraryDocs, setLibraryDocs] = React.useState<any[]>([])
  const [libraryLoading, setLibraryLoading] = React.useState(false)
  const [librarySearch, setLibrarySearch] = React.useState("")

  const fetchChatSessions = React.useCallback(() => {
    if (!token) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/api/ai/sessions`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setChatSessions(data)
      })
      .catch(console.error)
  }, [token]);

  React.useEffect(() => {
    fetchChatSessions();
  }, [fetchChatSessions]);

  const loadSessionHistory = async (id: string) => {
    setSessionId(id);
    setMessages([]);
    setRealSourceReferences([]);
    setUploadedFile(null);
    if (!token) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/api/ai/sessions/${id}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) {
        setMessages(data.map((m: any) => ({
          role: m.sender ? m.sender.toLowerCase() : "user",
          content: m.message,
          attachedFile: m.attachedFile ? { name: m.attachedFile.name, size: m.attachedFile.size || 0, fileUrl: m.attachedFile.url } : undefined
        })));
        const allCits: any[] = [];
        data.forEach((m: any) => {
          if (m.citations && Array.isArray(m.citations)) {
            m.citations.forEach((c: any, idx: number) => {
              allCits.push({
                id: c.id || idx,
                citationNumber: allCits.length + 1,
                author: c.document?.title || "Tài liệu",
                title: c.document?.title || "Tài liệu đính kèm",
                excerpt: c.textExcerpt || "",
                tags: [`Tr. ${c.pageNumber || 1}`]
              });
            });
          }
        });
        if (allCits.length > 0) setRealSourceReferences(allCits);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRenameSession = async (id: string, newTitle: string) => {
    if (!newTitle.trim() || !token) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/api/ai/sessions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: newTitle.trim() })
      });
      if (res.ok) {
        setChatSessions(prev => prev.map(s => s.id === id ? { ...s, title: newTitle.trim() } : s));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setEditingSessionId(null);
    }
  };

  const handleDeleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Bạn có chắc chắn muốn xóa cuộc trò chuyện này? Toàn bộ tin nhắn và trích dẫn sẽ bị xóa vĩnh viễn.")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/api/ai/sessions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setChatSessions(prev => prev.filter(s => s.id !== id));
        if (id === sessionId) {
          const newId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `session-${Date.now()}`;
          setSessionId(newId);
          setMessages([]);
          setRealSourceReferences([]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportChat = () => {
    if (messages.length === 0) return;
    const currentSessionTitle = chatSessions.find(s => s.id === sessionId)?.title || "Cuộc trò chuyện Lumis AI";
    const content = messages.map(m => `### ${m.role === "user" ? "🧑 Bạn" : "🤖 Lumis AI"}\n${m.content}\n`).join("\n---\n\n");
    const blob = new Blob([`# ${currentSessionTitle}\nPhiên ID: ${sessionId}\nNgày xuất: ${new Date().toLocaleString('vi-VN')}\n\n---\n\n${content}`], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Lumis-Chat-${sessionId.slice(0, 8)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  React.useEffect(() => {
    if (docId) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/api/documents/${docId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
        .then(res => res.json())
        .then(data => {
          if (data.id) {
            // Keep the inspector display state
            setRealAttachedDoc({ id: data.id, title: data.title })
            setIsDocAttached(true)

            // Also inject as uploadedFile so the existing "attached file" flow is used:
            // - file shows as blue bubble in chat UI
            // - file is stored in session via [ATTACHED_FILE:...] marker
            // - backend reads full file content and uses the rich system prompt
            if (data.fileUrl) {
              const ext = data.mimeType?.includes("pdf")
                ? ".pdf"
                : data.mimeType?.includes("word") || data.mimeType?.includes("document")
                  ? ".docx"
                  : data.mimeType?.includes("text")
                    ? ".txt"
                    : ""
              const fileName = data.title.endsWith(ext) ? data.title : `${data.title}${ext}`
              setUploadedFile({
                name: fileName,
                size: data.fileSize || 0,
                fileUrl: data.fileUrl,
                fileHash: data.fileHash,
                mimeType: data.mimeType || "application/pdf"
              })
            }
          }
        })
        .catch(console.error)
    }
  }, [docId, token])

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  const openLibraryPicker = async () => {
    setShowLibraryPicker(true)
    setLibrarySearch("")
    if (libraryDocs.length > 0) return // already loaded
    setLibraryLoading(true)
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/api/documents?pageSize=50`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      )
      const data = await res.json()
      if (Array.isArray(data.items)) setLibraryDocs(data.items)
    } catch (e) {
      console.error(e)
    } finally {
      setLibraryLoading(false)
    }
  }

  const handleSelectLibraryDoc = (doc: any) => {
    if (!doc.fileUrl) return
    const ext = doc.mimeType?.includes("pdf")
      ? ".pdf"
      : doc.mimeType?.includes("word") || doc.mimeType?.includes("document")
        ? ".docx"
        : doc.mimeType?.includes("text")
          ? ".txt"
          : ""
    const fileName = doc.title.endsWith(ext) ? doc.title : `${doc.title}${ext}`
    setUploadedFile({
      name: fileName,
      size: doc.fileSize || 0,
      fileUrl: doc.fileUrl,
      fileHash: doc.fileHash,
      mimeType: doc.mimeType || "application/pdf",
    })
    setShowLibraryPicker(false)
    setLibrarySearch("")
  }

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
      attachedFile: currentUploadedFile ? { name: currentUploadedFile.name, size: currentUploadedFile.size, fileUrl: currentUploadedFile.fileUrl } : undefined
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
      fetchChatSessions();

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
        className="shrink-0 flex items-center px-6 py-3 border-b border-[#c2c6d6]/30 bg-white/80 backdrop-blur-sm"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <motion.button
          onClick={() => setShowSessionsSidebar(prev => !prev)}
          className="p-2 rounded-lg text-[#727785] transition-all hover:bg-white hover:text-[#121c2a] hover:shadow-sm border border-transparent hover:border-[#c2c6d6]/50"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title={showSessionsSidebar ? "Đóng thanh bên" : "Mở thanh bên"}
        >
          <PanelLeft size={22} strokeWidth={2} />
        </motion.button>
      </motion.div>

      {/* ── Main Area ── */}
      <div className="flex-1 overflow-hidden flex">

        {/* Sessions History Left Sidebar */}
        {showSessionsSidebar && (
          <div className="w-[280px] shrink-0 border-r border-[#c2c6d6]/30 bg-white flex flex-col overflow-hidden">
            <div className="p-4 border-b border-[#c2c6d6]/20 flex items-center justify-between">
              <button
                onClick={() => {
                  const newId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `session-${Date.now()}`;
                  setSessionId(newId);
                  setMessages([]);
                  setRealSourceReferences([]);
                  setUploadedFile(null);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-[#0058be] text-white rounded-xl text-[13px] font-bold shadow-sm hover:bg-[#2170e4] transition-all cursor-pointer"
              >
                <Plus size={16} />
                <span>Cuộc trò chuyện mới</span>
              </button>
            </div>
            <div className="px-4 py-2 bg-[#f8fafc] border-b border-[#c2c6d6]/20 text-[11px] font-bold uppercase tracking-wider text-[#727785] flex items-center gap-1.5">
              <History size={13} />
              <span>Lịch sử phiên ({chatSessions.length})</span>
            </div>
            <div className="flex-1 overflow-y-auto p-2.5 flex flex-col gap-1.5">
              {/* Unsaved current session stub — visible while typing before first API save */}
              {!chatSessions.some((s: any) => s.id === sessionId) && messages.length > 0 && (
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#eff4ff] border border-[#0058be]/40 text-[#0058be] font-bold shadow-sm">
                  <Sparkles size={14} className="text-[#0058be] shrink-0" />
                  <span className="truncate text-[13px] leading-tight">
                    {messages.find(m => m.role === "user")?.content?.slice(0, 40) || "Cuộc trò chuyện mới"}
                  </span>
                </div>
              )}
              {chatSessions.map((s: any) => {
                const isSelected = s.id === sessionId;
                return (
                  <div
                    key={s.id}
                    onClick={() => { if (editingSessionId !== s.id) loadSessionHistory(s.id); }}
                    className={`group relative flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${isSelected
                      ? "bg-[#eff4ff] border-[#0058be]/40 text-[#0058be] font-bold shadow-sm"
                      : "bg-white hover:bg-[#f8fafc] border-transparent hover:border-[#e2e8f0] text-[#334155]"
                      }`}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden flex-1 mr-2">
                      <Sparkles size={14} className={isSelected ? "text-[#0058be] shrink-0" : "text-[#94a3b8] shrink-0"} />
                      {editingSessionId === s.id ? (
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={e => setEditingTitle(e.target.value)}
                          onBlur={() => {
                            if (editingTitle.trim()) {
                              handleRenameSession(s.id, editingTitle);
                            } else {
                              setEditingSessionId(null);
                            }
                          }}
                          onKeyDown={e => {
                            if (e.key === "Enter") handleRenameSession(s.id, editingTitle);
                            if (e.key === "Escape") setEditingSessionId(null);
                          }}
                          onClick={e => e.stopPropagation()}
                          autoFocus
                          className="w-full text-[13px] px-2 py-1 rounded bg-white border border-[#0058be] outline-none text-[#121c2a]"
                        />
                      ) : (
                        <span className="truncate text-[13px] leading-tight">
                          {s.title || "Cuộc trò chuyện AI"}
                        </span>
                      )}
                    </div>
                    {editingSessionId !== s.id && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setEditingSessionId(s.id);
                            setEditingTitle(s.title || "");
                          }}
                          className="p-1 rounded hover:bg-[#e2e8f0] text-[#64748b] hover:text-[#0f172a] transition-colors"
                          title="Đổi tên"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          onClick={e => handleDeleteSession(s.id, e)}
                          className="p-1 rounded hover:bg-red-50 text-[#64748b] hover:text-red-500 transition-colors"
                          title="Xóa"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
              {chatSessions.length === 0 && messages.length === 0 && (
                <div className="text-center py-8 px-4 text-[#94a3b8] text-[12px]">
                  Bắt đầu trò chuyện để lưu lịch sử.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Center: Chat */}
        <div className="flex-1 flex flex-col px-6 md:px-12 pt-8 pb-6 overflow-y-auto max-w-[800px] mx-auto">

          {/* Chat History */}
          <div className="flex flex-col gap-5 flex-1 mb-6 overflow-y-auto">
            <AnimatePresence initial={false}>
              {messages.length === 0 && !isTyping && (
                <motion.div
                  key="empty"
                  className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto w-full px-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {isDocAttached && realAttachedDoc ? (
                    <div className="text-center">
                      <motion.div
                        animate={{ scale: [1, 1.06, 1], opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="inline-flex mb-3"
                      >
                        <Sparkles size={28} className="text-[#0058be]/40" />
                      </motion.div>
                      <p className="text-[#727785] text-[14px] font-medium">
                        Hỏi điều gì đó về "{realAttachedDoc.title}"...
                      </p>
                    </div>
                  ) : (
                    <div className="bg-white border-2 border-dashed border-[#c2c6d6]/60 rounded-[32px] p-10 w-full shadow-sm flex flex-col items-center text-center transition-all hover:border-[#0058be]/30 hover:bg-[#f8f9ff]/50">
                      <div className="w-16 h-16 bg-[#eff4ff] text-[#0058be] rounded-full flex items-center justify-center mb-5 shadow-sm shadow-[#0058be]/10">
                        <FileText size={28} />
                      </div>
                      <h3 className="text-[20px] font-bold text-[#121c2a] mb-2" style={{ fontFamily: "Geist, sans-serif" }}>Bắt đầu phân tích tài liệu</h3>
                      <p className="text-[#424754] text-[14px] mb-8 w-full max-w-[420px]">
                        Tải lên tệp PDF, DOCX từ máy tính hoặc chọn tài liệu từ thư viện để Lumis bắt đầu phân tích.
                      </p>
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-[420px]">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="flex-1 w-full py-3 px-4 bg-[#0058be] hover:bg-[#004ca3] text-white font-semibold text-[14px] rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-[#0058be]/20 hover:-translate-y-0.5 whitespace-nowrap"
                        >
                          <Upload size={18} />
                          Đính kèm tệp
                        </button>
                        <button
                          onClick={openLibraryPicker}
                          className="flex-1 w-full py-3 px-4 bg-white hover:bg-[#f8f9ff] text-[#0058be] border border-[#0058be]/20 font-semibold text-[14px] rounded-xl flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 shadow-sm whitespace-nowrap"
                        >
                          <BookOpen size={18} />
                          Chọn từ thư viện
                        </button>
                      </div>
                    </div>
                  )}
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
                      {renderFormattedContent(msg.content, (num) => setSelectedCitationModal(num))}
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
                    onClick={openLibraryPicker}
                    className="p-2 text-[#727785] rounded-lg relative"
                    whileHover={{ scale: 1.1, color: "#0058be", backgroundColor: "#eff4ff" }}
                    whileTap={{ scale: 0.9 }}
                    title="Chọn tài liệu từ thư viện"
                  >
                    <BookOpen size={17} />
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
                onClick={() => setSelectedCitationModal(ref)}
                className="bg-white border border-[#c2c6d6]/40 rounded-xl overflow-hidden shadow-sm cursor-pointer shrink-0"
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

      {/* ── Library Picker Modal ── */}
      <AnimatePresence>
        {showLibraryPicker && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLibraryPicker(false)}
          >
            <motion.div
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-[#c2c6d6]/50 flex flex-col max-h-[80vh]"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-6 py-4 bg-gradient-to-r from-[#0058be] to-[#1e6be6] text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <BookOpen size={20} />
                  <h3 className="text-[17px] font-bold tracking-tight">Chọn tài liệu từ thư viện</h3>
                </div>
                <button
                  onClick={() => setShowLibraryPicker(false)}
                  className="p-1.5 rounded-xl hover:bg-white/15 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Search */}
              <div className="px-5 py-3 border-b border-[#e2e8f0] shrink-0">
                <input
                  type="text"
                  value={librarySearch}
                  onChange={e => setLibrarySearch(e.target.value)}
                  placeholder="Tìm kiếm tài liệu..."
                  autoFocus
                  className="w-full px-4 py-2.5 rounded-xl border border-[#c2c6d6]/60 text-[14px] text-[#121c2a] placeholder:text-[#727785] outline-none focus:border-[#0058be]/50 focus:ring-2 focus:ring-[#0058be]/10 transition-all bg-[#f8fafc]"
                />
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
                {libraryLoading ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3 text-[#727785]">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles size={22} className="text-[#0058be]" />
                    </motion.div>
                    <span className="text-[13px]">Đang tải thư viện...</span>
                  </div>
                ) : libraryDocs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-2 text-[#727785]">
                    <FileText size={36} className="text-[#c2c6d6]" />
                    <p className="text-[14px] font-medium">Thư viện của bạn đang trống</p>
                    <p className="text-[12px] text-[#9ba3af]">Hãy tải lên tài liệu trước để sử dụng tính năng này.</p>
                  </div>
                ) : (() => {
                  const filtered = libraryDocs.filter(d =>
                    d.title?.toLowerCase().includes(librarySearch.toLowerCase())
                  )
                  return filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-[#727785]">
                      <p className="text-[14px]">Không tìm thấy tài liệu phù hợp.</p>
                    </div>
                  ) : filtered.map((doc: any) => {
                    const ext = doc.mimeType?.includes("pdf") ? "PDF"
                      : doc.mimeType?.includes("word") || doc.mimeType?.includes("document") ? "DOCX"
                      : doc.mimeType?.includes("text") ? "TXT"
                      : "FILE"
                    const hasFile = !!doc.fileUrl
                    return (
                      <button
                        key={doc.id}
                        onClick={() => handleSelectLibraryDoc(doc)}
                        disabled={!hasFile}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border text-left transition-all group
                          ${hasFile
                            ? "border-[#e2e8f0] hover:border-[#0058be]/40 hover:bg-[#eff4ff]/60 cursor-pointer"
                            : "border-[#e2e8f0] opacity-50 cursor-not-allowed bg-[#f8fafc]"
                          }`}
                      >
                        <div className="p-2 bg-[#eff4ff] rounded-xl text-[#0058be] group-hover:bg-[#0058be] group-hover:text-white transition-colors shrink-0">
                          <FileText size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-semibold text-[#121c2a] truncate leading-tight">{doc.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] font-bold text-[#0058be] bg-[#eff4ff] px-1.5 py-0.5 rounded-md">{ext}</span>
                            {doc.fileSize && (
                              <span className="text-[11px] text-[#9ba3af]">{formatBytes(doc.fileSize)}</span>
                            )}
                            {doc.subject && (
                              <span className="text-[11px] text-[#9ba3af] truncate">{doc.subject.name}</span>
                            )}
                            {!hasFile && (
                              <span className="text-[11px] text-orange-400 font-medium">Chưa có tệp</span>
                            )}
                          </div>
                        </div>
                        {hasFile && (
                          <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="px-3 py-1.5 bg-[#0058be] text-white text-[12px] font-bold rounded-xl">
                              Chọn
                            </div>
                          </div>
                        )}
                      </button>
                    )
                  })
                })()}
              </div>

              {/* Footer */}
              <div className="px-5 py-3 border-t border-[#e2e8f0] bg-[#f8fafc] flex items-center justify-between shrink-0">
                <span className="text-[12px] text-[#727785]">
                  {libraryDocs.length} tài liệu trong thư viện
                </span>
                <button
                  onClick={() => setShowLibraryPicker(false)}
                  className="px-4 py-2 rounded-xl border border-[#c2c6d6]/60 text-[13px] font-semibold text-[#424754] hover:bg-white transition-colors"
                >
                  Hủy
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Citation Detail Modal ── */}
      <AnimatePresence>
        {selectedCitationModal !== null && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedCitationModal(null)}
          >
            <motion.div
              className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden border border-[#c2c6d6]/50 flex flex-col max-h-[88vh]"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="px-8 py-5 bg-gradient-to-r from-[#0058be] to-[#1e6be6] text-white flex items-center justify-between shadow-md shrink-0">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-white/20 rounded-lg text-[13px] font-bold tracking-wide backdrop-blur-md shadow-sm">
                    #{typeof selectedCitationModal === "number" ? selectedCitationModal : selectedCitationModal.citationNumber || "1"}
                  </span>
                  <h3 className="text-[18px] font-bold truncate max-w-[650px] tracking-tight">
                    {typeof selectedCitationModal === "number"
                      ? (realSourceReferences.concat(sourceReferences).find(r => r.citationNumber === selectedCitationModal || r.id === selectedCitationModal)?.title || "Trích dẫn tài liệu")
                      : (selectedCitationModal.title || "Trích dẫn tài liệu")}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedCitationModal(null)}
                  className="p-1.5 rounded-xl hover:bg-white/15 transition-colors text-white"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-8 flex flex-col gap-6 overflow-y-auto">
                <div className="flex flex-col gap-1.5 bg-[#f8fafc] p-4 rounded-2xl border border-slate-200/80">
                  <span className="text-[11.5px] font-bold uppercase tracking-wider text-[#727785]">Tác giả / Nguồn tài liệu</span>
                  <p className="text-[15px] font-bold text-[#121c2a] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#0058be]" />
                    {typeof selectedCitationModal === "number"
                      ? (realSourceReferences.concat(sourceReferences).find(r => r.citationNumber === selectedCitationModal || r.id === selectedCitationModal)?.author || "Tài liệu hệ thống")
                      : (selectedCitationModal.author || "Tài liệu hệ thống")}
                  </p>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[12px] font-bold uppercase tracking-wider text-[#0058be] flex items-center gap-1.5">
                      <span className="w-1.5 h-4 bg-[#0058be] rounded-full" />
                      Đoạn trích dẫn chi tiết từ nghiên cứu
                    </span>
                    <span className="text-[12px] text-slate-400 font-medium italic">Nội dung gốc được AI tổng hợp & đối chiếu</span>
                  </div>
                  <div className="p-6 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] text-[15px] text-[#334155] leading-relaxed italic font-serif shadow-inner max-h-[45vh] overflow-y-auto whitespace-pre-wrap">
                    "{typeof selectedCitationModal === "number"
                      ? (realSourceReferences.concat(sourceReferences).find(r => r.citationNumber === selectedCitationModal || r.id === selectedCitationModal)?.excerpt || "Không có nội dung trích dẫn chi tiết.")
                      : (selectedCitationModal.excerpt || "Không có nội dung trích dẫn chi tiết.")}"
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-[#e2e8f0] mt-2 shrink-0">
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-[12.5px] font-semibold text-slate-500 mr-1">Thẻ phân loại:</span>
                    {(typeof selectedCitationModal === "number"
                      ? (realSourceReferences.concat(sourceReferences).find(r => r.citationNumber === selectedCitationModal || r.id === selectedCitationModal)?.tags || ["Tr. 1"])
                      : (selectedCitationModal.tags || ["Tr. 1"])
                    ).map((t: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-[#eff4ff] border border-[#0058be]/20 text-[#0058be] rounded-lg text-[12px] font-bold shadow-2xs">
                        {t}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => setSelectedCitationModal(null)}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#0058be] to-[#1e6be6] text-white text-[14px] font-bold hover:shadow-lg hover:shadow-[#0058be]/25 transition-all active:scale-95 cursor-pointer"
                  >
                    Đóng cửa sổ
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
