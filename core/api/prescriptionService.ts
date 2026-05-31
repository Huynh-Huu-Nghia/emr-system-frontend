import { apiFetch } from "@/shared/lib/api-client"

export interface Prescription {
  id: number
  medicalRecordId: number
  notes: string
  totalPrice: number
  createdAt: string
  details?: PrescriptionDetail[]
}

export interface PrescriptionDetail {
  id: number
  prescriptionId: number
  medicineId: number
  quantity: number
  dosage: string
}

export interface PrescriptionCreateRequest {
  medicalRecordId: number
  notes: string
  totalPrice: string
}

export interface PrescriptionDetailCreateRequest {
  prescriptionId: number
  medicineId: number
  quantity: number
  dosage: string
}

export const prescriptionService = {
  async getAll(): Promise<Prescription[]> {
    const res = await apiFetch("/api/prescriptions")
    if (!res.ok) throw new Error("Failed to fetch prescriptions")
    return res.json()
  },

  async getById(id: number): Promise<Prescription> {
    const res = await apiFetch(`/api/prescriptions/${id}`)
    if (!res.ok) throw new Error("Prescription not found")
    return res.json()
  },

  async getByMedicalRecordId(medicalRecordId: number): Promise<Prescription | null> {
    const res = await apiFetch(`/api/prescriptions?medicalRecordId=${medicalRecordId}`)
    if (!res.ok) throw new Error("Failed to fetch prescription")
    const data = await res.json()
    return data ?? null
  },

  async create(data: PrescriptionCreateRequest): Promise<{ id: number }> {
    const res = await apiFetch("/api/prescriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error("Failed to create prescription")
    return res.json()
  },

  async addDetail(data: PrescriptionDetailCreateRequest): Promise<{ id: number }> {
    const res = await apiFetch("/api/prescriptions/details", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error("Failed to add prescription detail")
    return res.json()
  },
}
