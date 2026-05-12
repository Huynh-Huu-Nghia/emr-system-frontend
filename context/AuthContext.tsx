"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { authService, AUTH_USER_KEY, type User, type LoginRequest } from "@/core/api/authService"
import { useRouter } from "next/navigation"
import { ROUTES } from "@/constants/routes"
import { toast } from "sonner"

// ✅ Định nghĩa những gì Context cung cấp cho toàn app
interface AuthContextValue {
  user: User | null
  isLoading: boolean
  isLoggedIn: boolean
  login: (credentials: LoginRequest) => Promise<User | null>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true) // true ban đầu để tránh flash

  // Khi app load, tự động lấy user từ token đã lưu
  useEffect(() => {
    authService.getCurrentUser().then((u) => {
      setUser(u)
      setIsLoading(false)
    })
  }, [])

  const login = async (credentials: LoginRequest): Promise<User | null> => {
    const response = await authService.login(credentials)
    if (response.success && response.user && response.token) {
      localStorage.setItem("auth_token", response.token)
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.user))
      setUser(response.user)
      toast.success(response.message, {
        description: `Chào mừng ${response.user.fullName}`,
        duration: 2000,
      })
      return response.user
    }
    toast.error(response.message || "Đăng nhập thất bại")
    return null
  }

  const logout = async () => {
    await authService.logout()
    localStorage.removeItem("auth_token")
    localStorage.removeItem(AUTH_USER_KEY)
    setUser(null)
    router.push(ROUTES.LOGIN)
    toast.success("Đã đăng xuất")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isLoggedIn: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// ✅ Custom hook — toàn team dùng useAuth(), không ai gọi useContext(AuthContext) thủ công
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth phải được dùng bên trong <AuthProvider>")
  }
  return ctx
}
