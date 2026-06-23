import { ResearchSidebar } from "@/components/user-navbar"

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#f8f9ff]">
      <ResearchSidebar />
      {/* Main content — offset by sidebar width on lg+ */}
      <main className="flex-1 lg:ml-[230px] min-h-screen flex flex-col">
        {children}
      </main>
    </div>
  )
}
