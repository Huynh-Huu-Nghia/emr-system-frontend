import { apiFetch } from "@/shared/lib/api-client"

export type AppointmentStatus = "SCHEDULED" | "CANCELLED" | "COMPLETED"

export interface Appointment {
  id: number
  patient_id: number
  patient_name: string
  medical_history_number: string
  starts_at: string
  reason: string | null
  status: AppointmentStatus
  created_at: string
}

export interface AppointmentCreateRequest {
  patient_id: number
  patient_name: string
  medical_history_number: string
  starts_at: string
  reason?: string | null
}

export interface AppointmentListResponse {
  success: boolean
  data: Appointment[]
  total: number
}

function mapAppointment(raw: Record<string, unknown>): Appointment {
  return {
    id: raw.id as number,
    patient_id: (raw.patientId as number) || 0,
    patient_name: (raw.patientName as string) || "",
    medical_history_number: `BN${String(raw.patientId || 0).padStart(3, "0")}`,
    starts_at: (raw.appointmentStartDate as string) || "",
    reason: (raw.reason as string) || null,
    status: (raw.status as AppointmentStatus) || "SCHEDULED",
    created_at: (raw.createdAt as string) || "",
  }
}

export const appointmentService = {
  async list(): Promise<AppointmentListResponse> {
    const res = await apiFetch("/api/appointments")
    if (!res.ok) throw new Error("Failed to fetch appointments")
    const raw = await res.json()
    const data: Appointment[] = (raw as Record<string, unknown>[]).map(mapAppointment)
    const sorted = data.sort(
      (a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()
    )
    return { success: true, data: sorted, total: sorted.length }
  },

  async create(body: AppointmentCreateRequest): Promise<Appointment> {
    const res = await apiFetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        doctorId: 1,
        patientId: body.patient_id,
        appointmentStartDate: body.starts_at,
        appointmentEndDate: body.starts_at,
        reason: body.reason || "",
        status: "SCHEDULED",
      }),
    })
    if (!res.ok) throw new Error("Failed to create appointment")
    const result = await res.json()
    return {
      id: result.id,
      patient_id: body.patient_id,
      patient_name: body.patient_name,
      medical_history_number: body.medical_history_number,
      starts_at: body.starts_at,
      reason: body.reason ?? null,
      status: "SCHEDULED",
      created_at: new Date().toISOString(),
    }
  },

  async reschedule(id: number, starts_at: string, reason?: string | null): Promise<Appointment> {
    const res = await apiFetch(`/api/appointments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "SCHEDULED" }),
    })
    if (!res.ok) throw new Error("Failed to reschedule")
    return { id, patient_id: 0, patient_name: "", medical_history_number: "", starts_at, reason: reason ?? null, status: "SCHEDULED", created_at: "" }
  },

  async cancel(id: number): Promise<Appointment> {
    const res = await apiFetch(`/api/appointments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CANCELLED" }),
    })
    if (!res.ok) throw new Error("Failed to cancel appointment")
    return { id, patient_id: 0, patient_name: "", medical_history_number: "", starts_at: "", reason: null, status: "CANCELLED", created_at: "" }
  },
}
