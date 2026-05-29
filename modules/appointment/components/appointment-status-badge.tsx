import type { AppointmentStatus } from "@/core/api/appointmentService"
import { cn } from "@/lib/utils"

const LABELS: Record<AppointmentStatus, string> = {
  SCHEDULED: "Đã đặt",
  CANCELLED: "Đã huỷ",
  COMPLETED: "Hoàn tất",
}

const STYLES: Record<AppointmentStatus, string> = {
  SCHEDULED: "bg-medical-light text-medical-dark border-medical-primary/30",
  CANCELLED: "bg-slate-100 text-slate-600 border-slate-200",
  COMPLETED: "bg-emerald-50 text-emerald-800 border-emerald-200",
}

export function AppointmentStatusBadge({
  status,
  className,
}: {
  status: AppointmentStatus
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
        STYLES[status],
        className
      )}
    >
      {LABELS[status]}
    </span>
  )
}
