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
    if (!res.ok) throw new Error("Failed to fetch doctors")
    return res.json()
  },

  async getById(id: number): Promise<DoctorRecord> {
    const res = await apiFetch(`/api/doctors/${id}`)
    if (!res.ok) throw new Error("Doctor not found")
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
    if (!res.ok) throw new Error("Failed to create doctor")
    return res.json()
  },

  async update(id: number, data: DoctorUpdateRequest): Promise<{ status: string }> {
    const res = await apiFetch(`/api/doctors/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error("Failed to update doctor")
    return res.json()
  },

  async delete(id: number): Promise<boolean> {
    const res = await apiFetch(`/api/doctors/${id}`, { method: "DELETE" })
    if (!res.ok) throw new Error("Failed to delete doctor")
    return true
  },
}
