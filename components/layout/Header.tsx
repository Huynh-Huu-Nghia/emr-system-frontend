"use client";
import { usePathname } from "next/navigation"
import { Bell, ChevronDown, Mail, Plus, Search } from "lucide-react"

export function Header() {
  const pathname = usePathname() ?? ""

  const isReception = pathname.includes("/reception")
  const isDoctor = pathname.includes("/doctor")
  const isAdmin = pathname.includes("/admin")

  const searchPlaceholder = isDoctor
    ? "Tìm mã bệnh án, tên bệnh nhân..."
    : isAdmin
    ? "Tìm nhân viên, phòng ban..."
    : "Tìm bệnh nhân (SĐT, Tên)..."

  const buttonLabel = isDoctor
    ? "+ Đơn thuốc nhanh"
    : isAdmin
    ? "+ Thêm nhân sự"
    : "+ Bệnh nhân mới"

  return (
    <header className="h-20 bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-8">
        <div className="flex-1 min-w-0 flex items-center">
          <div className="w-full max-w-md">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                <Search className="h-5 w-5" />
              </div>
              <input
                type="search"
                placeholder={searchPlaceholder}
                className="w-full rounded-full bg-slate-100/80 px-14 py-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-100 focus:ring-offset-2 focus:ring-offset-transparent"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="whitespace-nowrap rounded-full bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-700">
            10:50 AM today, 05/28/2020
          </div>

          <button className="inline-flex items-center gap-2 rounded-full bg-cyan-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700">
            <Plus className="h-4 w-4" />
            {buttonLabel}
          </button>

          <button className="relative inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
          </button>

          <button className="relative inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200">
            <Mail className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
          </button>

          <button className="inline-flex items-center gap-3 rounded-full bg-cyan-100 px-3 py-2 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-50">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-100 text-cyan-700 font-semibold">
              MC
            </div>
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
