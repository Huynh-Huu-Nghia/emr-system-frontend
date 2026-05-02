"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import type { ReactNode } from "react"

interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles: string[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter()

  // Mock auth state for now; replace with Zustand auth state later.
  const currentRole = "RECEPTIONIST"
  const isLoggedIn = Boolean(currentRole)

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login")
    }
  }, [isLoggedIn, router])

  if (!isLoggedIn) {
    return null
  }

  const hasPermission = allowedRoles.includes(currentRole)

  if (!hasPermission) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-10 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="mb-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-600">403 Forbidden</p>
            <h1 className="mt-5 text-3xl font-bold text-slate-900">Bạn không có quyền truy cập trang này</h1>
            <p className="mt-4 text-sm leading-6 text-slate-500">
              Vai trò hiện tại của bạn không có quyền truy cập nội dung này. Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là nhầm lẫn.
            </p>
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="inline-flex items-center rounded-full bg-teal-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
            >
              Quay lại
            </button>
          </div>
        </div>
      </main>
    )
  }

  return <>{children}</>
}
