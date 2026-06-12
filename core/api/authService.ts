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
const AUTH_TOKEN_KEY = "auth_token"

function normalizeDashboardRole(role: unknown): User["role"] | null {
  if (typeof role !== "string") return null

  const normalized = role.trim().toUpperCase()
  if (normalized === "ADMIN") return "ADMIN"
  if (normalized === "DOCTOR") return "DOCTOR"
  if (normalized === "RECEPTIONIST" || normalized === "RECEPTION") return "RECEPTIONIST"

  return null
}

function isDashboardRole(role: unknown): role is User["role"] {
  return normalizeDashboardRole(role) !== null
}

function isUser(value: unknown): value is User {
  return (
    typeof value === "object" &&
    value !== null &&
    "role" in value &&
    isDashboardRole((value as { role: unknown }).role)
  )
}

function clearStoredAuth() {
  if (typeof window === "undefined") return
  localStorage.removeItem(AUTH_TOKEN_KEY)
  localStorage.removeItem(AUTH_USER_KEY)
}

const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const res = await apiFetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    })
    const data = await res.json()
    if (data.success && data.user) {
      const role = normalizeDashboardRole(data.user.role)
      if (!role) {
        return {
          success: false,
          message: `Vai trò ${data.user.role ?? "không xác định"} chưa được phép truy cập hệ thống`,
        }
      }

      return {
        ...data,
        user: {
          ...data.user,
          role,
        },
      }
    }

    return data
  },

  async logout(): Promise<LogoutResponse> {
    return { success: true, message: "Đăng xuất thành công" }
  },

  async getCurrentUser(): Promise<User | null> {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem(AUTH_TOKEN_KEY)
        : null
    if (!token) return null
    const raw =
      typeof window !== "undefined"
        ? localStorage.getItem(AUTH_USER_KEY)
        : null
    if (raw) {
      try {
        const user = JSON.parse(raw) as unknown
        if (isUser(user)) {
          return {
            ...user,
            role: normalizeDashboardRole(user.role) ?? user.role,
          }
        }
        clearStoredAuth()
        return null
      } catch {
        clearStoredAuth()
        return null
      }
    }
    clearStoredAuth()
    return null
  },
}

export { authService, AUTH_USER_KEY, AUTH_TOKEN_KEY, clearStoredAuth, isDashboardRole }
