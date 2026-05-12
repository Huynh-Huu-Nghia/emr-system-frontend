import {
  LayoutDashboard,
  Users,
  CalendarDays,
  ClipboardList,
  Stethoscope,
  Settings,
} from "lucide-react"

// ✅ Một chỗ duy nhất để quản lý toàn bộ menu
// Khi cần thêm/bớt menu item, chỉ sửa ở đây
export type MenuItem = {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

export const SIDEBAR_MENU: Record<"reception" | "doctor" | "admin", MenuItem[]> = {
  reception: [
    { label: "Dashboard",   href: "/reception/dashboard",    icon: LayoutDashboard },
    { label: "Tiếp đón",    href: "/reception/checkin",      icon: Users },
    { label: "Lịch hẹn",   href: "/reception/appointments", icon: CalendarDays },
  ],
  doctor: [
    { label: "Dashboard",   href: "/doctor/dashboard",       icon: LayoutDashboard },
    { label: "Bệnh nhân",  href: "/doctor/patients",        icon: Users },
    { label: "Khám bệnh",  href: "/doctor/examination",     icon: Stethoscope },
    { label: "Bệnh án",    href: "/doctor/records",         icon: ClipboardList },
  ],
  admin: [
    { label: "Dashboard",       href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Nhân viên",       href: "/admin/staff",     icon: Users },
    { label: "Cấu hình hệ thống", href: "/admin/settings", icon: Settings },
  ],
}
