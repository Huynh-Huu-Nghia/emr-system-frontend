import { apiFetch } from "@/shared/lib/api-client"

export interface UserRecord {
  id: number
  username: string
  role: "ADMIN" | "DOCTOR" | "RECEPTIONIST" | "PATIENT"
  status: "ACTIVE" | "INACTIVE" | "BLOCKED"
  createdAt: string
}

export interface UserCreateRequest {
  username: string
  password: string
  role: UserRecord["role"]
  status?: UserRecord["status"]
}

export interface UserUpdateRequest {
  role: UserRecord["role"]
  status: UserRecord["status"]
  password?: string
}

export const userService = {
  async getAll(): Promise<UserRecord[]> {
    const res = await apiFetch("/api/users")
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Failed to fetch users" }))
      throw new Error(err.error || "Failed to fetch users")
    }
    const raw = await res.json()
    return raw as UserRecord[]
  },

  async create(data: UserCreateRequest): Promise<UserRecord> {
    const res = await apiFetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: data.username,
        password: data.password,
        role: data.role,
        status: data.status ?? "ACTIVE",
      }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Failed to create user" }))
      throw new Error(err.error || "Failed to create user")
    }
    return res.json()
  },

  async update(id: number, data: UserUpdateRequest): Promise<UserRecord> {
    const res = await apiFetch(`/api/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role: data.role,
        status: data.status,
        password: data.password || "",
      }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Failed to update user" }))
      throw new Error(err.error || "Failed to update user")
    }
    return res.json()
  },

  async delete(id: number): Promise<boolean> {
    const res = await apiFetch(`/api/users/${id}`, { method: "DELETE" })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Failed to delete user" }))
      throw new Error(err.error || "Failed to delete user")
    }
    return true
  },
}
