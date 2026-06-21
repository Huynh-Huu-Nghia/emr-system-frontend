"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, Plus, Trash2, ArrowLeft, CheckCircle2, BookmarkPlus, BookOpen } from "lucide-react"
import { toast } from "sonner"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { medicineService, type Medicine } from "@/core/api/medicineService"
import { prescriptionService } from "@/core/api/prescriptionService"
import { prescriptionTemplateService, type PrescriptionTemplate } from "@/core/api/prescriptionTemplateService"
import { queryKeys } from "@/shared/query/query-keys"
import { MedicineSearchModal } from "./medicine-search-modal"
import { useAuth } from "@/context/AuthContext"

interface PrescriptionItem {
  medicineId: number
  medicineName: string
  unit: string
  unitPrice: number
  quantity: number
  dosage: string
}

interface PrescriptionBuilderProps {
  medicalRecordId: number
  onFinish: () => void
  onBack: () => void
}

export function PrescriptionBuilder({ medicalRecordId, onFinish, onBack }: PrescriptionBuilderProps) {
  const { user } = useAuth()
  const doctorId = user?.id ? Number(user.id) : undefined
  const [items, setItems] = useState<PrescriptionItem[]>([])
  const [saving, setSaving] = useState(false)
  const [notes, setNotes] = useState("")
  const [showTemplates, setShowTemplates] = useState(false)
  const [showMedicineSearch, setShowMedicineSearch] = useState(false)
  const [templateName, setTemplateName] = useState("")
  const qc = useQueryClient()

  const { data: medicines = [] } = useQuery({
    queryKey: queryKeys.medicines.list(),
    queryFn: () => medicineService.getAll(),
  })

  const { data: templates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ["prescription-templates", doctorId],
    queryFn: () => prescriptionTemplateService.getByDoctor(doctorId as number),
    enabled: !!doctorId,
  })

  const totalPrice = useMemo(
    () => items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [items]
  )

  const handleAddMedicine = (med: Medicine) => {
    if (items.some((i) => i.medicineId === med.id)) {
      toast.error("Thuốc đã có trong đơn")
      return
    }
    setItems((prev) => [
      ...prev,
      {
        medicineId: med.id,
        medicineName: med.name,
        unit: med.unit,
        unitPrice: med.price,
        quantity: 1,
        dosage: "",
      },
    ])
  }

  const handleRemoveItem = (medicineId: number) => {
    setItems((prev) => prev.filter((i) => i.medicineId !== medicineId))
  }

  const handleSaveAsTemplate = async () => {
    if (items.length === 0) {
      toast.error("Thêm thuốc trước khi lưu mẫu")
      return
    }
    if (!templateName.trim()) {
      toast.error("Vui lòng nhập tên mẫu đơn")
      return
    }
    if (!doctorId) {
      toast.error("Không xác định được bác sĩ, vui lòng đăng nhập lại")
      return
    }
    try {
      await prescriptionTemplateService.create({
        doctorId,
        name: templateName,
        items: items.map((i) => ({
          medicineId: i.medicineId,
          medicineName: i.medicineName,
          quantity: i.quantity,
          dosage: i.dosage,
        })),
      })

      toast.success("Đã lưu mẫu đơn thuốc")
      setTemplateName("")
      qc.invalidateQueries({ queryKey: ["prescription-templates", doctorId] })
    } catch {
      toast.error("Không thể lưu mẫu")
    }
  }

  const handleLoadTemplate = (template: PrescriptionTemplate) => {
  const validItems: PrescriptionItem[] = []
  const removedNames: string[] = []

  for (const t of template.items) {
    const med = medicines.find((m) => m.id === t.medicineId)
    if (!med) {
      removedNames.push(t.medicineName || `#${t.medicineId}`)
      continue
    }
    validItems.push({
      medicineId: t.medicineId,
      medicineName: med.name,
      unit: med.unit,
      unitPrice: med.price,
      quantity: t.quantity,
      dosage: t.dosage,
    })
  }

  setItems(validItems)
  setShowTemplates(false)

  if (removedNames.length > 0) {
    toast.warning(
      `Đã tải mẫu "${template.name}", nhưng ${removedNames.length} thuốc không còn tồn tại và đã bị loại bỏ: ${removedNames.join(", ")}`
    )
  } else {
    toast.success(`Đã tải mẫu "${template.name}"`)
  }
}

  const handleDeleteTemplate = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    try {
      await prescriptionTemplateService.delete(id)
      qc.invalidateQueries({ queryKey: ["prescription-templates", doctorId] })
      toast.success("Đã xóa mẫu đơn thuốc")
    } catch {
      toast.error("Không thể xóa mẫu")
    }
  }

  const handleUpdateItem = (medicineId: number, field: "quantity" | "dosage", value: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.medicineId === medicineId
          ? { ...i, [field]: field === "quantity" ? Math.max(1, Number(value) || 1) : value }
          : i
      )
    )
  }

  const handleSavePrescription = async () => {
    if (items.length === 0) {
      toast.error("Vui lòng thêm ít nhất 1 thuốc")
      return
    }
    if (items.some((i) => !i.dosage.trim())) {
      toast.error("Vui lòng nhập liều dùng cho tất cả thuốc")
      return
    }

    setSaving(true)
    try {
      const result = await prescriptionService.create({
        medicalRecordId,
        notes,
        totalPrice: totalPrice,
      })

      for (const item of items) {
        await prescriptionService.addDetail({
          prescriptionId: result.id,
          medicineId: item.medicineId,
          quantity: item.quantity,
          dosage: item.dosage,
        })
      }

      toast.success("Đã lưu đơn thuốc")
      onFinish()
    } catch {
      toast.error("Không thể lưu đơn thuốc")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* Left: Medicine search + notes + templates */}
      <div className="space-y-4 lg:col-span-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-slate-700">Tìm thuốc</h3>
          </div>
          <p className="text-xs text-slate-400 mb-3">
            Tìm theo tên, lọc theo danh mục, xem tồn kho chi tiết
          </p>
          <Button
            type="button"
            className="w-full bg-medical-primary text-white hover:bg-medical-dark"
            onClick={() => setShowMedicineSearch(true)}
          >
            <Search className="mr-2 h-4 w-4" />
            Tìm và thêm thuốc
          </Button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <Label className="text-sm font-semibold text-slate-700">Ghi chú đơn thuốc</Label>
          <textarea
            rows={3}
            className="mt-2 w-full rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-medical-primary"
            placeholder="Lưu ý cho bệnh nhân..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Templates */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">Mẫu đơn thuốc</h3>
            <Button variant="ghost" size="sm" type="button" onClick={() => setShowTemplates(!showTemplates)}>
              <BookOpen className="mr-1 h-4 w-4" />
              {showTemplates ? "Ẩn" : "Xem mẫu"}
            </Button>
          </div>

          {showTemplates && (
            <div className="mt-3 space-y-2">
              {!doctorId ? (
                <p className="text-xs text-slate-400">Không xác định được bác sĩ.</p>
              ) : templatesLoading ? (
                <p className="text-xs text-slate-400">Đang tải mẫu đơn...</p>
              ) : templates.length === 0 ? (
                <p className="text-xs text-slate-400">Chưa có mẫu nào. Lưu đơn hiện tại làm mẫu bên dưới.</p>
              ) : (
                templates.map((t) => (
                  <div key={t.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                    <div>
                      <p className="text-sm font-medium text-slate-700">{t.name}</p>
                      <p className="text-xs text-slate-400">{t.items.length} thuốc</p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" type="button" onClick={() => handleLoadTemplate(t)} title="Tải mẫu">
                        <Plus className="h-4 w-4 text-medical-primary" />
                      </Button>
                      <Button variant="ghost" size="sm" type="button" onClick={(e) => handleDeleteTemplate(e, t.id)} title="Xóa mẫu">
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {items.length > 0 && (
            <div className="mt-3 flex gap-2">
              <Input
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Tên mẫu..."
                className="text-sm"
              />
              <Button variant="outline" size="sm" type="button" onClick={handleSaveAsTemplate} className="flex-shrink-0">
                <BookmarkPlus className="mr-1 h-4 w-4" /> Lưu mẫu
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Right: Prescription items */}
      <div className="space-y-4 lg:col-span-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">Đơn thuốc ({items.length} mục)</h3>

          {items.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">Nhấn "Tìm và thêm thuốc" để bắt đầu</p>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.medicineId} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-slate-800">{item.medicineName}</p>
                      <p className="text-xs text-slate-400">{item.unit} — {item.unitPrice.toLocaleString("vi-VN")}đ/đơn vị</p>
                    </div>
                    <Button variant="ghost" size="sm" type="button" onClick={() => handleRemoveItem(item.medicineId)}>
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </Button>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Số lượng</Label>
                      <Input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => handleUpdateItem(item.medicineId, "quantity", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Liều dùng</Label>
                      <Input
                        value={item.dosage}
                        onChange={(e) => handleUpdateItem(item.medicineId, "dosage", e.target.value)}
                        placeholder="VD: 2 viên/ngày sau ăn"
                      />
                    </div>
                  </div>
                  <p className="mt-2 text-right text-xs font-medium text-slate-600">
                    Thành tiền: {(item.unitPrice * item.quantity).toLocaleString("vi-VN")}đ
                  </p>
                </div>
              ))}
            </div>
          )}

          {items.length > 0 && (
            <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
              <span className="text-sm font-semibold text-slate-700">Tổng cộng</span>
              <span className="text-lg font-bold text-medical-primary">
                {totalPrice.toLocaleString("vi-VN")}đ
              </span>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
          </Button>
          <Button
            type="button"
            onClick={handleSavePrescription}
            disabled={saving || items.length === 0}
            className="bg-medical-primary text-white hover:bg-medical-dark"
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            {saving ? "Đang lưu..." : "Hoàn tất & Lưu đơn"}
          </Button>
        </div>
      </div>

      <MedicineSearchModal
        open={showMedicineSearch}
        onOpenChange={setShowMedicineSearch}
        onMedicineSelect={handleAddMedicine}
        excludeIds={items.map((i) => i.medicineId)}
      />
    </div>
  )
}