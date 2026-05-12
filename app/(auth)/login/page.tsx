"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Activity, Lock, User } from "lucide-react"
import { toast } from "sonner"
import { authService, type LoginRequest } from "@/core/api/authService"
import { Button } from "@/components/ui/button"
import { POST_LOGIN_ROUTE } from "@/constants/routes"

export default function LoginPage() {
  const router = useRouter()
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
      const response = await authService.login(formData)
      if (response.success && response.user) {
        toast.success(response.message, {
          description: `Chào mừng ${response.user.fullName}`,
          duration: 2000,
        })
        if (
          typeof window !== "undefined" &&
          response.token
        ) {
          localStorage.setItem("auth_token", response.token)
        }
        setTimeout(() => router.push(POST_LOGIN_ROUTE), 1000)
      } else {
        toast.error(response.message || "Đăng nhập thất bại", { duration: 2000 })
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

  return (
    // ✅ medical-light thay vì teal-50 (cùng màu, nhưng dùng token)
    <main className="h-screen w-full bg-medical-light flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-5xl h-[550px] bg-white shadow-[0_20px_50px_rgba(8,112,184,0.07)] rounded-3xl flex overflow-hidden">

        {/* Left panel — gradient trang trí, giữ nguyên thiết kế */}
        <div
          className="hidden md:block w-5/12 relative bg-gradient-to-br from-medical-primary to-emerald-600"
          style={{ clipPath: "polygon(0 0, 100% 0, 80% 100%, 0% 100%)" }}
        >
          <div className="absolute inset-0 flex items-center justify-center px-10">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/15 text-white">
                <Activity className="h-16 w-16" />
              </div>
              <div className="flex items-end justify-center gap-2">
                <span className="text-5xl font-black text-white tracking-tighter">EMR</span>
                <span className="text-xl font-light text-white/80 tracking-[0.3em] ml-1">SYSTEM</span>
              </div>
            </div>
          </div>
          <div className="absolute bottom-12 left-0 right-[15%] text-center px-6">
            <div className="mx-auto mb-3 h-[1px] w-8 bg-white/30" />
            <p className="text-xs uppercase tracking-widest font-medium text-white/70">
              Nền tảng quản lý phòng khám toàn diện
            </p>
          </div>
        </div>

        {/* Right panel — form */}
        <div className="w-full md:w-7/12 flex flex-col justify-center px-8 py-12 md:pl-24 md:pr-16">
          {/* ✅ medical-dark thay vì teal-700 */}
          <h1 className="text-center text-2xl font-bold text-medical-dark tracking-wide mb-10">
            Đăng nhập hệ thống
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* ✅ Dùng Input component — nhưng giữ style border-bottom của login */}
            <div className="relative">
              <input
                type="text"
                name="username"
                placeholder="Tên tài khoản"
                value={formData.username}
                onChange={handleInputChange}
                required
                className="w-full h-12 bg-transparent border-b-2 border-slate-200 focus:border-medical-primary outline-none text-slate-700 text-lg transition-colors px-2 pb-2"
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
                className="w-full h-12 bg-transparent border-b-2 border-slate-200 focus:border-medical-primary outline-none text-slate-700 text-lg transition-colors px-2 pb-2"
              />
              <Lock className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            </div>

            {/* ✅ Dùng Button component — giữ style rounded-full của login */}
            <Button
              type="submit"
              loading={loading}
              className="w-full h-14 mt-8 rounded-full text-lg font-semibold shadow-[0_8px_20px_rgba(13,148,136,0.3)]"
            >
              Đăng nhập
            </Button>
          </form>

          {/* ✅ medical-primary / medical-dark thay vì teal-600 / teal-700 */}
          <div className="mt-6 flex justify-end gap-6 text-sm text-medical-primary">
            <button type="button" className="transition hover:text-medical-dark">
              Quên mật khẩu?
            </button>
            <button type="button" className="transition hover:text-medical-dark">
              Trợ giúp
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
