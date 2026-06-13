import { apiFetch } from "@/shared/lib/api-client"

export interface Prescription {
  id: number
  medicalRecordId: number
  notes: string
  totalPrice: number
  createdAt: string
  details?: PrescriptionDetail[]
  prescriptionCode: string
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
  totalPrice: number
}

export interface PrescriptionDetailCreateRequest {
  prescriptionId: number
  medicineId: number
  quantity: number
  dosage: string
}

function mapPrescription(raw: Record<string, unknown>): Prescription {
  return {
    id: raw.id as number,
    medicalRecordId: raw.medicalRecordId as number,
    notes: raw.notes as string,
    totalPrice: raw.totalPrice as number,
    createdAt: raw.createdAt as string,
    details: raw.details as PrescriptionDetail[],
    prescriptionCode: `DT${String(raw.id).padStart(3, "0")}`,
  }
}

export const prescriptionService = {
  async getAll(): Promise<Prescription[]> {
    const res = await apiFetch("/api/prescriptions")
    if (!res.ok) throw new Error("Failed to fetch prescriptions")
    const rawData = await res.json()
    return (rawData as Record<string, unknown>[])
      .map(mapPrescription)
      .sort((a, b) => {
        const createdDiff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        if (!Number.isNaN(createdDiff) && createdDiff !== 0) return createdDiff
        return b.id - a.id
      })
  },

  async getById(id: number): Promise<Prescription> {
    const res = await apiFetch(`/api/prescriptions/${id}`)
    if (!res.ok) throw new Error("Prescription not found")
    const rawData = await res.json()
    return mapPrescription(rawData)
  },

  async getByMedicalRecordId(medicalRecordId: number): Promise<Prescription | null> {
    const res = await apiFetch(`/api/prescriptions?medicalRecordId=${medicalRecordId}`)
    if (!res.ok) throw new Error("Failed to fetch prescription")
    const data = await res.json()
    if (!data) return null
    if (Array.isArray(data)) {
      if (data.length === 0) return null
      return mapPrescription(data[0])
    }
    return mapPrescription(data)
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
