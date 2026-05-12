"use client"
import { usePathname } from "next/navigation"
import { Bell, ChevronDown, Mail, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// ✅ Tập trung text theo role ở đây, không hardcode rải rác
const ROLE_CONFIG = {
  doctor: {
    searchPlaceholder: "Tìm mã bệnh án, tên bệnh nhân...",
    buttonLabel: "Đơn thuốc nhanh",
  },
  admin: {
    searchPlaceholder: "Tìm nhân viên, phòng ban...",
    buttonLabel: "Thêm nhân sự",
  },
  reception: {
    searchPlaceholder: "Tìm bệnh nhân (SĐT, Tên)...",
    buttonLabel: "Bệnh nhân mới",
  },
} as const

export function Header() {
  const pathname = usePathname() ?? ""

  const role = pathname.includes("/doctor")
    ? "doctor"
    : pathname.includes("/admin")
    ? "admin"
    : "reception"

  const { searchPlaceholder, buttonLabel } = ROLE_CONFIG[role]

  // ✅ Ngày giờ động — không hardcode
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

        {/* Search — dùng Input component của mình */}
        <div className="flex-1 min-w-0 flex items-center">
          <div className="w-full max-w-md">
            {/* ✅ Dùng Input component đã có, không raw <input> */}
            <Input
              type="search"
              placeholder={searchPlaceholder}
              leftIcon={<Search className="h-4 w-4" />}
              className="rounded-full bg-slate-100/80 border-transparent focus-visible:border-medical-primary focus-visible:ring-medical-light"
            />
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* ✅ Dùng medical-light / medical-dark thay vì cyan-50 / cyan-700 */}
          <div className="whitespace-nowrap rounded-full bg-medical-light px-4 py-2 text-sm font-semibold text-medical-dark">
            {now}
          </div>

          {/* ✅ Dùng Button component của mình */}
          <Button variant="default" className="rounded-full gap-2">
            <Plus className="h-4 w-4" />
            {buttonLabel}
          </Button>

          {/* ✅ Icon buttons — dùng Button variant ghost + size icon */}
          <Button variant="ghost" size="icon" className="relative h-12 w-12 rounded-full bg-slate-100">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
          </Button>

          <Button variant="ghost" size="icon" className="relative h-12 w-12 rounded-full bg-slate-100">
            <Mail className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
          </Button>

          {/* ✅ Avatar — medical-light / medical-dark */}
          <button className="inline-flex items-center gap-3 rounded-full bg-medical-light px-3 py-2 text-sm font-semibold text-medical-dark transition hover:opacity-80">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-medical-primary text-white font-semibold text-sm">
              MC
            </div>
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
