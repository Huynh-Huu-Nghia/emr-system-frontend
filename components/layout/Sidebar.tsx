import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Activity, ChevronLeft, ChevronRight } from "lucide-react"
import { SIDEBAR_MENU } from "@/constants/navigation"
import { cn } from "@/lib/utils"

export function Sidebar() {
  const pathname = usePathname() ?? ""

  const role = pathname.startsWith("/doctor")
    ? "doctor"
    : pathname.startsWith("/admin")
    ? "admin"
    : "reception"

  // ✅ Lấy menu theo role từ constants, không if/else rối
  const menuItems = SIDEBAR_MENU[role]

  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("sidebar_collapsed")
    if (saved === "true") setCollapsed(true)
  }, [])

  const toggleSidebar = () => {
    const newVal = !collapsed
    setCollapsed(newVal)
    localStorage.setItem("sidebar_collapsed", String(newVal))
  }

  return (
    <aside className={cn(
      "bg-white flex flex-col h-full transition-all duration-300 ease-in-out relative z-40",
      collapsed ? "w-20" : "w-64"
    )}>

      {/* Toggle Button */}
      <button 
        onClick={toggleSidebar}
        className="absolute -right-3 top-24 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm hover:text-medical-primary hover:border-medical-primary focus:outline-none transition-colors"
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>

      {/* Seamless Logo Area (Soft Pastel Green) */}
      <div className="h-20 shrink-0 flex items-center justify-center px-4 bg-gradient-to-r from-emerald-100 to-emerald-50 relative overflow-hidden text-emerald-900">
        <div className={cn("flex items-center relative z-10 w-full transition-all duration-300", collapsed ? "justify-center" : "px-4 gap-3")}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-medical-primary text-white shadow-sm">
            <Activity className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="flex items-end gap-1 overflow-hidden whitespace-nowrap">
              <span className="text-xl font-black tracking-tighter text-emerald-900">EMR</span>
              <span className="text-[8px] font-bold tracking-[0.2em] text-emerald-700/80 mb-0.5">SYSTEM</span>
            </div>
          )}
        </div>
      </div>

      {/* Nav items */}
      <div className="flex-1 overflow-y-auto px-4 py-6 relative z-10 shadow-[4px_0_24px_rgba(15,23,42,0.04)] bg-white">
        <nav className="space-y-6">
          <div className="space-y-1">
            <p className={cn(
              "mb-3 px-3 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 transition-opacity duration-300",
              collapsed ? "opacity-0 hidden" : "opacity-100 block"
            )}>
              Workspace
            </p>
            {menuItems.map((item) => {
              const Icon = item.icon
              const isDashboard = item.href === "/doctor" || item.href === "/admin" || item.href === "/reception"
              const active = isDashboard
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(item.href + "/")

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-2xl transition-all duration-200",
                    collapsed ? "justify-center p-3 gap-0" : "gap-3 px-4 py-3 text-sm",
                    active
                      ? "bg-medical-light text-medical-primary font-semibold"
                      : "text-slate-500 hover:bg-slate-50"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className={cn("shrink-0", collapsed ? "h-6 w-6" : "h-5 w-5")} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              )
            })}
          </div>
        </nav>
      </div>

    </aside>
  )
}
