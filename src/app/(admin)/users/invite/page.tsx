import { Mail, Shield, UserPlus, ChevronLeft } from "lucide-react"
import Link from "next/link"

export default function InviteUserPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Link href="/users" className="p-2 hover:bg-surface-container-highest rounded-full transition-colors">
          <ChevronLeft size={24} />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">Invite New User</h1>
          <p className="text-on-surface-variant font-medium">Send an invitation email to a new member of your team.</p>
        </div>
      </div>

      <div className="max-w-2xl">
        <div className="glass-panel p-10 space-y-8 bg-white border border-outline-variant shadow-xl shadow-primary/5">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[14px] font-bold text-on-surface">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={20} />
                <input 
                  type="email" 
                  placeholder="name@fpt.edu.vn" 
                  className="w-full bg-surface-container-low border border-outline-variant rounded-2xl py-4 pl-12 pr-4 text-[15px] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[14px] font-bold text-on-surface">Select Role</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {['Student', 'Moderator', 'Admin'].map((role) => (
                  <label key={role} className="relative flex items-center gap-3 p-4 bg-surface-container-low border border-outline-variant rounded-2xl cursor-pointer hover:border-primary/50 transition-all group">
                    <input type="radio" name="role" className="w-5 h-5 accent-primary" defaultChecked={role === 'Student'} />
                    <div className="flex flex-col">
                      <span className="text-[14px] font-bold text-on-surface">{role}</span>
                      <span className="text-[11px] text-on-surface-variant">Access level</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 flex items-start gap-4">
              <div className="p-2 bg-primary text-white rounded-xl">
                <Shield size={20} />
              </div>
              <div>
                <p className="text-[14px] font-bold text-on-surface">Role Permissions</p>
                <p className="text-[12px] text-on-surface-variant leading-relaxed">
                  The user will receive an email with instructions to set up their account and access the platform based on the assigned role.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-outline-variant">
            <button className="flex-1 bg-primary hover:bg-secondary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2">
              <UserPlus size={18} />
              <span>Send Invitation</span>
            </button>
            <Link href="/users" className="flex-1 bg-surface-container-highest hover:bg-outline-variant text-on-surface py-4 rounded-2xl font-bold text-center transition-all">
              Cancel
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
