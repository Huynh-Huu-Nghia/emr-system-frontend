import { Sidebar } from "@/components/layout/Sidebar"
import { Header } from "@/components/layout/Header"

// ✅ Sidebar width được đồng nhất: w-64 (256px) ở cả layout lẫn Sidebar component
// Trước đây layout dùng w-[260px] còn Sidebar dùng w-72 (288px) → lệch nhau
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full bg-slate-50">
      {/* w-64 = 256px — đồng nhất với Sidebar.tsx */}
      <div className="w-64 h-full flex-shrink-0 z-20">
        <Sidebar />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
