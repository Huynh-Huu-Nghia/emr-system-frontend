import { apiFetch } from "@/shared/lib/api-client"

export interface DoctorRecord {
  id: number
  userId: number
  username: string
  fullName: string
  specialty: string
  phone: string
  email: string
  roomNumber: string
  createdAt: string
  doctorCode: string
  status: string
}

export interface DoctorCreateRequest {
  username: string
  password: string
  fullName: string
  specialty: string
  phone: string
  email: string
  roomNumber: string
}

export interface DoctorUpdateRequest {
  username?: string
  password?: string
  fullName?: string
  specialty?: string
  phone?: string
  email?: string
  roomNumber?: string
  status?: string
}

function mapDoctor(raw: Record<string, unknown>): DoctorRecord {
  return {
    id: raw.id as number,
    userId: raw.userId as number,
    username: raw.username as string,
    fullName: raw.fullName as string,
    specialty: raw.specialty as string,
    phone: raw.phone as string,
    email: raw.email as string,
    roomNumber: raw.roomNumber as string,
    createdAt: raw.createdAt as string,
    doctorCode: `BS${String(raw.id).padStart(3, "0")}`,
    status: (raw.status as string) || "ACTIVE",
  }
}

export const doctorService = {
  async getAll(): Promise<DoctorRecord[]> {
    const res = await apiFetch("/api/doctors")
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Failed to fetch doctors" }))
      throw new Error(err.error || "Failed to fetch doctors")
    }
    const rawData = await res.json()
    return (rawData as Record<string, unknown>[]).map(mapDoctor)
  },

  async getById(id: number): Promise<DoctorRecord> {
    const res = await apiFetch(`/api/doctors/${id}`)
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Doctor not found" }))
      throw new Error(err.error || "Doctor not found")
    }
    const rawData = await res.json()
    return mapDoctor(rawData)
  },

  async create(data: DoctorCreateRequest): Promise<{ id: number }> {
    const res = await apiFetch("/api/doctors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: data.username,
        password: data.password,
        fullName: data.fullName,
        specialty: data.specialty,
        phone: data.phone,
        email: data.email,
        roomNumber: data.roomNumber,
      }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Failed to create doctor" }))
      throw new Error(err.error || "Failed to create doctor")
    }
    return res.json()
  },

  async update(id: number, data: DoctorUpdateRequest): Promise<{ status: string }> {
    const res = await apiFetch(`/api/doctors/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Failed to update doctor" }))
      throw new Error(err.error || "Failed to update doctor")
    }
    return res.json()
  },

  async delete(id: number): Promise<boolean> {
    const res = await apiFetch(`/api/doctors/${id}`, { method: "DELETE" })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Failed to delete doctor" }))
      throw new Error(err.error || "Failed to delete doctor")
    }
    return true
  },
}
