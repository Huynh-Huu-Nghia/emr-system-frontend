"use client"

import { useState } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Bell, Lock, User } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/context/AuthContext"

export default function SettingsPage() {
  const { user } = useAuth()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [notifyAppointments, setNotifyAppointments] = useState(true)
  const [notifyPayments, setNotifyPayments] = useState(true)

  const handleSavePassword = () => {
    if (!currentPassword || !newPassword) {
      toast.error("Vui lòng nhập đầy đủ mật khẩu")
      return
    }
    toast.success("Đã ghi nhận yêu cầu đổi mật khẩu")
    setCurrentPassword("")
    setNewPassword("")
  }

  const handleSaveNotifications = () => {
    toast.success("Đã lưu cài đặt thông báo")
  }

  return (
    <div className="min-h-screen space-y-8 bg-[#fafafa] p-6 lg:p-8">
      <PageHeader
        title="Cài đặt cá nhân"
        description="Quản lý thông tin tài khoản, mật khẩu và thông báo"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-medical-light text-medical-primary">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">Thông tin tài khoản</h2>
              <p className="text-sm text-slate-500">Thông tin đăng nhập hiện tại</p>
            </div>
          </div>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <dt className="text-slate-500">Tên đăng nhập</dt>
              <dd className="font-medium text-slate-800">{user?.username}</dd>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <dt className="text-slate-500">Vai trò</dt>
              <dd className="font-medium text-medical-primary">{user?.role}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-medical-light text-medical-primary">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">Đổi mật khẩu</h2>
              <p className="text-sm text-slate-500">Cập nhật mật khẩu đăng nhập</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Mật khẩu hiện tại</Label>
              <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Mật khẩu mới</Label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <Button onClick={handleSavePassword} className="bg-medical-primary text-white hover:bg-medical-dark">
              Lưu mật khẩu
            </Button>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-medical-light text-medical-primary">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">Thông báo</h2>
              <p className="text-sm text-slate-500">Chọn loại thông báo muốn nhận</p>
            </div>
          </div>
          <div className="space-y-3">
            <label className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3">
              <span className="text-sm text-slate-700">Thông báo lịch hẹn</span>
              <input type="checkbox" checked={notifyAppointments} onChange={(e) => setNotifyAppointments(e.target.checked)} />
            </label>
            <label className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3">
              <span className="text-sm text-slate-700">Thông báo thanh toán</span>
              <input type="checkbox" checked={notifyPayments} onChange={(e) => setNotifyPayments(e.target.checked)} />
            </label>
            <Button onClick={handleSaveNotifications} className="bg-medical-primary text-white hover:bg-medical-dark">
              Lưu cài đặt
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}
