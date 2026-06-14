import { apiFetch } from "@/shared/lib/api-client"

export interface MedicalRecord {
  id: number
  appointmentId: number
  symptoms: string
  diagnosis: string
  recordType: string
  treatmentPlan: string
  createdAt: string
  recordCode: string
  patientName?: string
}

export interface MedicalRecordCreateRequest {
  appointmentId: number | null
  symptoms: string
  diagnosis: string
  recordType: string
  treatmentPlan: string
}

function mapMedicalRecord(raw: Record<string, unknown>): MedicalRecord {
  return {
    id: raw.id as number,
    appointmentId: raw.appointmentId as number,
    symptoms: raw.symptoms as string,
    diagnosis: raw.diagnosis as string,
    recordType: raw.recordType as string,
    treatmentPlan: raw.treatmentPlan as string,
    createdAt: raw.createdAt as string,
    recordCode: `BA${String(raw.id).padStart(3, "0")}`,
    patientName: raw.patientName as string | undefined,
  }
}

export const medicalRecordService = {
  async getAll(): Promise<MedicalRecord[]> {
    const res = await apiFetch("/api/patients/medical-records")
    if (!res.ok) throw new Error("Failed to fetch medical records")
    const rawData = await res.json()
    return (rawData as Record<string, unknown>[]).map(mapMedicalRecord)
  },

  async getById(id: number): Promise<MedicalRecord> {
    const res = await apiFetch(`/api/patients/medical-records/${id}`)
    if (!res.ok) throw new Error("Medical record not found")
    const rawData = await res.json()
    return mapMedicalRecord(rawData)
  },

  async getByAppointmentId(appointmentId: number): Promise<MedicalRecord | null> {
    const res = await apiFetch(`/api/patients/medical-records?appointmentId=${appointmentId}`)
    if (!res.ok) {
      if (res.status === 404) return null
      throw new Error("Failed to fetch medical record")
    }
    const data = await res.json()
    if (!data) return null
    if (Array.isArray(data)) {
      if (data.length === 0) return null
      return mapMedicalRecord(data[0])
    }
    return mapMedicalRecord(data)
  },

  async getByPatientId(patientId: number): Promise<MedicalRecord[]> {
    const res = await apiFetch(`/api/patients/medical-records?patientId=${patientId}`)
    if (!res.ok) {
      if (res.status === 404) return []
      throw new Error("Failed to fetch medical records for patient")
    }
    const data = await res.json()
    if (!Array.isArray(data)) return []
    return data.map(mapMedicalRecord)
  },

  async create(data: MedicalRecordCreateRequest): Promise<{ id: number }> {
    const res = await apiFetch("/api/patients/medical-records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const errorText = await res.text().catch(() => "")
      console.error("Backend error text:", errorText)
      throw new Error("Failed to create medical record: " + errorText)
    }
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
