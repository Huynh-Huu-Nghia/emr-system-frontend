"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus, FileText, Trash2, Stethoscope } from "lucide-react"
import {
  MasterModal,
  MasterModalContent,
  MasterModalHeader,
  MasterModalFooter,
  MasterModalAction,
} from "@/components/ui/master-modal"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { prescriptionTemplateService, type PrescriptionTemplate } from "@/core/api/prescriptionTemplateService"
import { useListenQueue, type QueuePatientStub } from "@/shared/queue/queue-stub"
import { toast } from "sonner"
import { ROUTES } from "@/constants/routes"

export function QuickPrescriptionModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const router = useRouter()
  const qc = useQueryClient()
  const queue = useListenQueue()
  const [selectedPatient, setSelectedPatient] = useState<QueuePatientStub | null>(null)

  const { data: templates = [], isPending } = useQuery({
    queryKey: ["prescription-templates"],
    queryFn: () => prescriptionTemplateService.getAll(),
    enabled: open,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => prescriptionTemplateService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["prescription-templates"] })
      toast.success("Đã xóa mẫu")
    },
  })

  const navigateToExam = (patient: QueuePatientStub, templateId?: number) => {
    const params = new URLSearchParams()
    params.set("patientName", patient.patientName)
    params.set("medicalHistoryNumber", patient.medicalHistoryNumber)
    params.set("queueId", String(patient.id))
    if (patient.patientId != null) params.set("patientId", String(patient.patientId))
    if (patient.appointmentId != null) params.set("appointmentId", String(patient.appointmentId))
    if (templateId != null) params.set("templateId", String(templateId))
    router.push(`${ROUTES.DOCTOR.EXAMINATION}?${params.toString()}`)
    onOpenChange(false)
    setSelectedPatient(null)
  }

  const handleSelectTemplate = (template: PrescriptionTemplate) => {
    if (!selectedPatient) {
      toast.error("Vui lòng chọn bệnh nhân trước")
      return
    }
    navigateToExam(selectedPatient, template.id)
  }

  return (
    <MasterModal open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setSelectedPatient(null) }}>
      <MasterModalContent className="sm:max-w-lg">
        <MasterModalHeader title="Đơn thuốc nhanh" />
        <div className="space-y-4 px-6 py-5">
          {/* Step 1: Chọn bệnh nhân */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase text-slate-400">1. Chọn bệnh nhân</p>
            {queue.length === 0 ? (
              <p className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-500">
                Chưa có bệnh nhân trong hàng đợi. Lễ tân cần check-in trước.
              </p>
            ) : (
              <div className="max-h-36 space-y-1 overflow-y-auto">
                {queue.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPatient(p)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      selectedPatient?.id === p.id
                        ? "bg-medical-light border border-medical-primary text-medical-primary font-medium"
                        : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <Stethoscope className="h-4 w-4 flex-shrink-0" />
                    <span>{p.patientName}</span>
                    <span className="text-xs text-slate-400">#{p.medicalHistoryNumber}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Step 2: Chọn mẫu đơn hoặc kê mới */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase text-slate-400">2. Chọn mẫu đơn thuốc</p>
            {isPending ? (
              <p className="py-4 text-center text-sm text-slate-400">Đang tải...</p>
            ) : templates.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-lg bg-slate-50 py-6">
                <FileText className="h-8 w-8 text-slate-200" />
                <p className="text-xs text-slate-400">Chưa có mẫu. Lưu mẫu khi kê đơn trong quá trình khám.</p>
              </div>
            ) : (
              <div className="max-h-40 space-y-1 overflow-y-auto">
                {templates.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 hover:bg-medical-light/50"
                  >
                    <button
                      className="flex-1 text-left"
                      onClick={() => handleSelectTemplate(t)}
                    >
                      <p className="text-sm font-medium text-slate-700">{t.name}</p>
                      <p className="text-xs text-slate-400">{t.items.length} thuốc</p>
                    </button>
                    <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(t.id)}>
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <MasterModalFooter>
          <MasterModalAction variant="secondary" onClick={() => { onOpenChange(false); setSelectedPatient(null) }}>
            Đóng
          </MasterModalAction>
          <MasterModalAction
            disabled={!selectedPatient}
            onClick={() => { if (selectedPatient) navigateToExam(selectedPatient) }}
          >
            <Plus className="mr-1 h-4 w-4" /> Kê đơn mới
          </MasterModalAction>
        </MasterModalFooter>
      </MasterModalContent>
    </MasterModal>
  )
}
