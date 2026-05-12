"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { ROUTES } from "@/constants/routes"
import { useAuth } from "@/context/AuthContext"
import type { AppRole } from "@/shared/lib/rbac/allowed-roles-for-path"

interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles: readonly AppRole[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter()
  const { user, isLoading, isLoggedIn } = useAuth()

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push(ROUTES.LOGIN)
    }
  }, [isLoading, isLoggedIn, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-sm text-slate-400">Đang kiểm tra quyền truy cập...</div>
      </div>
    )
  }

  if (!isLoggedIn) return null

  const hasPermission = user ? allowedRoles.includes(user.role) : false

  if (!hasPermission) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
        <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-10 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="mb-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-medical-primary">
              403 Forbidden
            </p>
            <h1 className="mt-5 text-3xl font-bold text-slate-900">
              Bạn không có quyền truy cập trang này
            </h1>
            <p className="mt-4 text-sm leading-6 text-slate-500">
              Vai trò hiện tại của bạn không có quyền truy cập nội dung này.
              Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là nhầm lẫn.
            </p>
          </div>
          <div className="flex justify-center">
            <Button
              className="rounded-full px-6"
              onClick={() => router.push(ROUTES.LOGIN)}
            >
              Quay lại trang đăng nhập
            </Button>
          </div>
        </div>
      </main>
    )
  }

  return <>{children}</>
}
