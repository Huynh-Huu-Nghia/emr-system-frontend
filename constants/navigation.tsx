import {
  LayoutDashboard,
  Users,
  CalendarDays,
  ClipboardList,
  Stethoscope,
  Settings,
  DoorOpen,
} from "lucide-react"

import type { ComponentType } from "react"

import { ROUTES } from "@/constants/routes"

export type MenuItem = {
  label: string
  href: string
  icon: ComponentType<{ className?: string }>
}

export const SIDEBAR_MENU: Record<"reception" | "doctor" | "admin", MenuItem[]> = {
  reception: [
    { label: "Dashboard", href: ROUTES.RECEPTION.DASHBOARD, icon: LayoutDashboard },
    { label: "Bệnh nhân", href: ROUTES.RECEPTION.PATIENTS, icon: Users },
    { label: "Tiếp đón", href: ROUTES.RECEPTION.CHECKIN, icon: DoorOpen },
    { label: "Lịch hẹn", href: ROUTES.RECEPTION.APPOINTMENTS, icon: CalendarDays },
  ],
  doctor: [
    { label: "Dashboard", href: ROUTES.DOCTOR.DASHBOARD, icon: LayoutDashboard },
    { label: "Bệnh nhân", href: ROUTES.DOCTOR.PATIENTS, icon: Users },
    { label: "Khám bệnh", href: ROUTES.DOCTOR.EXAMINATION, icon: Stethoscope },
    { label: "Bệnh án", href: ROUTES.DOCTOR.RECORDS, icon: ClipboardList },
  ],
  admin: [
    { label: "Dashboard", href: ROUTES.ADMIN.DASHBOARD, icon: LayoutDashboard },
    { label: "Nhân viên", href: ROUTES.ADMIN.STAFF, icon: Users },
    { label: "Cấu hình hệ thống", href: ROUTES.ADMIN.SETTINGS, icon: Settings },
  ],
}
