"use client"
import { useState, useRef, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { ChevronDown, Mail, Plus, Search, Settings, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NotificationBell } from "@/components/layout/notification-bell"
import { QuickPrescriptionModal } from "@/modules/doctor/components/quick-prescription-modal"
import { useAuth } from "@/context/AuthContext"
import { ROUTES } from "@/constants/routes"

const ROLE_CONFIG = {
  doctor: {
    searchPlaceholder: "Tìm mã bệnh án, tên bệnh nhân...",
    buttonLabel: "Đơn thuốc nhanh",
    buttonAction: ROUTES.DOCTOR.EXAMINATION,
  },
  admin: {
    searchPlaceholder: "Tìm nhân viên, phòng ban...",
    buttonLabel: "Thêm nhân sự",
    buttonAction: ROUTES.ADMIN.STAFF,
  },
  reception: {
    searchPlaceholder: "Tìm bệnh nhân (SĐT, Tên)...",
    buttonLabel: "Bệnh nhân mới",
    buttonAction: ROUTES.RECEPTION.PATIENTS,
  },
} as const

export function Header() {
  const pathname = usePathname() ?? ""
  const router = useRouter()
  const { user, logout } = useAuth()
  const [quickPrescriptionOpen, setQuickPrescriptionOpen] = useState(false)
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

  const { searchPlaceholder, buttonLabel, buttonAction } = ROLE_CONFIG[role]

  const now = new Date().toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })

  return (
    <header className="h-20 bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-8">

        <div className="flex-1 min-w-0 flex items-center">
          <div className="w-full max-w-md">
            <Input
              type="search"
              placeholder={searchPlaceholder}
              leftIcon={<Search className="h-4 w-4" />}
              className="rounded-full bg-white border-slate-200 focus-visible:border-medical-primary focus-visible:ring-medical-light"
            />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="whitespace-nowrap rounded-full bg-medical-light px-4 py-2 text-sm font-semibold text-medical-dark">
            {now}
          </div>

          <Button
            variant="default"
            className="rounded-full gap-2"
            onClick={() => {
              if (role === "doctor") {
                setQuickPrescriptionOpen(true)
              } else {
                router.push(buttonAction)
              }
            }}
          >
            <Plus className="h-4 w-4" />
            {buttonLabel}
          </Button>

          <NotificationBell />

          <Button variant="ghost" size="icon" className="relative h-12 w-12 rounded-full bg-slate-100">
            <Mail className="h-5 w-5" />
          </Button>

          {/* User Menu */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="inline-flex items-center gap-3 rounded-full bg-medical-light px-3 py-2 text-sm font-semibold text-medical-dark transition hover:opacity-80"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-medical-primary text-white font-semibold text-sm">
                {user?.fullName?.slice(0, 2).toUpperCase() ?? "U"}
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
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
                <button
                  type="button"
                  onClick={() => { router.push(`/${role}`); setUserMenuOpen(false) }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <User className="h-4 w-4 text-slate-400" />
                  Hồ sơ cá nhân
                </button>
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

      {role === "doctor" && (
        <QuickPrescriptionModal open={quickPrescriptionOpen} onOpenChange={setQuickPrescriptionOpen} />
      )}
    </header>
  )
}
