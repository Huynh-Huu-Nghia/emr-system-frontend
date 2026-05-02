import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 font-sans">
      
      {/* Cột Sidebar*/}
      <div className="w-[260px] h-full bg-white flex-shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.03)] z-20 relative">
        <Sidebar />
      </div>

      {/* Cột bên phải (Chứa Header và Nội dung) */}
      <div className="flex flex-1 flex-col overflow-hidden z-10">
        <Header />
        
        {/* Vùng chứa nội dung chính */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}