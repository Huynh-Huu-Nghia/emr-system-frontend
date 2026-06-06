"use client"

import { useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Save, ArrowRight, ArrowLeft } from "lucide-react"
import { medicalRecordService } from "@/core/api/medicalRecordService"
import { queueService } from "@/core/api/queueService"
import { ROUTES } from "@/constants/routes"

type RecordType = "GENERAL" | "PEDIATRICS" | "DENTAL" | "CARDIOLOGY" | "DERMATOLOGY"

const RECORD_TYPE_LABELS: Record<RecordType, string> = {
  GENERAL: "Khám tổng quát",
  PEDIATRICS: "Nhi khoa",
  DENTAL: "Răng hàm mặt",
  CARDIOLOGY: "Tim mạch",
  DERMATOLOGY: "Da liễu",
}

interface ExamFormData {
  symptoms: string
  diagnosis: string
  treatmentPlan: string
  recordType: RecordType
  // Specialty-specific fields
  temperature?: string
  bloodPressure?: string
  heartRate?: string
  weight?: string
  height?: string
  toothNumber?: string
  skinArea?: string
}

function SpecialtyFields({ recordType, form, onChange }: {
  recordType: RecordType
  form: ExamFormData
  onChange: (field: string, value: string) => void
}) {
  switch (recordType) {
    case "GENERAL":
      return (
        <div className="grid grid-cols-2 gap-4 rounded-xl bg-blue-50 p-4">
          <h4 className="col-span-2 text-sm font-semibold text-blue-700">Chỉ số sinh tồn</h4>
          <div className="space-y-1">
            <Label className="text-xs">Nhiệt độ (°C)</Label>
            <Input value={form.temperature ?? ""} onChange={(e) => onChange("temperature", e.target.value)} placeholder="36.5" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Huyết áp (mmHg)</Label>
            <Input value={form.bloodPressure ?? ""} onChange={(e) => onChange("bloodPressure", e.target.value)} placeholder="120/80" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Nhịp tim (bpm)</Label>
            <Input value={form.heartRate ?? ""} onChange={(e) => onChange("heartRate", e.target.value)} placeholder="72" />
          </div>
        </div>
      )
    case "PEDIATRICS":
      return (
        <div className="grid grid-cols-2 gap-4 rounded-xl bg-green-50 p-4">
          <h4 className="col-span-2 text-sm font-semibold text-green-700">Thông số Nhi khoa</h4>
          <div className="space-y-1">
            <Label className="text-xs">Cân nặng (kg)</Label>
            <Input value={form.weight ?? ""} onChange={(e) => onChange("weight", e.target.value)} placeholder="12.5" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Chiều cao (cm)</Label>
            <Input value={form.height ?? ""} onChange={(e) => onChange("height", e.target.value)} placeholder="85" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Nhiệt độ (°C)</Label>
            <Input value={form.temperature ?? ""} onChange={(e) => onChange("temperature", e.target.value)} placeholder="37.0" />
          </div>
        </div>
      )
    case "DENTAL":
      return (
        <div className="grid grid-cols-2 gap-4 rounded-xl bg-purple-50 p-4">
          <h4 className="col-span-2 text-sm font-semibold text-purple-700">Răng hàm mặt</h4>
          <div className="col-span-2 space-y-1">
            <Label className="text-xs">Vị trí răng (số răng)</Label>
            <Input value={form.toothNumber ?? ""} onChange={(e) => onChange("toothNumber", e.target.value)} placeholder="VD: 36, 47" />
          </div>
        </div>
      )
    case "CARDIOLOGY":
      return (
        <div className="grid grid-cols-2 gap-4 rounded-xl bg-red-50 p-4">
          <h4 className="col-span-2 text-sm font-semibold text-red-700">Tim mạch</h4>
          <div className="space-y-1">
            <Label className="text-xs">Huyết áp (mmHg)</Label>
            <Input value={form.bloodPressure ?? ""} onChange={(e) => onChange("bloodPressure", e.target.value)} placeholder="120/80" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Nhịp tim (bpm)</Label>
            <Input value={form.heartRate ?? ""} onChange={(e) => onChange("heartRate", e.target.value)} placeholder="72" />
          </div>
        </div>
      )
    case "DERMATOLOGY":
      return (
        <div className="grid grid-cols-2 gap-4 rounded-xl bg-amber-50 p-4">
          <h4 className="col-span-2 text-sm font-semibold text-amber-700">Da liễu</h4>
          <div className="col-span-2 space-y-1">
            <Label className="text-xs">Vùng da tổn thương</Label>
            <Input value={form.skinArea ?? ""} onChange={(e) => onChange("skinArea", e.target.value)} placeholder="VD: Mặt, cánh tay trái" />
          </div>
        </div>
      )
  }
}

