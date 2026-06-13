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
  receptionistCode: string
  status: string
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
  status?: string
}

function mapReceptionist(raw: Record<string, unknown>): ReceptionistRecord {
  return {
    id: raw.id as number,
    userId: raw.userId as number,
    username: raw.username as string,
    fullName: raw.fullName as string,
    department: raw.department as string,
    phone: raw.phone as string,
    email: raw.email as string,
    createdAt: raw.createdAt as string,
    receptionistCode: `LT${String(raw.id).padStart(3, "0")}`,
    status: (raw.status as string) || "ACTIVE",
  }
}

export const receptionistService = {
  async getAll(): Promise<ReceptionistRecord[]> {
    const res = await apiFetch("/api/receptionists")
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Failed to fetch receptionists" }))
      throw new Error(err.error || "Failed to fetch receptionists")
    }
    const rawData = await res.json()
    return (rawData as Record<string, unknown>[]).map(mapReceptionist)
  },

  async getById(id: number): Promise<ReceptionistRecord> {
    const res = await apiFetch(`/api/receptionists/${id}`)
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Receptionist not found" }))
      throw new Error(err.error || "Receptionist not found")
    }
    const rawData = await res.json()
    return mapReceptionist(rawData)
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
