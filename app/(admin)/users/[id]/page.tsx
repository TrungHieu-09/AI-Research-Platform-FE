import { Shield, Mail, Calendar, User as UserIcon, ChevronLeft, MapPin, Phone, History, MoreVertical, Ban, Trash2 } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function UserDetailPage({ params }: { params: { id: string } }) {
  // Mock user data based on ID
  const user = {
    id: params.id,
    name: "Nguyen Van A",
    email: "anv@fpt.edu.vn",
    role: "Student",
    status: "Active",
    joinDate: "2024-01-15",
    avatar: "NA",
    phone: "+84 912 345 678",
    location: "FPT University HOL, Hanoi",
    bio: "Computer Science student specializing in AI and Data Science. Passionate about web development.",
    activity: [
      { action: "Uploaded Document", detail: "Software_Testing_Notes.pdf", time: "2 hours ago" },
      { action: "Updated Profile", detail: "Bio information", time: "1 day ago" },
      { action: "Logged In", detail: "Hanoi, VN", time: "2 days ago" },
    ]
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/users" className="p-2 hover:bg-surface-container-highest rounded-full transition-colors">
            <ChevronLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">User Details</h1>
            <p className="text-on-surface-variant font-medium">Viewing profile and activity for {user.name}.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-surface border border-red-200 text-red-600 rounded-2xl font-bold hover:bg-red-50 transition-all">
            <Ban size={18} />
            <span>Suspend</span>
          </button>
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-secondary transition-all">
            Edit Profile
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Basic Info */}
        <div className="space-y-8">
          <div className="glass-panel p-8 text-center flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center font-extrabold text-white text-3xl mb-4 shadow-xl shadow-primary/20">
              {user.avatar}
            </div>
            <h2 className="text-2xl font-bold text-on-surface mb-1">{user.name}</h2>
            <p className="text-on-surface-variant mb-4">{user.email}</p>
            <div className="flex gap-2 mb-6">
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[12px] font-bold flex items-center gap-1.5">
                <Shield size={12} />
                {user.role}
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[12px] font-bold">
                {user.status}
              </span>
            </div>
            <div className="w-full pt-6 border-t border-outline-variant grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-on-surface">124</p>
                <p className="text-[11px] text-on-surface-variant font-bold uppercase tracking-wider">Docs</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-on-surface">1.2k</p>
                <p className="text-[11px] text-on-surface-variant font-bold uppercase tracking-wider">Views</p>
              </div>
            </div>
          </div>

          <div className="glass-panel p-8 space-y-6">
            <h3 className="text-[14px] font-bold text-on-surface uppercase tracking-widest">Contact Information</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-surface-container-low text-on-surface-variant rounded-xl border border-outline-variant">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-[12px] text-on-surface-variant font-medium">Email</p>
                  <p className="text-[14px] font-bold text-on-surface">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-surface-container-low text-on-surface-variant rounded-xl border border-outline-variant">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-[12px] text-on-surface-variant font-medium">Phone</p>
                  <p className="text-[14px] font-bold text-on-surface">{user.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-surface-container-low text-on-surface-variant rounded-xl border border-outline-variant">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-[12px] text-on-surface-variant font-medium">Location</p>
                  <p className="text-[14px] font-bold text-on-surface">{user.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-surface-container-low text-on-surface-variant rounded-xl border border-outline-variant">
                  <Calendar size={18} />
                </div>
                <div>
                  <p className="text-[12px] text-on-surface-variant font-medium">Joined date</p>
                  <p className="text-[14px] font-bold text-on-surface">{user.joinDate}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Experience & Activity */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-panel p-8 space-y-6">
            <h3 className="text-xl font-extrabold text-on-surface">About User</h3>
            <p className="text-on-surface-variant leading-relaxed font-medium">
              {user.bio}
            </p>
            <div className="pt-6 border-t border-outline-variant grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant">
                  <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Preferred Department</p>
                  <p className="text-[14px] font-bold text-on-surface">Information Technology</p>
               </div>
               <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant">
                  <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Current Semester</p>
                  <p className="text-[14px] font-bold text-on-surface">Summer 2024</p>
               </div>
            </div>
          </div>

          <div className="glass-panel p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-extrabold text-on-surface">Activity History</h3>
              <button className="p-2 hover:bg-surface-container-low rounded-xl">
                <MoreVertical size={20} />
              </button>
            </div>
            
            <div className="relative space-y-8 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-outline-variant">
              {user.activity.map((act, i) => (
                <div key={i} className="relative flex gap-6 items-start">
                  <div className="relative z-10 w-10 h-10 rounded-full bg-white border-2 border-primary flex items-center justify-center flex-shrink-0">
                    <History size={16} className="text-primary" />
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                      <p className="text-[15px] font-bold text-on-surface">{act.action}</p>
                      <span className="text-[12px] font-bold text-on-surface-variant">{act.time}</span>
                    </div>
                    <p className="text-[14px] text-on-surface-variant bg-surface-container-low p-4 rounded-2xl border border-outline-variant inline-block">
                      {act.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button className="flex items-center gap-2 px-6 py-2.5 text-red-600 font-bold hover:bg-red-50 rounded-2xl transition-all">
              <Trash2 size={18} />
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
