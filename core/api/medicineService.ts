import { apiFetch } from "@/shared/lib/api-client"

export interface Medicine {
  id: number
  name: string
  unit: string
  price: number
  stockQuantity: number
  expiryDate: string
}

export interface MedicineCreateRequest {
  name: string
  unit: string
  price: number
  stockQuantity: number
  expiryDate: string
}

export type MedicineUpdateRequest = Partial<MedicineCreateRequest>

export const medicineService = {
  async getAll(): Promise<Medicine[]> {
    const res = await apiFetch("/api/medicines")
    if (!res.ok) throw new Error("Failed to fetch medicines")
    return res.json()
  },

  async create(data: MedicineCreateRequest): Promise<{ id: number }> {
    const res = await apiFetch("/api/medicines", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error("Failed to create medicine")
    return res.json()
  },

  async update(id: number, data: MedicineUpdateRequest): Promise<{ status: string }> {
    const res = await apiFetch(`/api/medicines/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error("Failed to update medicine")
    return res.json()
  },

  async delete(id: number): Promise<boolean> {
    const res = await apiFetch(`/api/medicines/${id}`, { method: "DELETE" })
    if (!res.ok) throw new Error("Failed to delete medicine")
    return true
  },
}

export function isLowStock(med: Medicine): boolean {
  return med.stockQuantity <= 10
}

export function isExpiringSoon(med: Medicine): boolean {
  const now = new Date()
  const expiry = new Date(med.expiryDate)
  const diffDays = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  return diffDays <= 90 && diffDays > 0
}

export function isExpired(med: Medicine): boolean {
  return new Date(med.expiryDate) < new Date()
}
