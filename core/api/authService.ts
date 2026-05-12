/**
 * Authentication Service
 * Handles all auth-related API calls and data transformations.
 * Currently mocked for testing; integrate with real API endpoint later.
 */

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

const MOCK_USER: User = {
  id: "user_001",
  username: "admin",
  fullName: "Nguyễn Văn Admin",
  email: "admin@emr.local",
  role: "ADMIN",
  createdAt: new Date().toISOString(),
}

/**
 * Dev-only: infer role from username prefix so team can test RBAC without real BE.
 * - username starting with `doctor` / `bacsi` → DOCTOR
 * - username starting with `reception` / `letan` → RECEPTIONIST
 * - otherwise → ADMIN
 */
export function resolveMockRoleFromUsername(username: string): User["role"] {
  const key = username.trim().toLowerCase()
  if (key.startsWith("doctor") || key.startsWith("bacsi")) return "DOCTOR"
  if (key.startsWith("reception") || key.startsWith("letan")) return "RECEPTIONIST"
  return "ADMIN"
}

function buildMockUser(credentials: LoginRequest): User {
  const role = resolveMockRoleFromUsername(credentials.username)
  const fullNames: Record<User["role"], string> = {
    ADMIN: "Nguyễn Văn Admin",
    DOCTOR: "BS. Trần Khám Bệnh",
    RECEPTIONIST: "Lê Thị Tiếp Đón",
  }
  return {
    ...MOCK_USER,
    username: credentials.username.trim(),
    fullName: fullNames[role],
    role,
    createdAt: new Date().toISOString(),
  }
}

const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (credentials.username && credentials.password) {
          resolve({
            success: true,
            message: "Đăng nhập thành công",
            user: buildMockUser(credentials),
            token: `mock_token_${Date.now()}`,
          })
        } else {
          resolve({
            success: false,
            message: "Tên tài khoản hoặc mật khẩu không hợp lệ",
          })
        }
      }, 1000)
    })
  },

  async logout(): Promise<LogoutResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: "Đăng xuất thành công",
        })
      }, 500)
    })
  },

  async getCurrentUser(): Promise<User | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("auth_token")
            : null
        if (!token) {
          resolve(null)
          return
        }
        const raw =
          typeof window !== "undefined"
            ? localStorage.getItem(AUTH_USER_KEY)
            : null
        if (raw) {
          try {
            resolve(JSON.parse(raw) as User)
            return
          } catch {
            /* fall through */
          }
        }
        resolve({ ...MOCK_USER })
      }, 300)
    })
  },
}

export { authService, AUTH_USER_KEY }
