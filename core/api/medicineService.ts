import { apiFetch } from "@/shared/lib/api-client"

// ── Category ──────────────────────────────────────────
export interface MedicineCategory {
  id: number
  name: string
  nameVi: string
  description: string | null
  displayOrder: number
  createdAt: string
}

export const medicineCategoryService = {
  async getAll(): Promise<MedicineCategory[]> {
    const res = await apiFetch("/api/medicine-categories")
    if (!res.ok) throw new Error("Failed to fetch medicine categories")
    return res.json()
  },
}

// ── Medicine ──────────────────────────────────────────
export interface Medicine {
  id: number
  name: string
  unit: string
  price: number
  stockQuantity: number
  expiryDate: string
  categoryId: number | null
  categoryName: string | null
  categoryNameVi: string | null
}

export interface MedicineCreateRequest {
  name: string
  unit: string
  price: number
  stockQuantity: number
  expiryDate: string
  categoryId?: number | null
}

export interface MedicineSearchParams {
  search?: string
  categoryId?: number | null
}

export type MedicineUpdateRequest = Partial<MedicineCreateRequest>

export const medicineService = {
  async getAll(params?: MedicineSearchParams): Promise<Medicine[]> {
    const qp = new URLSearchParams()
    if (params?.search) qp.set("search", params.search)
    if (params?.categoryId != null) qp.set("categoryId", String(params.categoryId))
    const qs = qp.toString()
    const res = await apiFetch(`/api/medicines${qs ? "?" + qs : ""}`)
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
  const diff = (new Date(med.expiryDate).getTime() - Date.now()) / 86_400_000
  return diff <= 90 && diff > 0
}
export function isExpired(med: Medicine): boolean {
  return new Date(med.expiryDate) < new Date()
}
