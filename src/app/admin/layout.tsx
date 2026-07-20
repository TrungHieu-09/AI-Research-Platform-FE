import { AdminTopNav } from "@/components/layouts/admin-top-nav"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#121c2a]">
      <AdminTopNav />

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 py-8 pt-24 md:px-8">
        {children}
      </main>
    </div>
  )
}
