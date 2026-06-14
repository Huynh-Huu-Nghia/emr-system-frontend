"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Plus } from "lucide-react"

import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { useDoctorsQuery } from "@/modules/admin/hooks/use-doctors-query"
import { useCreateAppointmentMutation } from "@/modules/appointment/hooks/use-appointment-mutations"
import { PatientDialog } from "@/components/reception/patient-dialog"
import {
  pushToQueue,
  useListenQueue,
} from "@/shared/queue/queue-stub"
import { formatDateTimeVi, formatDateVi } from "@/shared/lib/format/date"
import type { Appointment } from "@/core/api/appointmentService"
import type { Patient } from "@/modules/patient/types"

const NO_APPOINTMENT = "__none__"

function queueStatusLabel(status?: string) {
  switch ((status || "").toUpperCase()) {
    case "CALLED":
      return "BS Đang Gọi"
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
  const { data: patients = [] } = usePatientsQuery()
  const { data: appointments = [] } = useAppointmentsQuery()
  const { data: doctors = [] } = useDoctorsQuery()
  const createAppointment = useCreateAppointmentMutation()

  const [activeTab, setActiveTab] = useState("scheduled")
  
  // Scheduled Tab state
  const [scheduledPatientId, setScheduledPatientId] = useState<string>("")
  const [scheduledAppointmentId, setScheduledAppointmentId] = useState<string>(NO_APPOINTMENT)
  
  // Walk-in Tab state
  const [walkinPatientId, setWalkinPatientId] = useState<string>("")
  const [walkinDoctorId, setWalkinDoctorId] = useState<string>("")
  const [walkinReason, setWalkinReason] = useState<string>("")
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false)

  const [loading, setLoading] = useState(false)

  // --- SCHEDULED LOGIC ---
  const patientsWithAppointmentsToday = useMemo(() => {
    const validAppointments = appointments.filter(
      (a) =>
        String(a.status).toUpperCase() === "PENDING" &&
        isSameLocalCalendarDay(a.starts_at)
    )
    const patientIds = new Set(validAppointments.map((a) => String(a.patient_id)))
    return patients.filter((p) => patientIds.has(String(p.id)))
  }, [patients, appointments])

  const selectedScheduledPatient = useMemo(
    () => patientsWithAppointmentsToday.find((p) => String(p.id) === scheduledPatientId),
    [patientsWithAppointmentsToday, scheduledPatientId]
  )

  const todaysAppointmentsForPatient = useMemo(() => {
    if (!selectedScheduledPatient) return []
    return appointments.filter(
      (a) =>
        String(a.patient_id) === String(selectedScheduledPatient.id) &&
        String(a.status).toUpperCase() === "PENDING" &&
        isSameLocalCalendarDay(a.starts_at)
    )
  }, [appointments, selectedScheduledPatient])

  const handleScheduledCheckIn = async () => {
    if (!selectedScheduledPatient) {
      toast.error("Vui lòng chọn bệnh nhân")
      return
    }

    const apptId = scheduledAppointmentId && scheduledAppointmentId !== NO_APPOINTMENT ? Number(scheduledAppointmentId) : null
    if (!apptId) {
      toast.error("Bắt buộc phải chọn lịch hẹn để check-in")
      return
    }

    const appt = appointments.find((a) => a.id === apptId)
    if (!appt || appt.patient_id !== selectedScheduledPatient.id) {
      toast.error("Lịch hẹn không hợp lệ")
      return
    }

    setLoading(true)
    try {
      await pushToQueue({
        patientName: selectedScheduledPatient.full_name,
        medicalHistoryNumber: selectedScheduledPatient.medicalHistoryNumber,
        patientId: selectedScheduledPatient.id,
        appointmentId: apptId,
        source: "REGISTERED",
      })

      toast.success("Đã check-in thành công")
      setScheduledAppointmentId(NO_APPOINTMENT)
      setScheduledPatientId("")
    } catch (e) {
      toast.error("Lỗi khi check-in")
    } finally {
      setLoading(false)
    }
  }

  // --- WALK-IN LOGIC ---
  const handleWalkinCheckIn = async () => {
    if (!walkinPatientId || !walkinDoctorId) {
      toast.error("Vui lòng chọn bệnh nhân và bác sĩ")
      return
    }

    const patient = patients.find(p => String(p.id) === walkinPatientId)
    if (!patient) return

    setLoading(true)
    try {
      // Create appointment for right now
      const now = new Date()
      const newAppt = await createAppointment.mutateAsync({
        doctor_id: Number(walkinDoctorId),
        patient_id: patient.id,
        patient_name: patient.full_name,
        medical_history_number: patient.medicalHistoryNumber,
        starts_at: now.toISOString(),
        reason: walkinReason,
      })

      // Push to queue immediately
      await pushToQueue({
        patientName: patient.full_name,
        medicalHistoryNumber: patient.medicalHistoryNumber,
        patientId: patient.id,
        appointmentId: newAppt.id,
        source: "WALK_IN",
      })

      toast.success("Đăng ký trực tiếp thành công")
      setWalkinPatientId("")
      setWalkinDoctorId("")
      setWalkinReason("")
    } catch (e) {
      toast.error("Lỗi khi đăng ký trực tiếp")
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
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="bg-slate-50 p-4 border-b border-slate-100">
              <TabsList className="w-full grid grid-cols-2 p-1 bg-slate-200/50">
                <TabsTrigger value="scheduled" className="rounded-md">Theo lịch hẹn</TabsTrigger>
                <TabsTrigger value="walkin" className="rounded-md">Đăng ký trực tiếp</TabsTrigger>
              </TabsList>
            </div>

            {/* TAB SCHEDULED */}
            <TabsContent value="scheduled" className="p-6 pt-4 m-0 space-y-6">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-4">
                Check-in qua lịch hẹn (Hôm nay)
              </h2>
              
              <div className="space-y-4">
                {patientsWithAppointmentsToday.length === 0 ? (
                  <p className="text-sm text-amber-800 bg-amber-50 p-3 rounded-lg border border-amber-100">
                    Hôm nay không có lịch hẹn nào đang chờ check-in.
                  </p>
                ) : (
                  <>
                    <div>
                      <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                        Chọn bệnh nhân
                      </label>
                      <Select value={scheduledPatientId} onValueChange={(v) => { setScheduledPatientId(v); setScheduledAppointmentId(NO_APPOINTMENT) }}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Bệnh nhân có lịch hôm nay" />
                        </SelectTrigger>
                        <SelectContent>
                          {patientsWithAppointmentsToday.map((p) => (
                            <SelectItem key={p.id} value={String(p.id)}>
                              {p.full_name} · #{p.medicalHistoryNumber}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedScheduledPatient && (
                      <div>
                        <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                          Chọn lịch hẹn
                        </label>
                        <Select value={scheduledAppointmentId} onValueChange={setScheduledAppointmentId}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Chọn lịch hẹn" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={NO_APPOINTMENT} disabled>-- Vui lòng chọn --</SelectItem>
                            {todaysAppointmentsForPatient.map((a: Appointment) => (
                              <SelectItem key={a.id} value={String(a.id)}>
                                {formatDateTimeVi(a.starts_at)} {a.reason ? ` — ${a.reason}` : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </>
                )}
              </div>

              <Button
                className="w-full rounded-xl bg-medical-primary hover:bg-medical-dark shadow-md"
                loading={loading}
                disabled={patientsWithAppointmentsToday.length === 0 || scheduledAppointmentId === NO_APPOINTMENT}
                onClick={() => void handleScheduledCheckIn()}
              >
                Xác nhận Check-in
              </Button>
            </TabsContent>

            {/* TAB WALKIN */}
            <TabsContent value="walkin" className="p-6 pt-4 m-0 space-y-6">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-4">
                Khách vãng lai (Đăng ký nhanh)
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                    Bệnh nhân
                  </label>
                  <div className="flex gap-2">
                    <Select value={walkinPatientId} onValueChange={setWalkinPatientId}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Tìm bệnh nhân..." />
                      </SelectTrigger>
                      <SelectContent>
                        {patients.map((p) => (
                          <SelectItem key={p.id} value={String(p.id)}>
                            {p.full_name} · #{p.medicalHistoryNumber}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="icon" className="shrink-0 rounded-xl" onClick={() => setIsPatientModalOpen(true)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                    Bác sĩ khám
                  </label>
                  <Select value={walkinDoctorId} onValueChange={setWalkinDoctorId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn bác sĩ" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map((d) => (
                        <SelectItem key={d.id} value={String(d.id)}>
                          BS. {d.fullName} ({d.specialty})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                    Lý do khám
                  </label>
                  <Input 
                    placeholder="VD: Đau họng, sốt..." 
                    value={walkinReason} 
                    onChange={e => setWalkinReason(e.target.value)} 
                    className="rounded-xl"
                  />
                </div>
              </div>

              <Button
                className="w-full rounded-xl bg-medical-primary hover:bg-medical-dark shadow-md"
                loading={loading}
                disabled={!walkinPatientId || !walkinDoctorId}
                onClick={() => void handleWalkinCheckIn()}
              >
                Đăng ký & Đưa vào hàng đợi
              </Button>
            </TabsContent>
          </Tabs>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">
            Hàng đợi hiện tại
          </h2>

          {queue.length === 0 ? (
            <div className="mt-8 flex flex-col items-center justify-center p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <p className="text-sm text-slate-500">Chưa có bệnh nhân nào trong hàng đợi.</p>
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-slate-100">
              {queue.map((q) => (
                <li
                  key={q.id}
                  className="flex flex-col gap-1 py-3 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
                >
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="font-medium text-slate-800">
                      {q.patientName}
                    </span>
                    <span className="text-medical-primary font-medium bg-medical-primary/10 px-1.5 py-0.5 rounded">
                      #{q.medicalHistoryNumber}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-500">
                      {q.source === "WALK_IN" ? "Vãng lai" : "Đặt lịch"}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-slate-400 w-full sm:w-auto mt-1 sm:mt-0">
                    <span className="font-medium text-slate-600">{q.doctorName}</span>
                    <span className={`rounded-full px-2 py-0.5 font-semibold border
                      ${q.status === 'WAITING' ? 'bg-amber-50 text-amber-700 border-amber-200' : ''}
                      ${q.status === 'CALLED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : ''}
                      ${q.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                      ${q.status === 'DONE' ? 'bg-slate-100 text-slate-600 border-slate-200' : ''}
                    `}>
                      {queueStatusLabel(q.status)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <PatientDialog
        isOpen={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
        onCreated={(newPatient) => setWalkinPatientId(String(newPatient.id))}
      />
    </div>
  )
}