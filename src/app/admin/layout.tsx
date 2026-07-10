import { AdminSidebar } from "@/components/layouts/admin-sidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-[#f8f9ff] text-[#121c2a]">
      <AdminSidebar />
      <main className="flex-1 lg:ml-72 transition-all duration-300">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
