"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"

import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
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
import { pushToQueue, useCallQueueMutation, useListenQueue } from "@/shared/queue/queue-stub"
import { formatDateTimeVi, formatDateVi } from "@/shared/lib/format/date"
import { cn } from "@/lib/utils"
import type { Appointment } from "@/core/api/appointmentService"

const NO_APPOINTMENT = "__none__"

function queueStatusLabel(status?: string) {
  switch ((status || "").toUpperCase()) {
    case "CALLED":
      return "Đã gọi"
    case "IN_PROGRESS":
      return "Đang khám"
    case "DONE":
      return "Hoàn tất"
    default:
      return "Đang chờ"
  }
}

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
  const callQueue = useCallQueueMutation()
  const { data: patients = [] } = usePatientsQuery()
  const { data: appointments = [] } = useAppointmentsQuery()

  const [patientId, setPatientId] = useState<string>("")
  const [appointmentId, setAppointmentId] = useState<string>(NO_APPOINTMENT)
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
        a.status === "PENDING" &&
        isSameLocalCalendarDay(a.starts_at)
    )
  }, [appointments, selectedPatient])

  const handleCheckIn = async () => {
    if (!selectedPatient) {
      toast.error("Vui lòng chọn bệnh nhân")
      return
    }

    const apptId =
      appointmentId && appointmentId !== NO_APPOINTMENT
        ? Number(appointmentId)
        : null

    if (!apptId) {
      toast.error("Bắt buộc phải chọn lịch hẹn để check-in")
      return
    }

    const appt = appointments.find((a) => a.id === apptId)
    if (!appt || appt.patient_id !== selectedPatient.id) {
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
      toast.success("Đã check-in — bệnh nhân đã vào hàng đợi")
      setAppointmentId(NO_APPOINTMENT)
      setPatientId("")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen space-y-8 bg-[#fafafa] p-6 lg:p-8">
      <PageHeader
        title="Tiếp đón & Check-in"
        description="Đưa bệnh nhân vào hàng đợi khám bệnh"
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
            Check-in (Yêu cầu lịch hẹn)
          </h2>

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
                {selectedPatient && (
                  <div>
                    <label className="text-xs font-medium text-slate-500">
                      Chọn lịch hẹn hôm nay
                    </label>
                    <Select value={appointmentId} onValueChange={setAppointmentId}>
                      <SelectTrigger className="mt-1 w-full">
                        <SelectValue placeholder="Chọn lịch hẹn" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NO_APPOINTMENT} disabled>-- Vui lòng chọn lịch hẹn --</SelectItem>
                        {todaysAppointmentsForPatient.length === 0 ? (
                          <SelectItem value="empty" disabled>Không có lịch hẹn nào hôm nay</SelectItem>
                        ) : (
                          todaysAppointmentsForPatient.map((a: Appointment) => (
                            <SelectItem key={a.id} value={String(a.id)}>
                              {formatDateTimeVi(a.starts_at)}
                              {a.reason ? ` — ${a.reason}` : ""}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
            )}
          </div>

          <Button
            className="w-full rounded-full bg-medical-primary hover:bg-medical-dark sm:w-auto"
            loading={loading}
            disabled={patients.length === 0 || appointmentId === NO_APPOINTMENT}
            onClick={() => void handleCheckIn()}
          >
            Check-in — đưa vào hàng đợi
          </Button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">
            Hàng đợi hiện tại
          </h2>
          {queue.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              Chưa có bệnh nhân nào. Check-in để đưa vào hàng đợi.
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
                    <span className="rounded-full bg-emerald-50 text-emerald-800 px-2 py-0.5 text-[10px] font-semibold uppercase">
                      Lịch hẹn
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-slate-400">
                    <span>{formatDateVi(q.enqueuedAt)}</span>
                    {q.patientId != null ? (
                      <span>BN id: {q.patientId}</span>
                    ) : null}
                    {q.appointmentId != null ? (
                      <span>Lịch: {q.appointmentId}</span>
                    ) : null}
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 font-semibold text-slate-600">
                      {queueStatusLabel(q.status)}
                    </span>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant={q.status === "CALLED" ? "secondary" : "outline"}
                    disabled={callQueue.isPending || q.status === "IN_PROGRESS"}
                    onClick={() => callQueue.mutate(q.id)}
                  >
                    {q.status === "CALLED" ? "Gọi tên lại" : "Gọi tên"}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
