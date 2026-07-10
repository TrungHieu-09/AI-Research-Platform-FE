import { Settings, Save, Shield, HardDrive, Cpu, Bell, Cloud } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-3xl font-bold tracking-tight text-[#121c2a] mb-1.5"
            style={{ fontFamily: "Geist, sans-serif" }}
          >
            System Settings
          </h1>
          <p className="text-[#424754] font-medium text-[14px]">
            Configure platform constraints, AI research assistant parameters, and moderation security policies.
          </p>
        </div>
        <button className="bg-[#0058be] hover:bg-[#2170e4] text-white px-8 py-3 rounded-2xl font-bold shadow-md shadow-[#0058be]/20 transition-all flex items-center gap-2 w-fit text-[14px]">
          <Save size={18} />
          <span>Save Changes</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
        {/* Storage & Files */}
        <div className="bg-white border border-[#c2c6d6]/40 p-8 rounded-3xl shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-[#eff4ff] text-[#0058be] rounded-2xl">
              <HardDrive size={22} />
            </div>
            <h2 className="text-xl font-bold text-[#121c2a]" style={{ fontFamily: "Geist, sans-serif" }}>
              Storage & Uploads
            </h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-[13px] font-bold text-[#424754] mb-2">Max File Size (MB)</label>
              <input 
                type="number" 
                defaultValue={50} 
                className="w-full bg-[#f8f9ff] border border-[#c2c6d6]/50 rounded-2xl px-4 py-3 text-[14px] text-[#121c2a] focus:border-[#0058be] outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-[13px] font-bold text-[#424754] mb-2">Allowed Extensions</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {['.pdf', '.docx', '.pptx', '.txt', '.png', '.jpg'].map(ext => (
                  <span key={ext} className="px-3 py-1 bg-[#eff4ff] text-[#0058be] rounded-lg text-[12px] font-bold">
                    {ext}
                  </span>
                ))}
              </div>
              <input 
                type="text" 
                placeholder="Add extension... (e.g. .zip)" 
                className="w-full bg-[#f8f9ff] border border-[#c2c6d6]/50 rounded-2xl px-4 py-3 text-[14px] text-[#121c2a] focus:border-[#0058be] outline-none transition-all"
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-[#f8f9ff] border border-[#c2c6d6]/40 rounded-2xl">
              <div>
                <p className="text-[14px] font-bold text-[#121c2a]">Cloud Deduplication</p>
                <p className="text-[12px] text-[#727785]">Prevent identical files from taking up space.</p>
              </div>
              <div className="w-12 h-6 bg-[#0058be] rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow" />
              </div>
            </div>
          </div>
        </div>

        {/* AI Configuration */}
        <div className="bg-white border border-[#c2c6d6]/40 p-8 rounded-3xl shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-[#eff4ff] text-[#0058be] rounded-2xl">
              <Cpu size={22} />
            </div>
            <h2 className="text-xl font-bold text-[#121c2a]" style={{ fontFamily: "Geist, sans-serif" }}>
              AI Research Assistant
            </h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-[13px] font-bold text-[#424754] mb-2">Default LLM Engine</label>
              <select className="w-full bg-[#f8f9ff] border border-[#c2c6d6]/50 rounded-2xl px-4 py-3 text-[14px] text-[#121c2a] focus:border-[#0058be] outline-none transition-all">
                <option>GPT-4o (High Precision)</option>
                <option>Claude 3.5 Sonnet (Best Reasoning)</option>
                <option>Gemini 1.5 Pro (Massive Context)</option>
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-bold text-[#424754] mb-2">Daily Chat Limit (Free Plan)</label>
              <input 
                type="number" 
                defaultValue={10} 
                className="w-full bg-[#f8f9ff] border border-[#c2c6d6]/50 rounded-2xl px-4 py-3 text-[14px] text-[#121c2a] focus:border-[#0058be] outline-none transition-all"
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-[#f8f9ff] border border-[#c2c6d6]/40 rounded-2xl">
              <div>
                <p className="text-[14px] font-bold text-[#121c2a]">OCR for Scanned PDFs</p>
                <p className="text-[12px] text-[#727785]">Enable text extraction via Vision AI models.</p>
              </div>
              <div className="w-12 h-6 bg-gray-200 rounded-full relative cursor-pointer">
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow" />
              </div>
            </div>
          </div>
        </div>

        {/* Security & Access */}
        <div className="bg-white border border-[#c2c6d6]/40 p-8 rounded-3xl shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
              <Shield size={22} />
            </div>
            <h2 className="text-xl font-bold text-[#121c2a]" style={{ fontFamily: "Geist, sans-serif" }}>
              Security & RBAC
            </h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[14px] text-[#121c2a] font-bold">Require Email OTP on Login</span>
              <div className="w-12 h-6 bg-[#0058be] rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[14px] text-[#121c2a] font-bold">Public Search Indexing</span>
              <div className="w-12 h-6 bg-[#0058be] rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[14px] text-[#121c2a] font-bold">AI Auto-Moderation Engine</span>
              <div className="w-12 h-6 bg-gray-200 rounded-full relative cursor-pointer">
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow" />
              </div>
            </div>
          </div>
        </div>

        {/* Maintenance */}
        <div className="bg-white border border-[#c2c6d6]/40 p-8 rounded-3xl shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
              <Bell size={22} />
            </div>
            <h2 className="text-xl font-bold text-[#121c2a]" style={{ fontFamily: "Geist, sans-serif" }}>
              System Maintenance
            </h2>
          </div>
          
          <div className="space-y-4">
            <button className="w-full py-3 border border-red-200 text-red-600 font-bold rounded-2xl hover:bg-red-600 hover:text-white transition-all text-[13px]">
              Purge Deleted Files (Soft Delete)
            </button>
            <button className="w-full py-3 bg-[#f8f9ff] hover:bg-[#eff4ff] text-[#424754] hover:text-[#0058be] font-bold rounded-2xl border border-[#c2c6d6]/50 transition-all text-[13px]">
              Clear AI & System Cache
            </button>
            <div className="flex items-center gap-2.5 p-4 rounded-2xl bg-[#f8f9ff] border border-[#c2c6d6]/30 text-[12px] text-[#727785] font-medium">
              <Cloud size={16} className="text-[#0058be]" />
              <span>Last snapshot: 2 hours ago (Automatic Backup)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

