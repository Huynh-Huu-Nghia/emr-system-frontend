"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"

import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ROUTES } from "@/constants/routes"
import { usePatientsQuery } from "@/modules/patient/hooks/use-patients-query"
import { useAppointmentsQuery } from "@/modules/appointment/hooks/use-appointments-query"
import { pushToQueue, useListenQueue } from "@/shared/queue/queue-stub"
import { formatDateTimeVi, formatDateVi } from "@/shared/lib/format/date"
import { cn } from "@/lib/utils"
import type { Appointment } from "@/core/api/appointmentService"

const NO_APPOINTMENT = "__none__"

function isSameLocalCalendarDay(iso: string, ref: Date = new Date()) {
  const d = new Date(iso)
  return (
    d.getFullYear() === ref.getFullYear() &&
    d.getMonth() === ref.getMonth() &&
    d.getDate() === ref.getDate()
  )
}

export default function ReceptionCheckinPage() {
  const queue = useListenQueue()
  const { data: patients = [] } = usePatientsQuery()
  const { data: appointments = [] } = useAppointmentsQuery()

  const [mode, setMode] = useState<"registered" | "walkin">("registered")
  const [patientId, setPatientId] = useState<string>("")
  const [appointmentId, setAppointmentId] = useState<string>(NO_APPOINTMENT)
  const [walkName, setWalkName] = useState("")
  const [walkCode, setWalkCode] = useState("")
  const [loading, setLoading] = useState(false)

  const selectedPatient = useMemo(
    () => patients.find((p) => String(p.id) === patientId),
    [patients, patientId]
  )

  const todaysAppointmentsForPatient = useMemo(() => {
    if (!selectedPatient) return []
    return appointments.filter(
      (a) =>
        a.patient_id === selectedPatient.id &&
        a.status === "SCHEDULED" &&
        isSameLocalCalendarDay(a.starts_at)
    )
  }, [appointments, selectedPatient])

  const handleCheckIn = async () => {
    if (mode === "registered") {
      if (!selectedPatient) {
        toast.error("Chọn bệnh nhân")
        return
      }
      const apptId =
        appointmentId && appointmentId !== NO_APPOINTMENT
          ? Number(appointmentId)
          : null
      const appt = apptId
        ? appointments.find((a) => a.id === apptId)
        : undefined
      if (apptId && (!appt || appt.patient_id !== selectedPatient.id)) {
        toast.error("Lịch hẹn không hợp lệ")
        return
      }
      setLoading(true)
      try {
        await pushToQueue({
          patientName: selectedPatient.full_name,
          medicalHistoryNumber: selectedPatient.medicalHistoryNumber,
          patientId: selectedPatient.id,
          appointmentId: apptId,
          source: "REGISTERED",
        })
        toast.success("Đã check-in — ca đã vào hàng đợi bác sĩ (mock)")
        setAppointmentId(NO_APPOINTMENT)
      } finally {
        setLoading(false)
      }
      return
    }

    const n = walkName.trim()
    const c = walkCode.trim()
    if (!n || !c) {
      toast.error("Nhập họ tên và mã hồ sơ tạm (vãng lai)")
      return
    }
    setLoading(true)
    try {
      await pushToQueue({
        patientName: n,
        medicalHistoryNumber: c,
        patientId: null,
        appointmentId: null,
        source: "WALK_IN",
      })
      toast.success("Đã check-in vãng lai (mock)")
      setWalkName("")
      setWalkCode("")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen space-y-8 bg-[#fafafa] p-6 lg:p-8">
      <PageHeader
        title="Tiếp đón & Check-in"
        description="Đưa bệnh nhân vào hàng đợi khám qua pushToQueue — payload tương thích khi nối BE."
      >
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="rounded-full" asChild>
            <Link href={ROUTES.RECEPTION.PATIENTS}>Hồ sơ BN</Link>
          </Button>
          <Button variant="outline" className="rounded-full" asChild>
            <Link href={ROUTES.RECEPTION.APPOINTMENTS}>Lịch hẹn</Link>
          </Button>
        </div>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">
            Check-in
          </h2>

          <div className="flex gap-2 rounded-full bg-slate-100 p-1">
            <button
              type="button"
              className={cn(
                "flex-1 rounded-full px-3 py-2 text-sm font-medium transition-colors",
                mode === "registered"
                  ? "bg-white text-medical-dark shadow-sm"
                  : "text-slate-600 hover:text-slate-800"
              )}
              onClick={() => setMode("registered")}
            >
              Có hồ sơ
            </button>
            <button
              type="button"
              className={cn(
                "flex-1 rounded-full px-3 py-2 text-sm font-medium transition-colors",
                mode === "walkin"
                  ? "bg-white text-medical-dark shadow-sm"
                  : "text-slate-600 hover:text-slate-800"
              )}
              onClick={() => setMode("walkin")}
            >
              Vãng lai
            </button>
          </div>

          {mode === "registered" ? (
            <div className="space-y-4">
              {patients.length === 0 ? (
                <p className="text-sm text-amber-800">
                  Chưa có hồ sơ.{" "}
                  <Link className="font-semibold underline" href={ROUTES.RECEPTION.PATIENTS}>
                    Tạo bệnh nhân
                  </Link>{" "}
                  trước.
                </p>
              ) : (
                <>
                  <div>
                    <label className="text-xs font-medium text-slate-500">
                      Bệnh nhân
                    </label>
                    <Select
                      value={patientId}
                      onValueChange={(v) => {
                        setPatientId(v)
                        setAppointmentId(NO_APPOINTMENT)
                      }}
                    >
                      <SelectTrigger className="mt-1 w-full">
                        <SelectValue placeholder="Chọn bệnh nhân" />
                      </SelectTrigger>
                      <SelectContent>
                        {patients.map((p) => (
                          <SelectItem key={p.id} value={String(p.id)}>
                            {p.full_name} · #{p.medicalHistoryNumber}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {selectedPatient && todaysAppointmentsForPatient.length > 0 ? (
                    <div>
                      <label className="text-xs font-medium text-slate-500">
                        Gắn lịch hẹn hôm nay (tuỳ chọn)
                      </label>
                      <Select value={appointmentId} onValueChange={setAppointmentId}>
                        <SelectTrigger className="mt-1 w-full">
                          <SelectValue placeholder="Không chọn — chỉ check-in hồ sơ" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={NO_APPOINTMENT}>Không gắn lịch</SelectItem>
                          {todaysAppointmentsForPatient.map((a: Appointment) => (
                            <SelectItem key={a.id} value={String(a.id)}>
                              {formatDateTimeVi(a.starts_at)}
                              {a.reason ? ` — ${a.reason}` : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-slate-500">Họ tên</label>
                <Input
                  className="mt-1"
                  value={walkName}
                  onChange={(e) => setWalkName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-slate-500">
                  Mã hồ sơ tạm / giấy tờ
                </label>
                <Input
                  className="mt-1"
                  value={walkCode}
                  onChange={(e) => setWalkCode(e.target.value)}
                  placeholder="VD: VL-001"
                />
              </div>
              <p className="text-xs text-slate-500 sm:col-span-2">
                Vãng lai: chưa có <code className="rounded bg-slate-100 px-1">patientId</code>{" "}
                trong queue — sau khi tạo hồ sơ, BE có thể cập nhật liên kết.
              </p>
            </div>
          )}

          <Button
            className="w-full rounded-full bg-medical-primary hover:bg-medical-dark sm:w-auto"
            loading={loading}
            disabled={mode === "registered" && patients.length === 0}
            onClick={() => void handleCheckIn()}
          >
            Check-in — đưa vào hàng đợi
          </Button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">
            Hàng đợi (stub)
          </h2>
          {queue.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              Chưa có ca nào. Check-in để thấy bản ghi; tab Bác sĩ đồng bộ qua{" "}
              <code className="rounded bg-slate-100 px-1 text-xs">localStorage</code>.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-slate-100">
              {queue.map((q) => (
                <li
                  key={q.id}
                  className="flex flex-col gap-1 py-3 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
                >
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="font-medium text-slate-800">{q.patientName}</span>
                    <span className="text-medical-primary">#{q.medicalHistoryNumber}</span>
                    {q.source ? (
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                          q.source === "REGISTERED"
                            ? "bg-emerald-50 text-emerald-800"
                            : "bg-amber-50 text-amber-900"
                        )}
                      >
                        {q.source === "REGISTERED" ? "Hồ sơ" : "Vãng lai"}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-x-3 text-xs text-slate-400">
                    <span>{formatDateVi(q.enqueuedAt)}</span>
                    {q.patientId != null ? (
                      <span>BN id: {q.patientId}</span>
                    ) : null}
                    {q.appointmentId != null ? (
                      <span>Lịch: {q.appointmentId}</span>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
