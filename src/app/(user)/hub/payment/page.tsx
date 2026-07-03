"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function PaymentManagementPage() {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-20">
      {/* Page Header */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="font-semibold text-[24px] md:text-[32px] tracking-[-0.02em] text-[#121c2a]">Payment Management</h2>
          <p className="font-normal text-[14px] text-[#424753] mt-1">Manage your AI capabilities, storage packages, and billing information.</p>
        </div>
      </div>

      {/* Current Plans Overview */}
      <div className="mb-10">
        <h3 className="font-medium text-[18px] text-[#121c2a] mb-4">Current Packages</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* AI Package */}
          <div className="bg-[#f8f9ff] rounded-xl border border-[#c2c6d6]/30 p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-2 text-[#121c2a]">
                <div className="w-8 h-8 rounded-lg bg-[#e0e7ff] flex items-center justify-center text-[#004191]">
                  <span className="material-symbols-outlined text-[18px]">psychology</span>
                </div>
                <span className="font-semibold text-[15px] tracking-wide uppercase">AI Package</span>
              </div>
              <span className="px-2.5 py-1 bg-[#dfe9fc] text-[#004191] rounded-md font-medium text-[11px] uppercase tracking-wider">Free Plan</span>
            </div>
            <div className="mb-3 flex justify-between items-end">
              <span className="font-medium text-[24px] leading-[1.3] text-[#004191]">105 <span className="font-normal text-[14px] text-[#424753]">Queries</span></span>
              <span className="font-normal text-[14px] text-[#424753]">of 500 / month</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-[#dfe9fc] rounded-full h-2">
              <div className="bg-[#004191] h-2 rounded-full w-[21%]"></div>
            </div>
          </div>
          
          {/* Storage Package */}
          <div className="bg-[#f8f9ff] rounded-xl border border-[#c2c6d6]/30 p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-2 text-[#121c2a]">
                <div className="w-8 h-8 rounded-lg bg-[#e0e7ff] flex items-center justify-center text-[#004191]">
                  <span className="material-symbols-outlined text-[18px]">cloud</span>
                </div>
                <span className="font-semibold text-[15px] tracking-wide uppercase">Storage Package</span>
              </div>
              <span className="px-2.5 py-1 bg-[#dfe9fc] text-[#004191] rounded-md font-medium text-[11px] uppercase tracking-wider">Free Plan</span>
            </div>
            <div className="mb-3 flex justify-between items-end">
              <span className="font-medium text-[24px] leading-[1.3] text-[#004191]">2.1 <span className="font-normal text-[14px] text-[#424753]">GB</span></span>
              <span className="font-normal text-[14px] text-[#424753]">of 5 GB</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-[#dfe9fc] rounded-full h-2">
              <div className="bg-[#004191] h-2 rounded-full w-[42%]"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade Options */}
      <div>
        <h3 className="font-medium text-[18px] text-[#121c2a] mb-4">Upgrade Your Workspace</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Plan 1: Free */}
          <div className="bg-[#ffffff] rounded-xl border border-[#c2c6d6]/30 p-6 flex flex-col hover:border-[#004191]/30 transition-colors shadow-sm">
            <div className="mb-4">
              <h4 className="font-semibold text-[18px] text-[#121c2a]">Basic</h4>
              <p className="text-[13px] text-[#424753] mt-1 h-10">Essential tools for individual researchers.</p>
            </div>
            <div className="mb-6">
              <span className="font-bold text-[32px] text-[#121c2a]">$0</span>
              <span className="text-[14px] text-[#424753]">/month</span>
            </div>
            <div className="space-y-3 mb-8 flex-1">
              <div className="flex items-center gap-2 text-[13px] text-[#424753]">
                <span className="material-symbols-outlined text-[16px] text-[#004191]">check_circle</span>
                500 AI Queries / month
              </div>
              <div className="flex items-center gap-2 text-[13px] text-[#424753]">
                <span className="material-symbols-outlined text-[16px] text-[#004191]">check_circle</span>
                5 GB Cloud Storage
              </div>
              <div className="flex items-center gap-2 text-[13px] text-[#424753]">
                <span className="material-symbols-outlined text-[16px] text-[#004191]">check_circle</span>
                Basic Support
              </div>
            </div>
            <button className="w-full bg-[#f1f5f9] text-[#424753] font-semibold text-[13px] py-2.5 rounded-lg border border-[#c2c6d6]/40 cursor-not-allowed">
              Current Plan
            </button>
          </div>

          {/* Plan 2: Storage Only */}
          <div className="bg-[#ffffff] rounded-xl border border-[#c2c6d6]/30 p-6 flex flex-col hover:border-[#004191]/30 transition-colors shadow-sm">
            <div className="mb-4">
              <h4 className="font-semibold text-[18px] text-[#121c2a]">Storage Pro</h4>
              <p className="text-[13px] text-[#424753] mt-1 h-10">For heavy document and data management.</p>
            </div>
            <div className="mb-6">
              <span className="font-bold text-[32px] text-[#121c2a]">$5</span>
              <span className="text-[14px] text-[#424753]">/month</span>
            </div>
            <div className="space-y-3 mb-8 flex-1">
              <div className="flex items-center gap-2 text-[13px] text-[#424753]">
                <span className="material-symbols-outlined text-[16px] text-[#004191]">check_circle</span>
                500 AI Queries / month
              </div>
              <div className="flex items-center gap-2 text-[13px] text-[#121c2a] font-medium">
                <span className="material-symbols-outlined text-[16px] text-[#004191]">rocket_launch</span>
                100 GB Cloud Storage
              </div>
              <div className="flex items-center gap-2 text-[13px] text-[#424753]">
                <span className="material-symbols-outlined text-[16px] text-[#004191]">check_circle</span>
                Priority Support
              </div>
            </div>
            <Link href="/hub/payment/checkout?plan=storage" className="w-full bg-[#ffffff] text-[#004191] border border-[#004191] font-semibold text-[13px] py-2.5 rounded-lg hover:bg-[#f0f7ff] transition-colors text-center block">
              Upgrade Storage
            </Link>
          </div>

          {/* Plan 3: AI Only */}
          <div className="bg-[#ffffff] rounded-xl border border-[#c2c6d6]/30 p-6 flex flex-col hover:border-[#004191]/30 transition-colors shadow-sm">
            <div className="mb-4">
              <h4 className="font-semibold text-[18px] text-[#121c2a]">AI Pro</h4>
              <p className="text-[13px] text-[#424753] mt-1 h-10">Unleash advanced AI synthesis and analysis.</p>
            </div>
            <div className="mb-6">
              <span className="font-bold text-[32px] text-[#121c2a]">$10</span>
              <span className="text-[14px] text-[#424753]">/month</span>
            </div>
            <div className="space-y-3 mb-8 flex-1">
              <div className="flex items-center gap-2 text-[13px] text-[#121c2a] font-medium">
                <span className="material-symbols-outlined text-[16px] text-[#004191]">rocket_launch</span>
                Unlimited AI Queries
              </div>
              <div className="flex items-center gap-2 text-[13px] text-[#121c2a] font-medium">
                <span className="material-symbols-outlined text-[16px] text-[#004191]">rocket_launch</span>
                Advanced Models (GPT-4)
              </div>
              <div className="flex items-center gap-2 text-[13px] text-[#424753]">
                <span className="material-symbols-outlined text-[16px] text-[#004191]">check_circle</span>
                5 GB Cloud Storage
              </div>
            </div>
            <Link href="/hub/payment/checkout?plan=ai" className="w-full bg-[#ffffff] text-[#004191] border border-[#004191] font-semibold text-[13px] py-2.5 rounded-lg hover:bg-[#f0f7ff] transition-colors text-center block">
              Upgrade AI
            </Link>
          </div>

          {/* Plan 4: Both */}
          <div className="bg-[#f4f8ff] rounded-xl border-2 border-[#004191] p-6 flex flex-col relative shadow-[0px_8px_24px_rgba(0,65,145,0.12)] scale-[1.02]">
            <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-3">
              <span className="bg-[#004191] text-white text-[10px] font-bold uppercase tracking-wider py-1 px-3 rounded-full shadow-md">
                Best Value
              </span>
            </div>
            <div className="mb-4">
              <h4 className="font-semibold text-[18px] text-[#004191]">Ultimate</h4>
              <p className="text-[13px] text-[#424753] mt-1 h-10">The complete research workstation.</p>
            </div>
            <div className="mb-6">
              <span className="font-bold text-[32px] text-[#121c2a]">$12</span>
              <span className="text-[14px] text-[#424753]">/month</span>
            </div>
            <div className="space-y-3 mb-8 flex-1">
              <div className="flex items-center gap-2 text-[13px] text-[#121c2a] font-medium">
                <span className="material-symbols-outlined text-[16px] text-[#004191]">rocket_launch</span>
                Unlimited AI Queries & Models
              </div>
              <div className="flex items-center gap-2 text-[13px] text-[#121c2a] font-medium">
                <span className="material-symbols-outlined text-[16px] text-[#004191]">rocket_launch</span>
                100 GB Cloud Storage
              </div>
              <div className="flex items-center gap-2 text-[13px] text-[#121c2a] font-medium">
                <span className="material-symbols-outlined text-[16px] text-[#004191]">star</span>
                24/7 Dedicated Support
              </div>
            </div>
            <Link href="/hub/payment/checkout?plan=ultimate" className="w-full bg-gradient-to-br from-[#004191] to-[#0051d6] text-white font-semibold text-[13px] py-2.5 rounded-lg hover:opacity-90 transition-opacity shadow-md text-center block">
              Upgrade to Ultimate
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
