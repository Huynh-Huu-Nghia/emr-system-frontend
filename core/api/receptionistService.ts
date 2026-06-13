import { apiFetch } from "@/shared/lib/api-client"

export interface ReceptionistRecord {
  id: number
  userId: number
  username: string
  fullName: string
  department: string
  phone: string
  email: string
  createdAt: string
}

export interface ReceptionistCreateRequest {
  username?: string
  password?: string
  fullName: string
  department: string
  phone: string
  email: string
}

export interface ReceptionistUpdateRequest {
  username?: string
  password?: string
  fullName?: string
  department?: string
  phone?: string
  email?: string
}

export const receptionistService = {
  async getAll(): Promise<ReceptionistRecord[]> {
    const res = await apiFetch("/api/receptionists")
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Failed to fetch receptionists" }))
      throw new Error(err.error || "Failed to fetch receptionists")
    }
    return res.json()
  },

  async getById(id: number): Promise<ReceptionistRecord> {
    const res = await apiFetch(`/api/receptionists/${id}`)
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Receptionist not found" }))
      throw new Error(err.error || "Receptionist not found")
    }
    return res.json()
  },

  async create(data: ReceptionistCreateRequest): Promise<{ id: number }> {
    const res = await apiFetch("/api/receptionists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Failed to create receptionist" }))
      throw new Error(err.error || "Failed to create receptionist")
    }
    return res.json()
  },

  async update(id: number, data: ReceptionistUpdateRequest): Promise<{ status: string }> {
    const res = await apiFetch(`/api/receptionists/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Failed to update receptionist" }))
      throw new Error(err.error || "Failed to update receptionist")
    }
    return res.json()
  },

  async delete(id: number): Promise<boolean> {
    const res = await apiFetch(`/api/receptionists/${id}`, { method: "DELETE" })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Failed to delete receptionist" }))
      throw new Error(err.error || "Failed to delete receptionist")
    }
    return true
  },
}
