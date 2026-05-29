/**
 * Appointment API (mock). Replace method bodies with `fetch` / axios when BE is ready.
 * Shape follows typical REST + PostgreSQL snake_case.
 */

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

function iso(d: Date) {
  return d.toISOString()
}

/** Seed relative to "today" so demo always feels current */
function seedAppointments(): Appointment[] {
  const now = new Date()
  const at = (dayOffset: number, h: number, m: number) => {
    const x = new Date(now)
    x.setDate(x.getDate() + dayOffset)
    x.setHours(h, m, 0, 0)
    return iso(x)
  }
  return [
    {
      id: 1,
      patient_id: 1,
      patient_name: "Nguyễn Thị Mai",
      medical_history_number: "BN001",
      starts_at: at(0, 9, 0),
      reason: "Tái khám huyết áp",
      status: "SCHEDULED",
      created_at: iso(new Date(now.getTime() - 86400000)),
    },
    {
      id: 2,
      patient_id: 2,
      patient_name: "Trần Văn Đức",
      medical_history_number: "BN002",
      starts_at: at(0, 14, 30),
      reason: null,
      status: "SCHEDULED",
      created_at: iso(new Date(now.getTime() - 86400000)),
    },
    {
      id: 3,
      patient_id: 3,
      patient_name: "Lê Hoàng Yến",
      medical_history_number: "BN003",
      starts_at: at(1, 10, 0),
      reason: "Khám mới",
      status: "SCHEDULED",
      created_at: iso(new Date(now.getTime() - 172800000)),
    },
    {
      id: 4,
      patient_id: 1,
      patient_name: "Nguyễn Thị Mai",
      medical_history_number: "BN001",
      starts_at: at(2, 8, 15),
      reason: "Đã đổi lịch trước đó",
      status: "CANCELLED",
      created_at: iso(new Date(now.getTime() - 259200000)),
    },
  ]
}

let MOCK_APPOINTMENTS: Appointment[] = seedAppointments()

const delay = (ms = 320) => new Promise((r) => setTimeout(r, ms))

const nextId = () =>
  MOCK_APPOINTMENTS.length === 0
    ? 1
    : Math.max(...MOCK_APPOINTMENTS.map((a) => a.id)) + 1

export const appointmentService = {
  async list(): Promise<AppointmentListResponse> {
    await delay()
    const sorted = [...MOCK_APPOINTMENTS].sort(
      (a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()
    )
    return { success: true, data: sorted, total: sorted.length }
  },

  async create(body: AppointmentCreateRequest): Promise<Appointment> {
    await delay()
    const row: Appointment = {
      id: nextId(),
      patient_id: body.patient_id,
      patient_name: body.patient_name,
      medical_history_number: body.medical_history_number,
      starts_at: body.starts_at,
      reason: body.reason ?? null,
      status: "SCHEDULED",
      created_at: new Date().toISOString(),
    }
    MOCK_APPOINTMENTS = [...MOCK_APPOINTMENTS, row]
    return row
  },

  async reschedule(id: number, starts_at: string, reason?: string | null): Promise<Appointment> {
    await delay()
    const idx = MOCK_APPOINTMENTS.findIndex((a) => a.id === id)
    if (idx === -1) throw new Error("Không tìm thấy lịch hẹn")
    const prev = MOCK_APPOINTMENTS[idx]
    if (prev.status === "CANCELLED") throw new Error("Không thể đổi lịch đã huỷ")
    const merged: Appointment = {
      ...prev,
      starts_at,
      reason: reason ?? prev.reason,
    }
    MOCK_APPOINTMENTS = [
      ...MOCK_APPOINTMENTS.slice(0, idx),
      merged,
      ...MOCK_APPOINTMENTS.slice(idx + 1),
    ]
    return merged
  },

  async cancel(id: number): Promise<Appointment> {
    await delay()
    const idx = MOCK_APPOINTMENTS.findIndex((a) => a.id === id)
    if (idx === -1) throw new Error("Không tìm thấy lịch hẹn")
    const prev = MOCK_APPOINTMENTS[idx]
    const merged: Appointment = { ...prev, status: "CANCELLED" }
    MOCK_APPOINTMENTS = [
      ...MOCK_APPOINTMENTS.slice(0, idx),
      merged,
      ...MOCK_APPOINTMENTS.slice(idx + 1),
    ]
    return merged
  },
}
