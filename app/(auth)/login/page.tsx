"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Activity, Lock, User } from "lucide-react"
import { toast } from "sonner"
import type { LoginRequest } from "@/core/api/authService"
import { resolveMockRoleFromUsername } from "@/core/api/authService"
import { Button } from "@/components/ui/button"
import { getPostLoginPathForRole } from "@/constants/routes"
import { useAuth } from "@/context/AuthContext"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<LoginRequest>({
    username: "",
    password: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(formData)
      if (user) {
        setTimeout(
          () => router.push(getPostLoginPathForRole(user.role)),
          600
        )
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra. Vui lòng thử lại", {
        description: error instanceof Error ? error.message : "Unknown error",
        duration: 2000,
      })
    } finally {
      setLoading(false)
    }
  }

  const previewRole = resolveMockRoleFromUsername(formData.username)

  return (
    <main className="flex h-screen w-full items-center justify-center bg-medical-light px-4 py-8">
      <div className="flex h-[550px] w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-[0_20px_50px_rgba(8,112,184,0.07)]">
        <div
          className="relative hidden w-5/12 bg-gradient-to-br from-medical-primary to-emerald-600 md:block"
          style={{ clipPath: "polygon(0 0, 100% 0, 80% 100%, 0% 100%)" }}
        >
          <div className="absolute inset-0 flex items-center justify-center px-10">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/15 text-white">
                <Activity className="h-16 w-16" />
              </div>
              <div className="flex items-end justify-center gap-2">
                <span className="text-5xl font-black tracking-tighter text-white">
                  EMR
                </span>
                <span className="ml-1 text-xl font-light tracking-[0.3em] text-white/80">
                  SYSTEM
                </span>
              </div>
            </div>
          </div>
          <div className="absolute bottom-12 left-0 right-[15%] px-6 text-center">
            <div className="mx-auto mb-3 h-px w-8 bg-white/30" />
            <p className="text-xs font-medium uppercase tracking-widest text-white/70">
              Nền tảng quản lý phòng khám toàn diện
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col justify-center px-8 py-12 md:w-7/12 md:pl-24 md:pr-16">
          <h1 className="mb-10 text-center text-2xl font-bold tracking-wide text-medical-dark">
            Đăng nhập hệ thống
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="relative">
              <input
                type="text"
                name="username"
                placeholder="Tên tài khoản (thử: reception / doctor / admin)"
                value={formData.username}
                onChange={handleInputChange}
                required
                className="h-12 w-full border-b-2 border-slate-200 bg-transparent px-2 pb-2 text-lg text-slate-700 outline-none transition-colors focus:border-medical-primary"
              />
              <User className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            </div>

            <div className="relative">
              <input
                type="password"
                name="password"
                placeholder="Mật khẩu"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="h-12 w-full border-b-2 border-slate-200 bg-transparent px-2 pb-2 text-lg text-slate-700 outline-none transition-colors focus:border-medical-primary"
              />
              <Lock className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            </div>

            <p className="text-center text-xs text-slate-500">
              Mock: vai trò theo username — hiện tại:{" "}
              <span className="font-semibold text-medical-dark">{previewRole}</span>
            </p>

            <Button
              type="submit"
              loading={loading}
              className="mt-2 h-14 w-full rounded-full text-lg font-semibold shadow-[0_8px_20px_rgba(13,148,136,0.3)]"
            >
              Đăng nhập
            </Button>
          </form>

          <div className="mt-6 flex justify-end gap-6 text-sm text-medical-primary">
            <button
              type="button"
              className="transition hover:text-medical-dark"
            >
              Quên mật khẩu?
            </button>
            <button
              type="button"
              className="transition hover:text-medical-dark"
            >
              Trợ giúp
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
