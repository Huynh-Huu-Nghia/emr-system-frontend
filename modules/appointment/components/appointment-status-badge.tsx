import type { AppointmentStatus } from "@/core/api/appointmentService"
import { cn } from "@/lib/utils"

const LABELS: Record<AppointmentStatus, string> = {
  PENDING: "Ch\u1EDD x\u00E1c nh\u1EADn",
  CONFIRMED: "\u0110\u00E3 x\u00E1c nh\u1EADn",
  CANCELLED: "\u0110\u00E3 hu\u1EF7",
  COMPLETED: "Ho\u00E0n t\u1EA5t",
}

const STYLES: Record<AppointmentStatus, string> = {
  PENDING: "bg-amber-50 text-amber-800 border-amber-200",
  CONFIRMED: "bg-medical-light text-medical-dark border-medical-primary/30",
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
