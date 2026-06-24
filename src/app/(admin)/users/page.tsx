"use client"

import { Users, MoreVertical, Shield, User as UserIcon, UserCheck, UserX } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

const users = [
  { id: 1, name: "Nguyen Van A", email: "anv@fpt.edu.vn", role: "Student", status: "Active", joinDate: "2024-01-15" },
  { id: 2, name: "Tran Thi B", email: "btt@fpt.edu.vn", role: "Moderator", status: "Active", joinDate: "2024-02-10" },
  { id: 3, name: "Le Van C", email: "clv@fpt.edu.vn", role: "Student", status: "Suspended", joinDate: "2024-03-05" },
  { id: 4, name: "Pham Minh D", email: "dpm@fpt.edu.vn", role: "Admin", status: "Active", joinDate: "2023-12-20" },
  { id: 5, name: "Võ Hoàng E", email: "evh@fpt.edu.vn", role: "Student", status: "Active", joinDate: "2024-05-12" },
]

export default function UsersPage() {
  const router = useRouter()

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-on-surface mb-2">User Management</h1>
          <p className="text-on-surface-variant font-medium">View and manage your organization's user profiles and access roles.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 flex items-center gap-4">
          <div className="p-3 bg-primary/10 text-primary rounded-2xl">
            <UserIcon size={24} />
          </div>
          <div>
            <p className="text-[14px] text-on-surface-variant">Total Users</p>
            <h4 className="text-2xl font-bold">1,284</h4>
          </div>
        </div>
        <div className="glass-panel p-6 flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-2xl">
            <UserCheck size={24} />
          </div>
          <div>
            <p className="text-[14px] text-on-surface-variant">Active Now</p>
            <h4 className="text-2xl font-bold">156</h4>
          </div>
        </div>
        <div className="glass-panel p-6 flex items-center gap-4">
          <div className="p-3 bg-red-100 text-red-600 rounded-2xl">
            <UserX size={24} />
          </div>
          <div>
            <p className="text-[14px] text-on-surface-variant">Suspended</p>
            <h4 className="text-2xl font-bold">12</h4>
          </div>
        </div>
      </div>

      <div className="glass-panel overflow-hidden border border-outline/5 transition-all">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-high/50 border-b border-outline/10">
                <th className="px-6 py-4 text-[14px] font-semibold text-on-surface">User</th>
                <th className="px-6 py-4 text-[14px] font-semibold text-on-surface">Role</th>
                <th className="px-6 py-4 text-[14px] font-semibold text-on-surface">Status</th>
                <th className="px-6 py-4 text-[14px] font-semibold text-on-surface">Join Date</th>
                <th className="px-6 py-4 text-[14px] font-semibold text-on-surface"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline/5">
              {users.map((user) => (
                <tr
                  key={user.id}
                  onClick={() => router.push(`/users/${user.id}`)}
                  className="hover:bg-primary/5 transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center font-bold text-primary text-[14px]">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-semibold text-on-surface leading-tight">{user.name}</p>
                        <p className="text-[12px] text-on-surface-variant">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium bg-surface-container-high text-on-surface">
                      <Shield size={12} className="text-primary" />
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-bold ${user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-[14px] text-on-surface-variant">
                    {user.joinDate}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/users/${user.id}`);
                      }}
                      className="p-2 text-on-surface-variant hover:text-primary transition-colors"
                    >
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 bg-surface-container-low border-t border-outline/10 flex items-center justify-between">
          <p className="text-[12px] text-on-surface-variant italic">Showing 5 of 1,284 users</p>
          <div className="flex gap-2">
            <button className="px-4 py-1.5 bg-surface rounded-xl border border-outline/10 text-[12px] hover:bg-surface-container-highest transition-all">Prev</button>
            <button className="px-4 py-1.5 bg-primary text-white rounded-xl text-[12px] shadow-sm hover:shadow-md transition-all">Next</button>
          </div>
        </div>
      </div>
    </div>
  )
}
