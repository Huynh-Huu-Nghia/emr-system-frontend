"use client"

import { useState } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { MedicinesTab } from "@/modules/admin/components/medicines-tab"
import { MedicineCategoriesTab } from "@/modules/admin/components/medicine-categories-tab"
import { Pill, Tags } from "lucide-react"

export default function AdminMedicinesPage() {
  const [activeTab, setActiveTab] = useState<"medicines" | "categories">("medicines")

  return (
    <div className="min-h-screen space-y-6 bg-[#fafafa] p-6 lg:p-8">
      <PageHeader
        title="Quản lý Kho thuốc & Phân loại"
        description="Kiểm soát danh mục thuốc, phân loại, theo dõi tồn kho và hạn sử dụng"
      />

      <div className="flex justify-center md:justify-start">
        <div className="inline-flex h-12 items-center justify-center rounded-full bg-slate-200/50 p-1 text-slate-500 shadow-inner">
          <button
            onClick={() => setActiveTab("medicines")}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-200 ${
              activeTab === "medicines"
                ? "bg-white text-medical-primary shadow-sm"
                : "hover:bg-slate-200/50 hover:text-slate-900"
            }`}
          >
            <Pill className="mr-2 h-4 w-4" />
            Kho thuốc
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-200 ${
              activeTab === "categories"
                ? "bg-white text-medical-primary shadow-sm"
                : "hover:bg-slate-200/50 hover:text-slate-900"
            }`}
          >
            <Tags className="mr-2 h-4 w-4" />
            Phân loại thuốc
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {activeTab === "medicines" && <MedicinesTab />}
        {activeTab === "categories" && <MedicineCategoriesTab />}
      </div>
    </div>
  )
}