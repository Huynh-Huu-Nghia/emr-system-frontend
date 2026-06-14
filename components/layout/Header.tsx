"use client"
import { useState, useRef, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { ChevronDown, Settings, LogOut, User } from "lucide-react"
import { NotificationBell } from "@/components/layout/notification-bell"
import { useAuth } from "@/context/AuthContext"
import { ROUTES } from "@/constants/routes"

export function Header() {
  const pathname = usePathname() ?? ""
  const router = useRouter()
  const { user, logout } = useAuth()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const role = pathname.includes("/doctor")
    ? "doctor"
    : pathname.includes("/admin")
    ? "admin"
    : "reception"

  const now = new Date().toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })

  return (
    <header className="h-20 bg-gradient-to-r from-emerald-50 to-white/80 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-50 shadow-sm">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-end px-8">
        <div className="flex items-center gap-6">
          <div className="whitespace-nowrap rounded-full bg-white/50 border border-slate-200/50 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
            {now}
          </div>

          <div className="text-slate-600">
            <NotificationBell />
          </div>

          {/* User Menu */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="inline-flex items-center gap-3 rounded-full bg-slate-100/50 border border-slate-200/50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200/50 shadow-inner"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-medical-primary text-white font-bold text-sm shadow-sm">
                {user?.fullName?.slice(0, 2).toUpperCase() ?? "U"}
              </div>
              <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-slate-200 bg-white py-2 shadow-lg">
                <div className="border-b border-slate-100 px-4 py-3">
                  <p className="text-sm font-medium text-slate-800">{user?.fullName ?? "User"}</p>
                  <p className="text-xs text-slate-400">{user?.role ?? ""}</p>
                </div>
                <button
                  type="button"
                  onClick={() => { router.push(ROUTES.SETTINGS); setUserMenuOpen(false) }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <Settings className="h-4 w-4 text-slate-400" />
                  Cài đặt
                </button>
                {/* <button
                  type="button"
                  onClick={() => { router.push(ROUTES.PROFILE); setUserMenuOpen(false) }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <User className="h-4 w-4 text-slate-400" />
                  Hồ sơ cá nhân
                </button> */}
                <div className="my-1 border-t border-slate-100" />
                <button
                  type="button"
                  onClick={() => { logout(); setUserMenuOpen(false) }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

    </header>
  )
}
