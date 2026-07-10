import { Settings, Save, Shield, HardDrive, Cpu, Bell, Cloud } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-on-surface mb-2">System Settings</h1>
          <p className="text-on-surface-variant">Configure platform constraints, AI behavior, and security policies.</p>
        </div>
        <button className="bg-primary hover:bg-secondary text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all flex items-center gap-2 w-fit">
          <Save size={18} />
          <span>Save Changes</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Storage & Files */}
        <div className="glass-panel p-8 rounded-3xl space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
              <HardDrive size={20} />
            </div>
            <h2 className="text-xl font-semibold text-on-surface">Storage & Uploads</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-[14px] font-semibold text-on-surface mb-2">Max File Size (MB)</label>
              <input 
                type="number" 
                defaultValue={50} 
                className="w-full bg-surface-container-low border border-outline/10 rounded-2xl px-4 py-3 text-[14px] focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
            <div>
              <label className="block text-[14px] font-semibold text-on-surface mb-2">Allowed Extensions</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {['.pdf', '.docx', '.pptx', '.txt', '.png', '.jpg'].map(ext => (
                  <span key={ext} className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-[12px] font-bold">
                    {ext}
                  </span>
                ))}
              </div>
              <input 
                type="text" 
                placeholder="Add extension... (e.g. .zip)" 
                className="w-full bg-surface-container-low border border-outline/10 rounded-2xl px-4 py-3 text-[14px] focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-surface-container-high rounded-2xl">
              <div>
                <p className="text-[14px] font-bold text-on-surface">Cloud Deduplication</p>
                <p className="text-[12px] text-on-surface-variant">Prevent identical files from taking up space.</p>
              </div>
              <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* AI Configuration */}
        <div className="glass-panel p-8 rounded-3xl space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 text-purple-600 rounded-xl">
              <Cpu size={20} />
            </div>
            <h2 className="text-xl font-semibold text-on-surface">AI & Chatbot</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-[14px] font-semibold text-on-surface mb-2">Default LLM Model</label>
              <select className="w-full bg-surface-container-low border border-outline/10 rounded-2xl px-4 py-3 text-[14px] focus:ring-2 focus:ring-primary/20 outline-none appearance-none">
                <option>GPT-4o (High Precision)</option>
                <option>Claude 3.5 Sonnet (Best Reasoning)</option>
                <option>Gemini 1.5 Pro (Massive Context)</option>
              </select>
            </div>
            <div>
              <label className="block text-[14px] font-semibold text-on-surface mb-2">Daily Chat Limit (Free Users)</label>
              <input 
                type="number" 
                defaultValue={10} 
                className="w-full bg-surface-container-low border border-outline/10 rounded-2xl px-4 py-3 text-[14px] focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-surface-container-high rounded-2xl">
              <div>
                <p className="text-[14px] font-bold text-on-surface">OCR for Scanned PDFs</p>
                <p className="text-[12px] text-on-surface-variant">Enable text extraction via Vision models.</p>
              </div>
              <div className="w-12 h-6 bg-outline/20 rounded-full relative cursor-pointer">
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Security & Access */}
        <div className="glass-panel p-8 rounded-3xl space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-100 text-amber-600 rounded-xl">
              <Shield size={20} />
            </div>
            <h2 className="text-xl font-semibold text-on-surface">Security & RBAC</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[14px] text-on-surface font-medium">Require Email OTP</span>
              <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[14px] text-on-surface font-medium">Public Search Indexing</span>
              <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[14px] text-on-surface font-medium">Auto-Moderation</span>
              <div className="w-12 h-6 bg-outline/20 rounded-full relative cursor-pointer">
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Maintenance */}
        <div className="glass-panel p-8 rounded-3xl space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 text-red-600 rounded-xl">
              <Bell size={20} />
            </div>
            <h2 className="text-xl font-semibold text-on-surface">Maintenance</h2>
          </div>
          
          <div className="space-y-4">
            <button className="w-full py-3 border border-destructive/20 text-destructive font-bold rounded-2xl hover:bg-destructive hover:text-white transition-all">
              Purge Deleted Files (Soft Delete)
            </button>
            <button className="w-full py-3 bg-surface hover:bg-surface-container-high text-on-surface-variant font-bold rounded-2xl border border-outline/10 transition-all">
              Clear System Cache
            </button>
            <div className="flex items-center gap-2 p-4 rounded-2xl bg-surface-container-low text-[12px] text-on-surface-variant">
              <Cloud size={16} />
              <span>Last backup: 2 hours ago (Automatic)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
