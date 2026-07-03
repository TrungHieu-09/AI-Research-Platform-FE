"use client"

import * as React from "react"
import Link from "next/link"

export default function HubDashboardPage() {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-20">
      {/* Page Header */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="font-semibold text-[24px] md:text-[32px] tracking-[-0.02em] text-[#121c2a]">Command Center</h2>
          <p className="font-normal text-[14px] text-[#424753] mt-1">Overview of your active workspace and AI synthesis tasks.</p>
        </div>
        <button className="bg-gradient-to-br from-[#004191] to-[#0051d6] text-white px-6 py-3 rounded-lg flex items-center gap-3 hover:opacity-90 transition-opacity shadow-[0px_4px_14px_rgba(0,65,145,0.25)]">
          <span className="material-symbols-outlined text-[20px]">upload_file</span>
          <span className="font-semibold text-[14px] tracking-widest uppercase">Ingest Document</span>
        </button>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* TOP ROW */}
        {/* Library Statistics (Col span 8) */}
        <div className="col-span-1 md:col-span-8 grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Stat 1 */}
          <div className="bg-[#f8f9ff] rounded-xl border border-[#c2c6d6]/30 p-6 flex flex-col justify-between h-full">
            <div className="flex items-center gap-1 text-[#424753] mb-3">
              <span className="material-symbols-outlined text-[20px]">description</span>
              <span className="font-medium text-[12px] uppercase tracking-wider">Total Docs</span>
            </div>
            <div className="font-bold text-[48px] leading-[1.1] tracking-[-0.04em] text-[#004191]">248</div>
          </div>
          {/* Stat 2 */}
          <div className="bg-[#f8f9ff] rounded-xl border border-[#c2c6d6]/30 p-6 flex flex-col justify-between h-full">
            <div className="flex items-center gap-1 text-[#424753] mb-3">
              <span className="material-symbols-outlined text-[20px]">folder</span>
              <span className="font-medium text-[12px] uppercase tracking-wider">Collections</span>
            </div>
            <div className="font-bold text-[48px] leading-[1.1] tracking-[-0.04em] text-[#004191]">14</div>
          </div>
          {/* Stat 3 */}
          <div className="bg-[#f8f9ff] rounded-xl border border-[#c2c6d6]/30 p-6 flex flex-col justify-between h-full">
            <div className="flex items-center gap-1 text-[#424753] mb-3">
              <span className="material-symbols-outlined text-[20px]">label</span>
              <span className="font-medium text-[12px] uppercase tracking-wider">Active Tags</span>
            </div>
            <div className="font-bold text-[48px] leading-[1.1] tracking-[-0.04em] text-[#004191]">62</div>
          </div>
          {/* Stat 4 */}
          <div className="bg-[#eff3ff] rounded-xl border border-[#004191]/20 p-6 flex flex-col justify-between h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <span className="material-symbols-outlined filled text-[80px] text-[#004191]" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
            </div>
            <div className="flex items-center gap-1 text-[#004191] mb-3 relative z-10">
              <span className="material-symbols-outlined text-[20px]">forum</span>
              <span className="font-medium text-[12px] uppercase tracking-wider">AI Convos</span>
            </div>
            <div className="font-bold text-[48px] leading-[1.1] tracking-[-0.04em] text-[#004191] relative z-10">105</div>
          </div>
        </div>

        {/* Storage Usage Card (Col span 4) */}
        <div className="col-span-1 md:col-span-4 bg-[#f8f9ff] rounded-xl border border-[#c2c6d6]/30 p-6 flex flex-col justify-between h-full">
          <div>
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-1 text-[#121c2a]">
                <span className="material-symbols-outlined text-[20px]">cloud</span>
                <span className="font-semibold text-[14px] tracking-widest uppercase">Storage Usage</span>
              </div>
              <span className="px-2 py-1 bg-[#dfe9fc] text-[#424753] rounded font-medium text-[10px] uppercase">Free Plan</span>
            </div>
            <div className="mb-3 flex justify-between items-end">
              <span className="font-medium text-[24px] leading-[1.3] text-[#004191]">2.1 <span className="font-normal text-[14px] text-[#424753]">GB</span></span>
              <span className="font-normal text-[14px] text-[#424753]">of 5GB</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-[#dfe9fc] rounded-full h-2 mb-6 overflow-hidden">
              <div className="bg-[#004191] h-2 rounded-full w-[42%]"></div>
            </div>
          </div>
          <button className="w-full border border-[#004191] text-[#004191] font-semibold text-[14px] tracking-widest uppercase py-3 rounded-lg hover:bg-[#004191]/5 transition-colors flex justify-center items-center gap-1">
            <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
            Upgrade Plan
          </button>
        </div>

        {/* MIDDLE ROW */}
        {/* AI Research Insights (Col span 5) */}
        <div className="col-span-1 md:col-span-5 bg-[#ffffff] border border-[#004191]/30 rounded-xl p-6 flex flex-col h-[500px] relative ai-border-glow shadow-[0px_10px_40px_rgba(31,41,55,0.04)]">
          <div className="flex items-center gap-3 mb-6 pb-3 border-b border-[#c2c6d6]/20">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0058be] to-[#316bf3] flex items-center justify-center text-white shadow-sm">
              <span className="material-symbols-outlined filled text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            </div>
            <h3 className="font-medium text-[24px] leading-[1.3] text-[#121c2a]">AI Synthesis Insights</h3>
          </div>
          <div className="flex-1 overflow-y-auto pr-3 space-y-6 custom-scrollbar">
            {/* Insight Block 1 */}
            <div>
              <div className="flex items-center gap-1 text-[#004191] mb-1">
                <span className="material-symbols-outlined text-[16px]">summarize</span>
                <span className="font-medium text-[12px] uppercase font-bold">Recent Ingestion Summary</span>
              </div>
              <p className="font-normal text-[14px] text-[#424753] leading-relaxed bg-[#004191]/5 p-3 rounded-lg border border-[#004191]/10">
                Based on the last 4 uploaded papers regarding "Neural Plasticity", current literature strongly correlates immediate post-trauma intervention with accelerated synaptic regeneration.
              </p>
            </div>
            {/* Insight Block 2 */}
            <div>
              <div className="flex items-center gap-1 text-[#924700] mb-1">
                <span className="material-symbols-outlined text-[16px]">troubleshoot</span>
                <span className="font-medium text-[12px] uppercase font-bold">Identified Research Gaps</span>
              </div>
              <ul className="space-y-1">
                <li className="flex items-start gap-1 font-normal text-[14px] text-[#424753]">
                  <span className="material-symbols-outlined text-[14px] mt-[2px] text-[#727784]">arrow_right</span>
                  Lack of longitudinal studies exceeding 5 years in cohort A.
                </li>
                <li className="flex items-start gap-1 font-normal text-[14px] text-[#424753]">
                  <span className="material-symbols-outlined text-[14px] mt-[2px] text-[#727784]">arrow_right</span>
                  Conflicting methodologies in biomarker extraction across recent meta-analyses.
                </li>
              </ul>
            </div>
            {/* Insight Block 3 */}
            <div>
              <div className="flex items-center gap-1 text-[#0051d6] mb-1">
                <span className="material-symbols-outlined text-[16px]">compare_arrows</span>
                <span className="font-medium text-[12px] uppercase font-bold">Cross-Paper Correlation</span>
              </div>
              <div className="bg-[#f8f9ff] rounded-lg border border-[#c2c6d6]/30 p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-[12px] text-[#121c2a] truncate w-[40%]">Smith et al. (2023)</span>
                  <div className="flex-1 border-t border-dashed border-[#c2c6d6]/50 mx-1"></div>
                  <span className="font-medium text-[12px] text-[#121c2a] truncate w-[40%] text-right">Chen &amp; Doe (2024)</span>
                </div>
                <p className="font-normal text-[12px] text-[#424753] text-center">87% methodological overlap detected.</p>
              </div>
            </div>
          </div>
          <div className="mt-6 pt-3 border-t border-[#c2c6d6]/20">
            <button className="w-full text-[#004191] font-semibold text-[14px] tracking-widest flex justify-center items-center gap-1 hover:underline">
              Generate Full Report
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Recent Documents (Col span 7) */}
        <div className="col-span-1 md:col-span-7 bg-[#f8f9ff] border border-[#c2c6d6]/30 rounded-xl flex flex-col h-[500px]">
          <div className="p-6 border-b border-[#c2c6d6]/20 flex justify-between items-center bg-[#ffffff] rounded-t-xl">
            <h3 className="font-medium text-[24px] leading-[1.3] text-[#121c2a] flex items-center gap-3">
              <span className="material-symbols-outlined text-[#727784]">history</span>
              Recent Documents
            </h3>
            <button className="text-[#004191] font-medium text-[12px] hover:underline">View All</button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#ffffff] sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="py-3 px-6 font-medium text-[12px] text-[#424753] font-medium uppercase tracking-wider w-[50%]">Document Name</th>
                  <th className="py-3 px-6 font-medium text-[12px] text-[#424753] font-medium uppercase tracking-wider">Date Added</th>
                  <th className="py-3 px-6 font-medium text-[12px] text-[#424753] font-medium uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c2c6d6]/20">
                {/* Row 1 */}
                <tr className="hover:bg-[#004191]/5 transition-colors group">
                  <td className="py-3 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-[#d9e3f7] flex items-center justify-center text-[#ba1a1a]">
                        <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                      </div>
                      <div>
                        <p className="font-normal text-[14px] text-[#121c2a] font-medium truncate max-w-[200px] lg:max-w-[300px]">Mechanisms of Synaptic Plasticity.pdf</p>
                        <div className="flex gap-1 mt-[2px]">
                          <span className="px-1.5 py-0.5 bg-[#f0f7ff] rounded text-[10px] font-medium text-[#424753]">Neuroscience</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-6 font-normal text-[14px] text-[#424753]">Today, 10:42 AM</td>
                  <td className="py-3 px-6 text-right">
                    <div className="flex justify-end items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="w-8 h-8 rounded-full hover:bg-[#f1f5f9] flex items-center justify-center text-[#424753] tooltip" title="Preview">
                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                      </button>
                      <button className="w-8 h-8 rounded-full hover:bg-[#3b82f6] hover:text-[#ffffff] flex items-center justify-center text-[#004191] tooltip" title="Ask AI">
                        <span className="material-symbols-outlined text-[18px]">psychology</span>
                      </button>
                      <button className="w-8 h-8 rounded-full hover:bg-[#f1f5f9] flex items-center justify-center text-[#424753] tooltip" title="Download">
                        <span className="material-symbols-outlined text-[18px]">download</span>
                      </button>
                    </div>
                  </td>
                </tr>
                {/* Row 2 */}
                <tr className="hover:bg-[#004191]/5 transition-colors group">
                  <td className="py-3 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-[#d9e3f7] flex items-center justify-center text-[#0051d6]">
                        <span className="material-symbols-outlined text-[18px]">article</span>
                      </div>
                      <div>
                        <p className="font-normal text-[14px] text-[#121c2a] font-medium truncate max-w-[200px] lg:max-w-[300px]">Cohort Analysis Data 2023.docx</p>
                        <div className="flex gap-1 mt-[2px]">
                          <span className="px-1.5 py-0.5 bg-[#f0f7ff] rounded text-[10px] font-medium text-[#424753]">Data</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-6 font-normal text-[14px] text-[#424753]">Yesterday</td>
                  <td className="py-3 px-6 text-right">
                    <div className="flex justify-end items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="w-8 h-8 rounded-full hover:bg-[#f1f5f9] flex items-center justify-center text-[#424753]">
                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                      </button>
                      <button className="w-8 h-8 rounded-full hover:bg-[#3b82f6] hover:text-[#ffffff] flex items-center justify-center text-[#004191]">
                        <span className="material-symbols-outlined text-[18px]">psychology</span>
                      </button>
                      <button className="w-8 h-8 rounded-full hover:bg-[#f1f5f9] flex items-center justify-center text-[#424753]">
                        <span className="material-symbols-outlined text-[18px]">download</span>
                      </button>
                    </div>
                  </td>
                </tr>
                {/* Row 3 */}
                <tr className="hover:bg-[#004191]/5 transition-colors group">
                  <td className="py-3 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-[#d9e3f7] flex items-center justify-center text-[#6e3400]">
                        <span className="material-symbols-outlined text-[18px]">description</span>
                      </div>
                      <div>
                        <p className="font-normal text-[14px] text-[#121c2a] font-medium truncate max-w-[200px] lg:max-w-[300px]">Literature Review Draft_v2.txt</p>
                        <div className="flex gap-1 mt-[2px]">
                          <span className="px-1.5 py-0.5 bg-[#f0f7ff] rounded text-[10px] font-medium text-[#424753]">Drafts</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-6 font-normal text-[14px] text-[#424753]">Oct 24, 2023</td>
                  <td className="py-3 px-6 text-right">
                    <div className="flex justify-end items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="w-8 h-8 rounded-full hover:bg-[#f1f5f9] flex items-center justify-center text-[#424753]">
                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                      </button>
                      <button className="w-8 h-8 rounded-full hover:bg-[#3b82f6] hover:text-[#ffffff] flex items-center justify-center text-[#004191]">
                        <span className="material-symbols-outlined text-[18px]">psychology</span>
                      </button>
                      <button className="w-8 h-8 rounded-full hover:bg-[#f1f5f9] flex items-center justify-center text-[#424753]">
                        <span className="material-symbols-outlined text-[18px]">download</span>
                      </button>
                    </div>
                  </td>
                </tr>
                {/* Row 4 */}
                <tr className="hover:bg-[#004191]/5 transition-colors group">
                  <td className="py-3 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-[#d9e3f7] flex items-center justify-center text-[#ba1a1a]">
                        <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                      </div>
                      <div>
                        <p className="font-normal text-[14px] text-[#121c2a] font-medium truncate max-w-[200px] lg:max-w-[300px]">Longitudinal Study of Behavior.pdf</p>
                        <div className="flex gap-1 mt-[2px]">
                          <span className="px-1.5 py-0.5 bg-[#f0f7ff] rounded text-[10px] font-medium text-[#424753]">Psychology</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-6 font-normal text-[14px] text-[#424753]">Oct 20, 2023</td>
                  <td className="py-3 px-6 text-right">
                    <div className="flex justify-end items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="w-8 h-8 rounded-full hover:bg-[#f1f5f9] flex items-center justify-center text-[#424753]">
                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                      </button>
                      <button className="w-8 h-8 rounded-full hover:bg-[#3b82f6] hover:text-[#ffffff] flex items-center justify-center text-[#004191]">
                        <span className="material-symbols-outlined text-[18px]">psychology</span>
                      </button>
                      <button className="w-8 h-8 rounded-full hover:bg-[#f1f5f9] flex items-center justify-center text-[#424753]">
                        <span className="material-symbols-outlined text-[18px]">download</span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
