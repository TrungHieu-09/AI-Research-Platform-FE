"use client"

import * as React from "react"
import Link from "next/link"

export default function UploadDocumentPage() {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-20">
      <div className="max-w-[900px] mx-auto w-full">
        <header className="mb-12 md:hidden">
          <h1 className="text-[24px] font-semibold text-[#121c2a] tracking-tight">Upload Document</h1>
        </header>
        <header className="mb-12 hidden md:block">
          <h1 className="text-[32px] font-semibold text-[#121c2a] tracking-tight">Upload Document</h1>
        </header>

        {/* Upload Container */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white/50 rounded-[24px] p-6 md:p-12 shadow-[0_10px_40px_rgba(31,41,55,0.04)] mb-12 relative overflow-hidden">
          {/* Subtle AI Background element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#316bf3]/20 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
          
          {/* Drag & Drop Zone */}
          <div className="border-2 border-dashed border-[#c2c6d5] hover:border-[#0058be]/50 bg-[#f8f9ff] rounded-xl p-12 flex flex-col items-center justify-center text-center transition-all duration-300 group cursor-pointer h-64 mb-6">
            <div className="w-16 h-16 rounded-full bg-[#eff3ff] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 group-hover:bg-[#0058be]/20">
              <span className="material-symbols-outlined text-[32px] text-[#0058be]">cloud_upload</span>
            </div>
            <h3 className="text-[24px] font-semibold text-[#121c2a] mb-1">Drag & drop your file here</h3>
            <p className="text-[16px] text-[#424753] mb-6">or click to browse from your computer</p>
            <p className="text-[12px] font-medium text-[#727784] uppercase tracking-wider">Supported formats: PDF, DOCX (Max 50MB)</p>
            <input className="hidden" id="file-upload" type="file" />
          </div>

          {/* Active Uploads List */}
          <div className="flex flex-col gap-3">
            {/* File Item */}
            <div className="bg-white border border-[#d9e3f7] rounded-lg p-3 flex items-center justify-between group">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="material-symbols-outlined text-[#ba1a1a]">picture_as_pdf</span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between mb-1">
                    <span className="text-[14px] font-semibold text-[#121c2a] tracking-wide truncate">neural_network_optimization_v2.pdf</span>
                    <span className="text-[12px] font-medium text-[#424753]">4.2 MB</span>
                  </div>
                  <div className="w-full bg-[#dfe9fc] rounded-full h-1.5 overflow-hidden">
                    <div className="bg-[#004191] h-1.5 rounded-full w-[45%] transition-all duration-500 relative">
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
              <button className="ml-6 p-1 text-[#727784] hover:text-[#ba1a1a] transition-colors rounded-full hover:bg-[#ffdad6]/50 opacity-0 group-hover:opacity-100 focus:opacity-100">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
          </div>
        </div>

        {/* Auto-detect Banner */}
        <div className="bg-[#eff3ff] border border-[#0058be]/20 rounded-lg p-3 flex items-center justify-between mb-12 animate-fade-in-up">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#0058be] text-[20px] animate-pulse">auto_awesome</span>
            <span className="text-[14px] text-[#121c2a]">We auto-extracted metadata from your PDF.</span>
          </div>
          <button className="text-[14px] font-semibold text-[#0058be] hover:text-[#0051d6] transition-colors">Review</button>
        </div>

        {/* Metadata Form */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white/50 rounded-[24px] p-6 md:p-12 shadow-[0_10px_40px_rgba(31,41,55,0.04)] mb-20">
          <h2 className="text-[24px] font-semibold text-[#121c2a] mb-6">Document Metadata</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-[14px] font-semibold tracking-wide text-[#121c2a] mb-1">Title</label>
              <input className="w-full h-12 px-3 rounded-lg border border-[#c2c6d5] bg-[#f8f9ff] focus:border-[#0058be] focus:ring-1 focus:ring-[#0058be] text-[14px] text-[#121c2a] transition-all outline-none" type="text" defaultValue="Towards Optimized Neural Architectures for Edge Devices" />
            </div>

            {/* Authors */}
            <div>
              <label className="block text-[14px] font-semibold tracking-wide text-[#121c2a] mb-1">Authors</label>
              <div className="min-h-[48px] p-1 border border-[#c2c6d5] bg-[#f8f9ff] rounded-lg flex flex-wrap gap-1 items-center focus-within:border-[#0058be] focus-within:ring-1 focus-within:ring-[#0058be] transition-all">
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#dfe9fc] rounded-md text-[14px] text-[#424753]">
                  E. Roberts
                  <button className="hover:text-[#ba1a1a]"><span className="material-symbols-outlined text-[14px]">close</span></button>
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#dfe9fc] rounded-md text-[14px] text-[#424753]">
                  M. Chen
                  <button className="hover:text-[#ba1a1a]"><span className="material-symbols-outlined text-[14px]">close</span></button>
                </span>
                <input className="flex-1 min-w-[100px] border-none bg-transparent h-8 text-[14px] focus:ring-0 px-1 outline-none" placeholder="Add author..." type="text" />
              </div>
            </div>

            {/* Year */}
            <div>
              <label className="block text-[14px] font-semibold tracking-wide text-[#121c2a] mb-1">Year</label>
              <input className="w-full h-12 px-3 rounded-lg border border-[#c2c6d5] bg-[#f8f9ff] focus:border-[#0058be] focus:ring-1 focus:ring-[#0058be] text-[14px] text-[#121c2a] transition-all outline-none" type="number" defaultValue="2024" />
            </div>

            {/* Collection */}
            <div>
              <label className="block text-[14px] font-semibold tracking-wide text-[#121c2a] mb-1">Collection</label>
              <div className="relative">
                <select className="w-full h-12 px-3 rounded-lg border border-[#c2c6d5] bg-[#f8f9ff] focus:border-[#0058be] focus:ring-1 focus:ring-[#0058be] text-[14px] text-[#121c2a] appearance-none transition-all outline-none" defaultValue="Machine Learning">
                  <option value="">Select a collection</option>
                  <option value="Thesis Research">Thesis Research</option>
                  <option value="Machine Learning">Machine Learning</option>
                  <option value="Neuroscience">Neuroscience</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#727784]">expand_more</span>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-[14px] font-semibold tracking-wide text-[#121c2a] mb-1">Tags</label>
              <div className="min-h-[48px] p-1 border border-[#c2c6d5] bg-[#f8f9ff] rounded-lg flex flex-wrap gap-1 items-center focus-within:border-[#0058be] focus-within:ring-1 focus-within:ring-[#0058be] transition-all">
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#dfe9fc] text-[#0058be] rounded-md text-[12px] font-medium">
                  #neural-networks
                  <button className="hover:text-[#ba1a1a]"><span className="material-symbols-outlined text-[14px]">close</span></button>
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#ffdad6] text-[#93000a] rounded-md text-[12px] font-medium">
                  #important
                  <button className="hover:text-[#ba1a1a]"><span className="material-symbols-outlined text-[14px]">close</span></button>
                </span>
                <input className="flex-1 min-w-[100px] border-none bg-transparent h-8 text-[14px] focus:ring-0 px-1 outline-none" placeholder="Add tag..." type="text" />
              </div>
            </div>

            {/* Abstract */}
            <div className="md:col-span-2">
              <label className="block text-[14px] font-semibold tracking-wide text-[#121c2a] mb-1">Abstract / Notes</label>
              <textarea className="w-full p-3 rounded-lg border border-[#c2c6d5] bg-[#f8f9ff] focus:border-[#0058be] focus:ring-1 focus:ring-[#0058be] text-[14px] text-[#121c2a] transition-all resize-y outline-none" rows={4} defaultValue="This paper explores novel methods for optimizing large neural networks specifically for deployment on edge devices with limited computational resources, demonstrating a 40% reduction in latency without significant accuracy loss." />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t border-[#d9e3f7]">
          <Link href="/user/library" className="px-6 py-2 rounded-[16px] text-[14px] font-semibold tracking-wide text-[#424753] hover:bg-[#f1f5f9] transition-colors h-12 flex items-center justify-center">
            Cancel
          </Link>
          <button className="px-12 py-2 rounded-[16px] text-[14px] font-semibold tracking-wide text-white bg-[#0058be] hover:bg-[#2170e4] transition-all h-12 flex items-center justify-center gap-1 shadow-[0_4px_14px_rgba(0,65,145,0.2)] hover:shadow-[0_6px_20px_rgba(0,65,145,0.3)] hover:-translate-y-0.5">
            <span className="material-symbols-outlined text-[20px]">cloud_done</span>
            Upload & Save
          </button>
        </div>
      </div>
    </div>
  )
}