export default function DoctorExaminationPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const patientName = searchParams.get("patientName")
  const medicalHistoryNumber = searchParams.get("medicalHistoryNumber") ?? ""
  const appointmentId = searchParams.get("appointmentId")
  const queueId = searchParams.get("queueId")

  const [step, setStep] = useState<"exam" | "prescription">("exam")
  const [saving, setSaving] = useState(false)
  const [createdRecordId, setCreatedRecordId] = useState<number | null>(null)

  const [form, setForm] = useState<ExamFormData>({
    symptoms: "",
    diagnosis: "",
    treatmentPlan: "",
    recordType: "GENERAL",
  })

  // Redirect nếu không có bệnh nhân
  if (!patientName) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-sm text-slate-500">Vui lòng chọn bệnh nhân từ hàng đợi trước khi khám</p>
        <Button onClick={() => router.push(ROUTES.DOCTOR.PATIENTS)} className="bg-medical-primary text-white hover:bg-medical-dark">
          Quay lại danh sách bệnh nhân
        </Button>
      </div>
    )
  }

  const handleFieldChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const buildSymptomsWithVitals = (): string => {
    const parts = [form.symptoms]
    if (form.temperature) parts.push(`Nhiệt độ: ${form.temperature}°C`)
    if (form.bloodPressure) parts.push(`Huyết áp: ${form.bloodPressure}`)
    if (form.heartRate) parts.push(`Nhịp tim: ${form.heartRate} bpm`)
    if (form.weight) parts.push(`Cân nặng: ${form.weight} kg`)
    if (form.height) parts.push(`Chiều cao: ${form.height} cm`)
    if (form.toothNumber) parts.push(`Răng: ${form.toothNumber}`)
    if (form.skinArea) parts.push(`Vùng da: ${form.skinArea}`)
    return parts.filter(Boolean).join(" | ")
  }

  const handleSaveRecord = async () => {
    if (!form.symptoms.trim() || !form.diagnosis.trim()) {
      toast.error("Vui lòng nhập triệu chứng và chẩn đoán")
      return
    }

    setSaving(true)
    try {
      const result = await medicalRecordService.create({
        appointmentId: appointmentId ? Number(appointmentId) : null,
        symptoms: buildSymptomsWithVitals(),
        diagnosis: form.diagnosis,
        recordType: form.recordType,
        treatmentPlan: form.treatmentPlan,
      })
      setCreatedRecordId(result.id)
      toast.success("Đã lưu bệnh án")
      setStep("prescription")
    } catch {
      toast.error("Không thể lưu bệnh án")
    } finally {
      setSaving(false)
    }
  }

  const handleFinish = async () => {
    // Remove patient from queue after examination
    if (queueId) {
      try {
        await queueService.remove(Number(queueId))
      } catch {
        // Queue removal failure shouldn't block the flow
      }
    }
    toast.success("Hoàn tất khám bệnh")
    router.push(ROUTES.DOCTOR.DASHBOARD)
  }

  if (step === "prescription") {
    return (
      <PrescriptionStep
        medicalRecordId={createdRecordId!}
        patientName={patientName}
        onFinish={handleFinish}
        onBack={() => setStep("exam")}
      />
    )
  }

  return (
    <div className="min-h-screen bg-[#fafafa] p-6 lg:p-8">
      <PageHeader
        title={`Khám bệnh — ${patientName}`}
        description={`Mã hồ sơ: ${medicalHistoryNumber}`}
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        {/* Left: Patient info */}
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-slate-700">Thông tin bệnh nhân</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Họ tên</dt>
                <dd className="font-medium">{patientName}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Mã hồ sơ</dt>
                <dd className="font-mono text-medical-primary">{medicalHistoryNumber}</dd>
              </div>
              {appointmentId && (
                <div className="flex justify-between">
                  <dt className="text-slate-500">Mã lịch hẹn</dt>
                  <dd className="font-mono">#{appointmentId}</dd>
                </div>
              )}
            </dl>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-slate-700">Chuyên khoa</h3>
            <Select
              value={form.recordType}
              onValueChange={(v) => handleFieldChange("recordType", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(RECORD_TYPE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <SpecialtyFields
            recordType={form.recordType}
            form={form}
            onChange={handleFieldChange}
          />
        </div>

        {/* Right: Exam form */}
        <div className="space-y-4 lg:col-span-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="symptoms">Triệu chứng</Label>
                <textarea
                  id="symptoms"
                  rows={3}
                  className="w-full rounded-lg border border-slate-200 p-3 text-sm outline-none transition-colors focus:border-medical-primary"
                  placeholder="Mô tả triệu chứng bệnh nhân..."
                  value={form.symptoms}
                  onChange={(e) => handleFieldChange("symptoms", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="diagnosis">Chẩn đoán</Label>
                <textarea
                  id="diagnosis"
                  rows={3}
                  className="w-full rounded-lg border border-slate-200 p-3 text-sm outline-none transition-colors focus:border-medical-primary"
                  placeholder="Chẩn đoán bệnh..."
                  value={form.diagnosis}
                  onChange={(e) => handleFieldChange("diagnosis", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="treatmentPlan">Hướng điều trị</Label>
                <textarea
                  id="treatmentPlan"
                  rows={2}
                  className="w-full rounded-lg border border-slate-200 p-3 text-sm outline-none transition-colors focus:border-medical-primary"
                  placeholder="Phác đồ điều trị..."
                  value={form.treatmentPlan}
                  onChange={(e) => handleFieldChange("treatmentPlan", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => router.push(ROUTES.DOCTOR.DASHBOARD)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
            </Button>
            <Button
              onClick={handleSaveRecord}
              disabled={saving}
              className="bg-medical-primary text-white hover:bg-medical-dark"
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Đang lưu..." : "Lưu & Kê đơn"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// --- Prescription Step (inline) ---
import { PrescriptionBuilder } from "@/modules/doctor/components/prescription-builder"

function PrescriptionStep({ medicalRecordId, patientName, onFinish, onBack }: {
  medicalRecordId: number
  patientName: string
  onFinish: () => void
  onBack: () => void
}) {
  return (
    <div className="min-h-screen bg-[#fafafa] p-6 lg:p-8">
      <PageHeader
        title={`Kê đơn thuốc — ${patientName}`}
        description="Tìm thuốc, thêm liều dùng và số lượng"
      />
      <div className="mt-6">
        <PrescriptionBuilder medicalRecordId={medicalRecordId} onFinish={onFinish} onBack={onBack} />
      </div>
    </div>
  )
}
