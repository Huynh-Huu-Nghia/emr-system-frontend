"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
// ✅ Menu items tách ra constants — không hardcode trong component
import { SIDEBAR_MENU } from "@/constants/navigation"
import { SidebarFooter } from "@/components/layout/sidebar-footer"

export function Sidebar() {
  const pathname = usePathname() ?? ""

  const role = pathname.startsWith("/doctor")
    ? "doctor"
    : pathname.startsWith("/admin")
    ? "admin"
    : "reception"

  // ✅ Lấy menu theo role từ constants, không if/else rối
  const menuItems = SIDEBAR_MENU[role]

  return (
    // ✅ Dùng w-64 = 256px, đồng nhất với layout.tsx bên dưới
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-full">

      {/* Logo */}
      <div className="h-20 border-b border-slate-200 px-6 flex items-center">
        {/* ✅ medical-primary thay vì teal-500 */}
        <span className="text-2xl font-bold text-medical-primary">EMR</span>
      </div>

      {/* Nav items */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <nav className="space-y-6">
          <div className="space-y-1">
            <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              Workspace
            </p>
            {menuItems.map((item) => {
              const Icon = item.icon
              const active =
                pathname === item.href || pathname.startsWith(item.href + "/")

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${
                    active
                      // ✅ medical-primary / medical-light thay vì teal-500 / teal-50
                      ? "border-l-4 border-medical-primary bg-medical-light text-medical-primary font-semibold"
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </nav>
      </div>

      <SidebarFooter />
    </aside>
  )
}
