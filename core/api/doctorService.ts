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
}

export const doctorService = {
  async getAll(): Promise<DoctorRecord[]> {
    const res = await apiFetch("/api/doctors")
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Failed to fetch doctors" }))
      throw new Error(err.error || "Failed to fetch doctors")
    }
    return res.json()
  },

  async getById(id: number): Promise<DoctorRecord> {
    const res = await apiFetch(`/api/doctors/${id}`)
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Doctor not found" }))
      throw new Error(err.error || "Doctor not found")
    }
    return res.json()
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
