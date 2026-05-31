import { apiFetch } from "@/shared/lib/api-client"

export interface MedicalRecord {
  id: number
  appointmentId: number
  symptoms: string
  diagnosis: string
  recordType: string
  treatmentPlan: string
  createdAt: string
}

export interface MedicalRecordCreateRequest {
  appointmentId: number
  symptoms: string
  diagnosis: string
  recordType: string
  treatmentPlan: string
}

export const medicalRecordService = {
  async getAll(): Promise<MedicalRecord[]> {
    const res = await apiFetch("/api/patients/medical-records")
    if (!res.ok) throw new Error("Failed to fetch medical records")
    return res.json()
  },

  async getById(id: number): Promise<MedicalRecord> {
    const res = await apiFetch(`/api/patients/medical-records/${id}`)
    if (!res.ok) throw new Error("Medical record not found")
    return res.json()
  },

  async getByAppointmentId(appointmentId: number): Promise<MedicalRecord | null> {
    const res = await apiFetch(`/api/patients/medical-records?appointmentId=${appointmentId}`)
    if (!res.ok) throw new Error("Failed to fetch medical record")
    const data = await res.json()
    return data ?? null
  },

  async create(data: MedicalRecordCreateRequest): Promise<{ id: number }> {
    const res = await apiFetch("/api/patients/medical-records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error("Failed to create medical record")
    return res.json()
  },

  async update(id: number, data: { diagnosis: string; treatmentPlan: string }): Promise<{ status: string }> {
    const res = await apiFetch(`/api/patients/medical-records/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error("Failed to update medical record")
    return res.json()
  },
}
