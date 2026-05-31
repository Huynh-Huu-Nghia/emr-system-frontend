import { apiFetch } from "@/shared/lib/api-client"

export interface PrescriptionTemplate {
  id: number
  doctorId: number
  name: string
  items: PrescriptionTemplateItem[]
  createdAt: string
}

export interface PrescriptionTemplateItem {
  medicineId: number
  medicineName: string
  quantity: number
  dosage: string
}

export const prescriptionTemplateService = {
  async getAll(): Promise<PrescriptionTemplate[]> {
    const res = await apiFetch("/api/prescription-templates")
    if (!res.ok) throw new Error("Failed to fetch templates")
    return res.json()
  },

  async getByDoctor(doctorId: number): Promise<PrescriptionTemplate[]> {
    const res = await apiFetch(`/api/prescription-templates?doctorId=${doctorId}`)
    if (!res.ok) throw new Error("Failed to fetch templates")
    return res.json()
  },

  async create(data: { doctorId: number; name: string; items: PrescriptionTemplateItem[] }): Promise<{ id: number }> {
    const res = await apiFetch("/api/prescription-templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error("Failed to create template")
    return res.json()
  },

  async delete(id: number): Promise<boolean> {
    const res = await apiFetch(`/api/prescription-templates/${id}`, { method: "DELETE" })
    if (!res.ok) throw new Error("Failed to delete template")
    return true
  },
}
