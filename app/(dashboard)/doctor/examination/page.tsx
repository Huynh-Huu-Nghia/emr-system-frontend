"use client"

import { useState, useEffect } from "react"
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
import { Save, ArrowRight, ArrowLeft, History, FileText, CheckCircle } from "lucide-react"
import { medicalRecordService, type MedicalRecord } from "@/core/api/medicalRecordService"
import { prescriptionService } from "@/core/api/prescriptionService"
import { queueService } from "@/core/api/queueService"
import { doctorService } from "@/core/api/doctorService"
import { authService } from "@/core/api/authService"
import { ROUTES } from "@/constants/routes"
import { formatDateVi } from "@/shared/lib/format/date"
import { PatientProfileModal } from "@/components/patients/patient-profile-modal"

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
        <div className="grid grid-cols-2 gap-4 rounded-xl bg-blue-50/50 p-4 border border-blue-100">
          <h4 className="col-span-2 text-sm font-semibold text-blue-700">Chỉ số sinh tồn</h4>
          <div className="space-y-1">
            <Label className="text-xs">Nhiệt độ (°C)</Label>
            <Input className="bg-white" value={form.temperature ?? ""} onChange={(e) => onChange("temperature", e.target.value)} placeholder="36.5" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Huyết áp (mmHg)</Label>
            <Input className="bg-white" value={form.bloodPressure ?? ""} onChange={(e) => onChange("bloodPressure", e.target.value)} placeholder="120/80" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Nhịp tim (bpm)</Label>
            <Input className="bg-white" value={form.heartRate ?? ""} onChange={(e) => onChange("heartRate", e.target.value)} placeholder="72" />
          </div>
        </div>
      )
    case "PEDIATRICS":
      return (
        <div className="grid grid-cols-2 gap-4 rounded-xl bg-green-50/50 p-4 border border-green-100">
          <h4 className="col-span-2 text-sm font-semibold text-green-700">Thông số Nhi khoa</h4>
          <div className="space-y-1">
            <Label className="text-xs">Cân nặng (kg)</Label>
            <Input className="bg-white" value={form.weight ?? ""} onChange={(e) => onChange("weight", e.target.value)} placeholder="12.5" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Chiều cao (cm)</Label>
            <Input className="bg-white" value={form.height ?? ""} onChange={(e) => onChange("height", e.target.value)} placeholder="85" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Nhiệt độ (°C)</Label>
            <Input className="bg-white" value={form.temperature ?? ""} onChange={(e) => onChange("temperature", e.target.value)} placeholder="37.0" />
          </div>
        </div>
      )
    case "DENTAL":
      return (
        <div className="grid grid-cols-2 gap-4 rounded-xl bg-purple-50/50 p-4 border border-purple-100">
          <h4 className="col-span-2 text-sm font-semibold text-purple-700">Răng hàm mặt</h4>
          <div className="col-span-2 space-y-1">
            <Label className="text-xs">Vị trí răng (số răng)</Label>
            <Input className="bg-white" value={form.toothNumber ?? ""} onChange={(e) => onChange("toothNumber", e.target.value)} placeholder="VD: 36, 47" />
          </div>
        </div>
      )
    case "CARDIOLOGY":
      return (
        <div className="grid grid-cols-2 gap-4 rounded-xl bg-red-50/50 p-4 border border-red-100">
          <h4 className="col-span-2 text-sm font-semibold text-red-700">Tim mạch</h4>
          <div className="space-y-1">
            <Label className="text-xs">Huyết áp (mmHg)</Label>
            <Input className="bg-white" value={form.bloodPressure ?? ""} onChange={(e) => onChange("bloodPressure", e.target.value)} placeholder="120/80" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Nhịp tim (bpm)</Label>
            <Input className="bg-white" value={form.heartRate ?? ""} onChange={(e) => onChange("heartRate", e.target.value)} placeholder="72" />
          </div>
        </div>
      )
    case "DERMATOLOGY":
      return (
        <div className="grid grid-cols-2 gap-4 rounded-xl bg-amber-50/50 p-4 border border-amber-100">
          <h4 className="col-span-2 text-sm font-semibold text-amber-700">Da liễu</h4>
          <div className="col-span-2 space-y-1">
            <Label className="text-xs">Vùng da tổn thương</Label>
            <Input className="bg-white" value={form.skinArea ?? ""} onChange={(e) => onChange("skinArea", e.target.value)} placeholder="VD: Mặt, cánh tay trái" />
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
  const patientId = searchParams.get("patientId")
  const reasonParam = searchParams.get("reason")

  const [step, setStep] = useState<"exam" | "prescription">("exam")
  const [saving, setSaving] = useState(false)
  const [createdRecordId, setCreatedRecordId] = useState<number | null>(null)
  
  const [historyRecords, setHistoryRecords] = useState<MedicalRecord[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  const [form, setForm] = useState<ExamFormData>({
    symptoms: reasonParam ?? "",
    diagnosis: "",
    treatmentPlan: "",
    recordType: "GENERAL",
  })

  const [checkingRecord, setCheckingRecord] = useState(false)
  const [doctorSpecialtyName, setDoctorSpecialtyName] = useState("Đang tải...")

  // Auto-detect doctor specialty
  useEffect(() => {
    authService.getCurrentUser().then(user => {
      if (user && user.role === "DOCTOR") {
        doctorService.getAll().then(docs => {
          const doc = docs.find(d => d.userId.toString() === user.id)
          if (doc && doc.specialty) {
            setDoctorSpecialtyName(doc.specialty)
            let mappedType: RecordType = "GENERAL"
            const spec = doc.specialty.toUpperCase()
            if (spec.includes("NHI")) mappedType = "PEDIATRICS"
            else if (spec.includes("RĂNG") || spec.includes("NHA")) mappedType = "DENTAL"
            else if (spec.includes("TIM")) mappedType = "CARDIOLOGY"
            else if (spec.includes("DA LIỄU") || spec.includes("DA")) mappedType = "DERMATOLOGY"
            
            setForm(prev => ({...prev, recordType: mappedType}))
          } else {
            setDoctorSpecialtyName("Không xác định")
          }
        }).catch(() => setDoctorSpecialtyName("Không xác định"))
      }
    })
  }, [])


  // Fetch History
  useEffect(() => {
    if (patientId) {
      setLoadingHistory(true)
      medicalRecordService.getByPatientId(Number(patientId))
        .then(data => {
          setHistoryRecords(data)
        })
        .catch(err => console.error(err))
        .finally(() => setLoadingHistory(false))
    }
  }, [patientId])

  // Check for existing medical record
  useEffect(() => {
    if (appointmentId) {
      setCheckingRecord(true)
      medicalRecordService
        .getByAppointmentId(Number(appointmentId))
        .then((record) => {
          if (record) {
            setCreatedRecordId(record.id)
            setStep("prescription")
            toast.info("Đã tìm thấy bệnh án cũ cho lịch hẹn này, chuyển đến kê đơn thuốc.")
          }
        })
        .catch((err) => {
          console.error("Failed to check existing medical record", err)
        })
        .finally(() => {
          setCheckingRecord(false)
        })
    }
  }, [appointmentId])

  // Restore draft
  useEffect(() => {
    const draftKey = `exam_draft_${appointmentId || queueId || "walkin"}`
    const draft = localStorage.getItem(draftKey)
    if (draft) {
      try {
        const parsed = JSON.parse(draft)
        if (!parsed.symptoms && reasonParam) {
          parsed.symptoms = reasonParam
        }
        setForm(parsed)
      } catch (e) {
        console.error("Failed to parse draft", e)
      }
    }
  }, [appointmentId, queueId, reasonParam])

  // Save draft
  useEffect(() => {
    const draftKey = `exam_draft_${appointmentId || queueId || "walkin"}`
    localStorage.setItem(draftKey, JSON.stringify(form))
  }, [form, appointmentId, queueId])

  const [autoRecovering, setAutoRecovering] = useState(!patientName)

  // Auto-recover IN_PROGRESS exam if accessed directly
  useEffect(() => {
    if (!patientName) {
      queueService.getQueue()
        .then((queue) => {
          const inProgress = queue.find(q => q.status === "IN_PROGRESS")
          if (inProgress) {
            const params = new URLSearchParams()
            params.set("patientName", inProgress.patientName)
            params.set("medicalHistoryNumber", inProgress.medicalHistoryNumber)
            params.set("queueId", String(inProgress.id))
            if (inProgress.patientId != null) params.set("patientId", String(inProgress.patientId))
            if (inProgress.appointmentId != null) params.set("appointmentId", String(inProgress.appointmentId))
            router.replace(`${ROUTES.DOCTOR.EXAMINATION}?${params.toString()}`)
          } else {
            setAutoRecovering(false)
          }
        })
        .catch(err => {
          console.error("Failed to recover queue", err)
          setAutoRecovering(false)
        })
    }
  }, [patientName, router])

  // Loading check
  if (checkingRecord) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-sm text-slate-500">Đang kiểm tra hồ sơ bệnh án cũ cho lịch hẹn này...</p>
      </div>
    )
  }



  // Redirect nếu không có bệnh nhân
  if (!patientName) {
    if (autoRecovering) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
          <p className="text-sm text-slate-500">Đang tìm kiếm ca khám đang thực hiện...</p>
        </div>
      )
    }
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-sm text-slate-500">Không có ca khám nào đang thực hiện. Vui lòng chọn bệnh nhân từ Phòng Khám</p>
        <Button onClick={() => router.push(ROUTES.DOCTOR.PATIENTS)} className="bg-medical-primary text-white hover:bg-medical-dark">
          Quay lại Phòng Khám
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

  const handleSaveRecord = async (action: "PRESCRIPTION" | "COMPLETE") => {
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
      
      // Clear draft after successful save
      const draftKey = `exam_draft_${appointmentId || queueId || "walkin"}`
      localStorage.removeItem(draftKey)
      
      toast.success("Đã lưu bệnh án")
      
      if (action === "PRESCRIPTION") {
        setStep("prescription")
      } else {
        // Create an empty prescription to trigger payment flow with 0 VND
        try {
          await prescriptionService.create({
            medicalRecordId: result.id,
            notes: "Không kê đơn thuốc",
            totalPrice: 0,
          })
        } catch (err) {
          console.error("Failed to create empty prescription", err)
        }
        // Complete exam immediately
        await handleFinish()
      }
    } catch (error) {
      console.error("DEBUG_SAVE_RECORD_ERROR:", error)
      toast.error("Không thể lưu bệnh án")
    } finally {
      setSaving(false)
    }
  }

  const handleFinish = async () => {
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

      <div className="mt-6 grid gap-6 lg:grid-cols-12 items-start">
        {/* Left Column: Patient Info & History */}
        <div className="space-y-4 lg:col-span-4 sticky top-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-medical-primary" />
                Thông tin bệnh nhân
              </h3>
              <PatientProfileModal 
                patientName={patientName || ""} 
                medicalHistoryNumber={medicalHistoryNumber}
                historyRecords={historyRecords}
              />
            </div>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                <dt className="text-slate-500">Họ tên</dt>
                <dd className="font-medium text-slate-800">{patientName}</dd>
              </div>
              <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                <dt className="text-slate-500">Mã hồ sơ</dt>
                <dd className="font-mono text-medical-primary bg-medical-primary/10 px-2 py-0.5 rounded">{medicalHistoryNumber}</dd>
              </div>
              {appointmentId && (
                <div className="flex justify-between items-center pb-1">
                  <dt className="text-slate-500">Mã lịch hẹn</dt>
                  <dd className="font-mono text-slate-600">#{appointmentId}</dd>
                </div>
              )}
            </dl>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col h-[500px]">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <History className="w-4 h-4 text-slate-400" /> Lịch sử khám
              </h3>
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                {historyRecords.length}
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loadingHistory ? (
                <div className="text-center text-sm text-slate-400 py-4">Đang tải...</div>
              ) : historyRecords.length === 0 ? (
                <div className="text-center text-sm text-slate-400 py-8">Chưa có lịch sử khám bệnh</div>
              ) : (
                historyRecords.map(record => (
                  <div key={record.id} className="border border-slate-100 rounded-xl p-3 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-medical-primary">{formatDateVi(record.createdAt)}</span>
                      <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500 bg-slate-200/50 px-2 py-0.5 rounded">
                        {RECORD_TYPE_LABELS[record.recordType as RecordType] || record.recordType}
                      </span>
                    </div>
                    <div className="space-y-1.5 mt-2">
                      <p className="text-xs text-slate-600 line-clamp-2"><span className="font-medium text-slate-700">CĐ:</span> {record.diagnosis}</p>
                      <p className="text-xs text-slate-500 line-clamp-2"><span className="font-medium text-slate-700">TC:</span> {record.symptoms}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Exam Form */}
        <div className="space-y-6 lg:col-span-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
            
            {/* Specialty Information */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <h3 className="text-sm font-semibold text-slate-700">Chuyên khoa khám</h3>
                <p className="text-xs text-slate-500 mt-0.5">Các chỉ số phụ dựa trên chuyên khoa của bác sĩ</p>
              </div>
              <div className="w-full sm:w-[240px] text-right">
                <span className="inline-flex items-center rounded-md bg-medical-primary/10 px-2 py-1 text-sm font-medium text-medical-primary ring-1 ring-inset ring-medical-primary/20">
                  {doctorSpecialtyName}
                </span>
              </div>
            </div>

            <SpecialtyFields
              recordType={form.recordType}
              form={form}
              onChange={handleFieldChange}
            />

            <div className="space-y-5 pt-4 border-t border-slate-100">
              <div className="space-y-2">
                <Label htmlFor="symptoms" className="text-slate-700 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400" /> Triệu chứng bệnh nhân <span className="text-red-500">*</span>
                </Label>
                <textarea
                  id="symptoms"
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 p-3.5 text-sm outline-none transition-all focus:border-medical-primary focus:ring-1 focus:ring-medical-primary/20"
                  placeholder="Mô tả chi tiết triệu chứng lâm sàng..."
                  value={form.symptoms}
                  onChange={(e) => handleFieldChange("symptoms", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="diagnosis" className="text-slate-700 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400" /> Chẩn đoán <span className="text-red-500">*</span>
                </Label>
                <textarea
                  id="diagnosis"
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 p-3.5 text-sm outline-none transition-all focus:border-medical-primary focus:ring-1 focus:ring-medical-primary/20"
                  placeholder="Kết luận chẩn đoán bệnh..."
                  value={form.diagnosis}
                  onChange={(e) => handleFieldChange("diagnosis", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="treatmentPlan" className="text-slate-700 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400" /> Hướng điều trị
                </Label>
                <textarea
                  id="treatmentPlan"
                  rows={2}
                  className="w-full rounded-xl border border-slate-200 p-3.5 text-sm outline-none transition-all focus:border-medical-primary focus:ring-1 focus:ring-medical-primary/20"
                  placeholder="Phác đồ điều trị chung, lời khuyên..."
                  value={form.treatmentPlan}
                  onChange={(e) => handleFieldChange("treatmentPlan", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm mt-6">
            <Button
              variant="ghost"
              className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
              onClick={() => router.push(ROUTES.DOCTOR.DASHBOARD)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Thoát
            </Button>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={() => handleSaveRecord("COMPLETE")}
                disabled={saving}
                className="rounded-xl border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                <CheckCircle className="mr-2 h-4 w-4 text-emerald-600" />
                {saving ? "Đang xử lý..." : "Lưu & Hoàn tất (Không kê đơn)"}
              </Button>
              <Button
                onClick={() => handleSaveRecord("PRESCRIPTION")}
                disabled={saving}
                className="rounded-xl bg-medical-primary text-white hover:bg-medical-dark shadow-md"
              >
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Đang xử lý..." : "Lưu & Chuyển sang kê đơn"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// --- Prescription Step (inline) ---
import { PrescriptionBuilder } from "@/modules/doctor/components/prescription-builder"
import { UserCheck } from "lucide-react"

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
