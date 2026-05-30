import { apiFetch } from "@/shared/lib/api-client"

export interface UserRecord {
  id: number
  username: string
  role: "ADMIN" | "DOCTOR" | "RECEPTIONIST" | "PATIENT"
  status: "ACTIVE" | "LOCKED"
  createdAt: string
}

export interface UserCreateRequest {
  username: string
  passwordHash: string
  role: UserRecord["role"]
  status?: UserRecord["status"]
}

export interface UserUpdateRequest {
  role: UserRecord["role"]
  status: UserRecord["status"]
}

export const userService = {
  async getAll(): Promise<UserRecord[]> {
    const res = await apiFetch("/api/users")
    if (!res.ok) throw new Error("Failed to fetch users")
    return res.json()
  },

  async create(data: UserCreateRequest): Promise<{ id: number }> {
    const res = await apiFetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: data.username,
        passwordHash: data.passwordHash,
        role: data.role,
        status: data.status ?? "ACTIVE",
      }),
    })
    if (!res.ok) throw new Error("Failed to create user")
    return res.json()
  },

  async update(id: number, data: UserUpdateRequest): Promise<{ status: string }> {
    const res = await apiFetch(`/api/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: data.role, status: data.status }),
    })
    if (!res.ok) throw new Error("Failed to update user")
    return res.json()
  },

  async delete(id: number): Promise<boolean> {
    const res = await apiFetch(`/api/users/${id}`, { method: "DELETE" })
    if (!res.ok) throw new Error("Failed to delete user")
    return true
  },
}
