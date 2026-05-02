"use client";
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Settings,
  LogOut,
} from "lucide-react"

const receptionMenu = [
  {
    label: "Dashboard",
    href: "/reception/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Tiếp đón",
    href: "/reception/checkin",
    icon: Users,
  },
  {
    label: "Lịch hẹn",
    href: "/reception/appointments",
    icon: CalendarDays,
  },
]

const adminMenu = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Nhân viên",
    href: "/admin/staff",
    icon: Users,
  },
  {
    label: "Cấu hình hệ thống",
    href: "/admin/settings",
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname() ?? ""
  const isReception = pathname.startsWith("/reception")
  const isAdmin = pathname.startsWith("/admin")
  const menuItems = isReception ? receptionMenu : isAdmin ? adminMenu : receptionMenu

  return (
    <aside className="w-72 bg-white border-r border-slate-200 flex flex-col h-screen fixed left-0 top-0">
      <div className="sticky top-0 z-10 h-20 border-b border-slate-200 bg-white px-6 flex items-center">
        <span className="text-2xl font-bold text-teal-500">EMR</span>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <nav className="space-y-6">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Workspace</p>
            {menuItems.map((item) => {
              const Icon = item.icon
              const active = pathname === item.href || pathname.startsWith(item.href + "/")

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 transition ${
                    active
                      ? "border-l-4 border-teal-500 bg-teal-50/60 text-teal-500 font-semibold"
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </nav>
      </div>

      <div className="px-6 pb-6">
        <div className="space-y-2 rounded-2xl border-t border-slate-200 pt-6">
          <Link
            href="/settings"
            className="flex items-center gap-3 rounded-2xl px-4 py-3 text-slate-500 transition hover:bg-slate-50"
          >
            <Settings className="h-5 w-5" />
            Settings
          </Link>
          <Link
            href="/logout"
            className="flex items-center gap-3 rounded-2xl px-4 py-3 text-slate-500 transition hover:bg-slate-50"
          >
            <LogOut className="h-5 w-5" />
            Log Out
          </Link>
        </div>
      </div>
    </aside>
  )
}
