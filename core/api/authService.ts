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

/**
 * Mock user data for testing
 */
const MOCK_USER: User = {
  id: "user_001",
  username: "admin",
  fullName: "Nguyễn Văn Admin",
  email: "admin@emr.local",
  role: "ADMIN",
  createdAt: new Date().toISOString(),
}

/**
 * Auth Service object with async methods
 * No axios or fetch calls here until API is ready
 */
const authService = {
  /**
   * Login user with credentials
   * @param credentials - LoginRequest with username and password
   * @returns Promise<LoginResponse>
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return new Promise((resolve) => {
      // Simulate API delay
      setTimeout(() => {
        // Mock validation: accept any non-empty credentials
        if (credentials.username && credentials.password) {
          resolve({
            success: true,
            message: "Đăng nhập thành công",
            user: MOCK_USER,
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

  /**
   * Logout current user
   * @returns Promise<LogoutResponse>
   */
  async logout(): Promise<LogoutResponse> {
    return new Promise((resolve) => {
      // Simulate API delay
      setTimeout(() => {
        resolve({
          success: true,
          message: "Đăng xuất thành công",
        })
      }, 500)
    })
  },

  /**
   * Get current authenticated user
   * @returns Promise<User | null>
   */
  async getCurrentUser(): Promise<User | null> {
    return new Promise((resolve) => {
      // Simulate API delay
      setTimeout(() => {
        // In real scenario, check if token exists in localStorage/cookies
        const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
        if (token) {
          resolve(MOCK_USER)
        } else {
          resolve(null)
        }
      }, 300)
    })
  },
}

export { authService }
