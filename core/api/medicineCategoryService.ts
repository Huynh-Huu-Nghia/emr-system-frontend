import { apiFetch } from "@/shared/lib/api-client"

export interface MedicineCategory {
  id: number
  name: string
  nameVi: string
  description?: string
  displayOrder: number
  createdAt: string
}

export interface MedicineCategoryCreateRequest {
  name: string
  nameVi: string
  description?: string
  displayOrder: number
}

export interface MedicineCategoryUpdateRequest {
  name: string
  nameVi: string
  description?: string
  displayOrder: number
}

export const medicineCategoryService = {
  async getAll(): Promise<MedicineCategory[]> {
    const res = await apiFetch("/api/medicine-categories")
    if (!res.ok) throw new Error("Failed to fetch medicine categories")
    return res.json()
  },

  async create(data: MedicineCategoryCreateRequest): Promise<{ id: number; status: string }> {
    const res = await apiFetch("/api/medicine-categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error("Failed to create medicine category")
    return res.json()
  },

  async update(id: number, data: MedicineCategoryUpdateRequest): Promise<{ status: string }> {
    const res = await apiFetch(`/api/medicine-categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error("Failed to update medicine category")
    return res.json()
  },

  async delete(id: number): Promise<{ status: string }> {
    const res = await apiFetch(`/api/medicine-categories/${id}`, {
      method: "DELETE",
    })
    if (!res.ok) throw new Error("Failed to delete medicine category")
    return res.json()
  },
}
