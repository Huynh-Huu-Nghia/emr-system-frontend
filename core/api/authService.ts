import { apiFetch } from "@/shared/lib/api-client"

export interface LoginRequest {
  username: string
  password: string
}

export interface User {
  id: string
  username: string
  fullName: string
  email: string
  role: "ADMIN" | "DOCTOR" | "RECEPTIONIST"
  createdAt: string
}

export interface LoginResponse {
  success: boolean
  message: string
  user?: User
  token?: string
}

export interface LogoutResponse {
  success: boolean
  message: string
}

const AUTH_USER_KEY = "auth_user"

const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const res = await apiFetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    })
    const data = await res.json()
    return data
  },

  async logout(): Promise<LogoutResponse> {
    return { success: true, message: "Đăng xuất thành công" }
  },

  async getCurrentUser(): Promise<User | null> {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("auth_token")
        : null
    if (!token) return null
    const raw =
      typeof window !== "undefined"
        ? localStorage.getItem(AUTH_USER_KEY)
        : null
    if (raw) {
      try {
        return JSON.parse(raw) as User
      } catch {
        /* fall through */
      }
    }
    return null
  },
}

export { authService, AUTH_USER_KEY }
