"use client"

import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Building2, Bell, Shield, Database } from "lucide-react"

const settings = [
  { title: "Thông tin phòng khám", description: "Tên cơ sở, địa chỉ, số điện thoại", icon: Building2 },
  { title: "Thông báo hệ thống", description: "Quản lý cảnh báo và nhắc lịch", icon: Bell },
  { title: "Phân quyền", description: "Vai trò và quyền truy cập", icon: Shield },
  { title: "Dữ liệu", description: "Sao lưu và đồng bộ dữ liệu", icon: Database },
]

export default function AdminSettingsPage() {
  return (
    <div className="min-h-screen space-y-8 bg-[#fafafa] p-6 lg:p-8">
      <PageHeader
        title="Cấu hình hệ thống"
        description="Quản lý các thiết lập chung của phòng khám"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {settings.map((item) => {
          const Icon = item.icon
          return (
            <Card key={item.title} className="border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
              <CardContent className="p-5">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-medical-light text-medical-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-slate-800">{item.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{item.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
