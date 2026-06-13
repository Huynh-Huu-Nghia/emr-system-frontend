import { apiFetch } from "@/shared/lib/api-client"

export type AppointmentStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED"

export interface Appointment {
  id: number
  doctor_id: number
  patient_id: number
  patient_name: string
  doctor_name: string
  medical_history_number: string
  queue_id: number | null
  queue_position: number | null
  starts_at: string
  reason: string | null
  status: AppointmentStatus
  created_at: string
  appointmentCode: string
}

export interface AppointmentCreateRequest {
  doctor_id: number
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

function toTimestampString(iso: string): string {
  // Convert ISO 8601 (e.g. "2024-06-01T09:00:00.000Z" or local) to "yyyy-MM-dd HH:mm:ss"
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function mapAppointment(raw: Record<string, unknown>): Appointment {
  return {
    id: raw.id as number,
    doctor_id: (raw.doctorId as number) || 0,
    patient_id: (raw.patientId as number) || 0,
    patient_name: (raw.patientName as string) || "",
    doctor_name: (raw.doctorName as string) || "",
    medical_history_number: `BN${String(raw.patientId || 0).padStart(3, "0")}`,
    queue_id: (raw.queueId as number) ?? null,
    queue_position: (raw.queuePosition as number) ?? null,
    starts_at: (raw.appointmentStartDate as string) || "",
    reason: (raw.reason as string) || null,
    status: (raw.status as AppointmentStatus) || "PENDING",
    created_at: (raw.createdAt as string) || "",
    appointmentCode: `LH${String(raw.id).padStart(3, "0")}`,
  }
}

export const appointmentService = {
  async list(): Promise<AppointmentListResponse> {
    const res = await apiFetch("/api/appointments")
    if (!res.ok) throw new Error("Failed to fetch appointments")
    const rawData = (await res.json()) as Record<string, unknown>[]
    return { success: true, data: rawData.map(mapAppointment), total: rawData.length }
  },

  async create(body: AppointmentCreateRequest): Promise<Appointment> {
    const startTs = toTimestampString(body.starts_at)
    const res = await apiFetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        doctorId: body.doctor_id,
        patientId: body.patient_id,
        appointmentStartDate: startTs,
        appointmentEndDate: startTs,
        reason: body.reason || "",
        status: "PENDING",
      }),
    })
    if (!res.ok) throw new Error("Failed to create appointment")
    const result = await res.json()
    return {
      id: result.id,
      doctor_id: body.doctor_id,
      patient_id: body.patient_id,
      patient_name: body.patient_name,
      doctor_name: "",
      medical_history_number: body.medical_history_number,
      queue_id: null,
      queue_position: null,
      starts_at: body.starts_at,
      reason: body.reason ?? null,
      status: "PENDING",
      created_at: new Date().toISOString(),
      appointmentCode: `LH${String(result.id).padStart(3, "0")}`,
    }
  },

  async reschedule(id: number, starts_at: string, reason?: string | null): Promise<Appointment> {
    const startTs = toTimestampString(starts_at)
    const res = await apiFetch(`/api/appointments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        appointmentStartDate: startTs,
        appointmentEndDate: startTs,
        reason: reason ?? "",
        status: "PENDING",
      }),
    })
    if (!res.ok) throw new Error("Failed to reschedule")
    return { id, doctor_id: 0, patient_id: 0, patient_name: "", doctor_name: "", medical_history_number: "", queue_id: null, queue_position: null, starts_at, reason: reason ?? null, status: "PENDING", created_at: "", appointmentCode: `LH${String(id).padStart(3, "0")}` }
  },

  async cancel(id: number): Promise<Appointment> {
    const res = await apiFetch(`/api/appointments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CANCELLED" }),
    })
    if (!res.ok) throw new Error("Failed to cancel appointment")
    return { id, doctor_id: 0, patient_id: 0, patient_name: "", doctor_name: "", medical_history_number: "", queue_id: null, queue_position: null, starts_at: "", reason: null, status: "CANCELLED", created_at: "", appointmentCode: `LH${String(id).padStart(3, "0")}` }
  },
}
