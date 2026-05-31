"use client"

import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Stethoscope, Clock, UserCheck } from "lucide-react"
import { useListenQueue, type QueuePatientStub } from "@/shared/queue/queue-stub"
import { formatDateVi } from "@/shared/lib/format/date"
import { ROUTES } from "@/constants/routes"

export default function DoctorDashboardPage() {
  const queue = useListenQueue()
  const router = useRouter()

  const handleStartExam = (patient: QueuePatientStub) => {
    const params = new URLSearchParams()
    params.set("patientName", patient.patientName)
    params.set("medicalHistoryNumber", patient.medicalHistoryNumber)
    params.set("queueId", String(patient.id))
    if (patient.patientId != null) params.set("patientId", String(patient.patientId))
    if (patient.appointmentId != null) params.set("appointmentId", String(patient.appointmentId))
    router.push(`${ROUTES.DOCTOR.EXAMINATION}?${params.toString()}`)
  }

  return (
    <div className="min-h-screen space-y-8 bg-[#fafafa] p-6 lg:p-8">
      <PageHeader
        title="Phòng khám"
        description="Danh sách bệnh nhân đang chờ khám"
      >
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Clock className="h-4 w-4" />
          {queue.length} bệnh nhân đang chờ
        </div>
      </PageHeader>

      {queue.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-slate-200 bg-white py-16 shadow-sm">
          <UserCheck className="h-16 w-16 text-slate-200" />
          <p className="text-sm text-slate-500">Chưa có bệnh nhân trong hàng đợi</p>
          <p className="text-xs text-slate-400">Lễ tân check-in bệnh nhân tại /reception/checkin</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {queue.map((patient, idx) => (
            <div
              key={patient.id}
              className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-lg font-semibold text-slate-800">{patient.patientName}</p>
                  <p className="text-sm text-medical-primary">#{patient.medicalHistoryNumber}</p>
                </div>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-medical-light text-sm font-bold text-medical-primary">
                  {idx + 1}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 text-xs">
                {patient.source === "WALK_IN" ? (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-700">Vãng lai</span>
                ) : (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-medium text-emerald-700">Có hồ sơ</span>
                )}
                <span className="text-slate-400">{formatDateVi(patient.enqueuedAt)}</span>
              </div>

              <Button
                onClick={() => handleStartExam(patient)}
                className="mt-auto h-10 w-full rounded-xl bg-medical-primary text-white shadow-sm hover:bg-medical-dark"
              >
                <Stethoscope className="mr-2 h-4 w-4" />
                Bắt đầu khám
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
