"use client"

import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Stethoscope, Clock, UserCheck } from "lucide-react"
import { useListenQueue } from "@/shared/queue/queue-stub"
import { formatDateVi } from "@/shared/lib/format/date"
import { ROUTES } from "@/constants/routes"

export default function DoctorPatientsPage() {
  const queue = useListenQueue()
  const router = useRouter()

  const handleStartExam = (patient: (typeof queue)[number]) => {
    const params = new URLSearchParams({
      patientName: patient.patientName,
      medicalHistoryNumber: patient.medicalHistoryNumber,
      ...(patient.patientId != null ? { patientId: String(patient.patientId) } : {}),
      ...(patient.appointmentId != null ? { appointmentId: String(patient.appointmentId) } : {}),
      queueId: patient.id,
    })
    router.push(`${ROUTES.DOCTOR.EXAMINATION}?${params.toString()}`)
  }

  return (
    <div className="min-h-screen space-y-8 bg-[#fafafa] p-6 lg:p-8">
      <PageHeader
        title="Bệnh nhân đang chờ"
        description="Danh sách bệnh nhân chờ khám theo thứ tự check-in"
      >
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Clock className="h-4 w-4" />
          {queue.length} bệnh nhân
        </div>
      </PageHeader>

      {queue.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-slate-200 bg-white py-16 shadow-sm">
          <UserCheck className="h-16 w-16 text-slate-200" />
          <p className="text-sm font-medium text-slate-600">Chưa có bệnh nhân trong hàng đợi</p>
          <p className="text-xs text-slate-400">Bệnh nhân sẽ xuất hiện khi lễ tân thực hiện check-in</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="divide-y divide-slate-100">
            {queue.map((patient, idx) => (
              <div
                key={patient.id}
                className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-slate-50"
              >
                <div className="flex items-center gap-4">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-medical-light text-sm font-bold text-medical-primary">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-800">{patient.patientName}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>#{patient.medicalHistoryNumber}</span>
                      <span>•</span>
                      <span>{formatDateVi(patient.enqueuedAt)}</span>
                      {patient.source === "WALK_IN" && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">Vãng lai</span>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => handleStartExam(patient)}
                  size="sm"
                  className="rounded-lg bg-medical-primary text-white hover:bg-medical-dark"
                >
                  <Stethoscope className="mr-1.5 h-4 w-4" />
                  Khám
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
