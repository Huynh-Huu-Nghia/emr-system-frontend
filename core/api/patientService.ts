import { apiFetch } from "@/shared/lib/api-client"

export interface Patient {
  id: number
  user_id?: number | null
  full_name: string
  dob: string
  gender: "MALE" | "FEMALE" | "OTHER"
  phone: string
  address?: string
  insurance_code?: string
  medicalHistoryNumber: string
  created_at: string
}

export interface PatientCreateRequest {
  full_name: string
  dob: string
  gender: "MALE" | "FEMALE" | "OTHER"
  phone: string
  address?: string
  insurance_code?: string
  user_id?: number | null
  username?: string
  password?: string
}

export interface PatientListResponse {
  success: boolean
  data: Patient[]
  total: number
}

function mapPatient(raw: Record<string, unknown>): Patient {
  return {
    id: raw.id as number,
    user_id: (raw.userId as number) ?? null,
    full_name: (raw.fullName as string) || "",
    dob: (raw.dob as string) || "",
    gender: (raw.gender as Patient["gender"]) || "OTHER",
    phone: (raw.phone as string) || "",
    address: (raw.address as string) || "",
    insurance_code: (raw.insuranceCode as string) || "",
    medicalHistoryNumber: `BN${String(raw.id).padStart(3, "0")}`,
    created_at: (raw.createdAt as string) || "",
  }
}

export const patientService = {
  async getAllPatients(): Promise<PatientListResponse> {
    const res = await apiFetch("/api/patients")
    if (!res.ok) throw new Error("Failed to fetch patients")
    const raw = await res.json()
    const data: Patient[] = (raw as Record<string, unknown>[])
      .map(mapPatient)
      .sort((a, b) => {
        const createdDiff =
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        if (!Number.isNaN(createdDiff) && createdDiff !== 0) return createdDiff
        return b.id - a.id
      })
    return { success: true, data, total: data.length }
  },

  async getPatientById(id: number): Promise<Patient> {
    const res = await apiFetch(`/api/patients/${id}`)
    if (!res.ok) throw new Error("Patient not found")
    const raw = await res.json()
    return mapPatient(raw)
  },

  async createPatient(data: PatientCreateRequest): Promise<Patient> {
    const res = await apiFetch("/api/patients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: data.full_name,
        dob: data.dob,
        gender: data.gender,
        phone: data.phone,
        address: data.address || "",
        insuranceCode: data.insurance_code || "",
        username: data.username || "",
        password: data.password || "",
      }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Failed to create patient" }))
      throw new Error(err.error || "Failed to create patient")
    }
    const result = await res.json()
    return mapPatient(result)
  },

  async updatePatient(id: number, data: Partial<PatientCreateRequest>): Promise<Patient> {
    const res = await apiFetch(`/api/patients/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: data.full_name,
        phone: data.phone,
        address: data.address,
      }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Failed to update patient" }))
      throw new Error(err.error || "Failed to update patient")
    }
    return {
      id,
      user_id: null,
      full_name: data.full_name || "",
      dob: data.dob || "",
      gender: data.gender || "OTHER",
      phone: data.phone || "",
      address: data.address,
      insurance_code: data.insurance_code,
      medicalHistoryNumber: `BN${String(id).padStart(3, "0")}`,
      created_at: "",
    }
  },

  async deletePatient(id: number): Promise<boolean> {
    const res = await apiFetch(`/api/patients/${id}`, { method: "DELETE" })
    if (!res.ok) throw new Error("Failed to delete patient")
    return true
  },
}
