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
  medicineCode: string
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

function mapMedicine(raw: Record<string, unknown>): Medicine {
  return {
    id: raw.id as number,
    name: raw.name as string,
    unit: raw.unit as string,
    price: raw.price as number,
    stockQuantity: raw.stockQuantity as number,
    expiryDate: raw.expiryDate as string,
    categoryId: (raw.categoryId as number) ?? null,
    categoryName: (raw.categoryName as string) ?? null,
    categoryNameVi: (raw.categoryNameVi as string) ?? null,
    medicineCode: `TH${String(raw.id).padStart(3, "0")}`,
  }
}

export const medicineService = {
  async getAll(params?: MedicineSearchParams): Promise<Medicine[]> {
    const qp = new URLSearchParams()
    if (params?.search) qp.set("search", params.search)
    if (params?.categoryId != null) qp.set("categoryId", String(params.categoryId))
    const qs = qp.toString()
    const res = await apiFetch(`/api/medicines${qs ? "?" + qs : ""}`)
    if (!res.ok) throw new Error("Failed to fetch medicines")
    const rawData = await res.json()
    return (rawData as Record<string, unknown>[]).map(mapMedicine)
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
