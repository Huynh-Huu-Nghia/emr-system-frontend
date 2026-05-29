"use client"

import { cn } from "@/lib/utils"
import {
  addDays,
  eachDayOfWeek,
  endOfWeekSunday,
  startOfWeekMonday,
  ymdLocal,
} from "@/modules/appointment/lib/calendar-utils"
import type { Appointment } from "@/core/api/appointmentService"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

type WeekStripProps = {
  anchorDate: Date
  onAnchorChange: (nextMonday: Date) => void
  appointments: Appointment[]
  selectedYmd: string | null
  onSelectYmd: (ymd: string | null) => void
}

export function AppointmentWeekStrip({
  anchorDate,
  onAnchorChange,
  appointments,
  selectedYmd,
  onSelectYmd,
}: WeekStripProps) {
  const weekStart = startOfWeekMonday(anchorDate)
  const days = eachDayOfWeek(weekStart)
  const weekEnd = endOfWeekSunday(weekStart)

  const counts = new Map<string, number>()
  for (const a of appointments) {
    if (a.status !== "SCHEDULED") continue
    const key = ymdLocal(new Date(a.starts_at))
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  const labelRange = `${days[0].toLocaleDateString("vi-VN", { day: "2-digit", month: "short" })} – ${weekEnd.toLocaleDateString("vi-VN", { day: "2-digit", month: "short", year: "numeric" })}`

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-slate-800">Lịch tuần</p>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="shrink-0"
            onClick={() => onAnchorChange(addDays(weekStart, -7))}
            aria-label="Tuần trước"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[10rem] text-center text-xs font-medium text-slate-600">
            {labelRange}
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="shrink-0"
            onClick={() => onAnchorChange(addDays(weekStart, 7))}
            aria-label="Tuần sau"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {days.map((day) => {
          const ymd = ymdLocal(day)
          const count = counts.get(ymd) ?? 0
          const selected = selectedYmd === ymd
          const isToday = ymd === ymdLocal(new Date())
          return (
            <button
              key={ymd}
              type="button"
              onClick={() => onSelectYmd(selected ? null : ymd)}
              className={cn(
                "flex flex-col items-center rounded-xl border px-1 py-2 text-center transition sm:px-2",
                selected
                  ? "border-medical-primary bg-medical-light ring-2 ring-medical-primary/20"
                  : "border-slate-100 bg-slate-50/80 hover:border-slate-200",
                isToday && !selected && "ring-1 ring-medical-primary/40"
              )}
            >
              <span className="text-[10px] font-semibold uppercase text-slate-400">
                {day.toLocaleDateString("vi-VN", { weekday: "short" })}
              </span>
              <span className="text-lg font-bold text-slate-800">
                {day.getDate()}
              </span>
              <span className="mt-0.5 text-[10px] font-medium text-medical-dark">
                {count > 0 ? `${count} ca` : "—"}
              </span>
            </button>
          )
        })}
      </div>
      {selectedYmd ? (
        <p className="mt-3 text-center text-xs text-slate-500">
          Đang lọc ngày{" "}
          <span className="font-semibold text-slate-700">{selectedYmd}</span> — bấm lại ô
          đang chọn để xem cả tuần.
        </p>
      ) : null}
    </div>
  )
}
