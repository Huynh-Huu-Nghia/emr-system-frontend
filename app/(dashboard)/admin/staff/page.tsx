"use client"

import { useState } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { UsersTab } from "@/modules/admin/components/users-tab"
import { DoctorsTab } from "@/modules/admin/components/doctors-tab"
import { ReceptionistsTab } from "@/modules/admin/components/receptionists-tab"

type TabId = "users" | "doctors" | "receptionists"

export default function AdminStaffPage() {
  const [activeTab, setActiveTab] = useState<TabId>("users")

  return (
    <div className="min-h-screen space-y-8 bg-[#fafafa] p-6 lg:p-8">
      <PageHeader
        title="Quản lý Nhân sự"
        description="Quản lý tài khoản người dùng, bác sĩ và nhân viên lễ tân"
      />

      <div className="flex space-x-1 rounded-xl bg-slate-100 p-1 w-fit">
        {(["users", "doctors", "receptionists"] as TabId[]).map((tab) => {
          const labels = { users: "Hồ sơ Quản trị viên", doctors: "Hồ sơ Bác sĩ", receptionists: "Hồ sơ Lễ tân" }
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === tab ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
              }`}
            >
              {labels[tab]}
            </button>
          )
        })}
      </div>

      <div className="mt-6">
        {activeTab === "users" && <UsersTab />}
        {activeTab === "doctors" && <DoctorsTab />}
        {activeTab === "receptionists" && <ReceptionistsTab />}
      </div>
    </div>
  )
}