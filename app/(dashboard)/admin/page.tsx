"use client"

import { useQuery } from "@tanstack/react-query"
import { dashboardService } from "@/core/api/dashboardService"
import { queryKeys } from "@/shared/query/query-keys"
import { LoadingBlock } from "@/shared/components/states/loading-block"
import { ErrorState } from "@/shared/components/states/error-state"
import { PageHeader } from "@/components/ui/page-header"
import {
  Users,
  Stethoscope,
  CalendarDays,
  DollarSign,
  AlertCircle,
  Activity,
} from "lucide-react"

const ACTION_LABELS: Record<string, string> = {
  LOGIN: "Đăng nhập",
  CREATE_PATIENT: "Tạo bệnh nhân",
  CREATE_APPOINTMENT: "Tạo lịch hẹn",
  COMPLETE_EXAM: "Hoàn tất khám",
  CONFIRM_PAYMENT: "Xác nhận thanh toán",
  UPDATE_STOCK: "Cập nhật kho",
  LOCK_USER: "Khóa tài khoản",
  CREATE_DOCTOR: "Thêm bác sĩ",
}

export default function AdminDashboardPage() {
  const statsQuery = useQuery({
    queryKey: queryKeys.dashboard.stats(),
    queryFn: () => dashboardService.getStats(),
  })

  const auditQuery = useQuery({
    queryKey: queryKeys.dashboard.auditLog(),
    queryFn: () => dashboardService.getAuditLog(),
  })

  if (statsQuery.isPending) return <LoadingBlock />
  if (statsQuery.isError) return <ErrorState description="Không thể tải dữ liệu dashboard" onRetry={() => void statsQuery.refetch()} />

  const stats = statsQuery.data
  const auditLog = auditQuery.data ?? []

  const kpiCards = [
    { label: "Tổng người dùng", value: stats.totalUsers, icon: Users, color: "bg-blue-500" },
    { label: "Bác sĩ", value: stats.totalDoctors, icon: Stethoscope, color: "bg-emerald-500" },
    { label: "Lịch hẹn hôm nay", value: stats.todayAppointments, icon: CalendarDays, color: "bg-purple-500" },
    { label: "Doanh thu", value: `${(stats.revenue / 1_000_000).toFixed(1)}M`, icon: DollarSign, color: "bg-amber-500" },
    { label: "HĐ chưa thanh toán", value: stats.unpaidInvoices, icon: AlertCircle, color: "bg-red-500" },
    { label: "Bệnh nhân", value: stats.totalPatients, icon: Activity, color: "bg-teal-500" },
  ]

  return (
    <div className="min-h-screen space-y-8 bg-[#fafafa] p-6 lg:p-8">
      <PageHeader
        title="Dashboard Admin"
        description="Tổng quan hoạt động hệ thống phòng khám"
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {kpiCards.map((card) => (
          <div
            key={card.label}
            className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.color} text-white shadow-lg`}>
              <card.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{card.value}</p>
              <p className="text-xs text-slate-500">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Chart Placeholder + Audit Log */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Revenue Chart */}
        <div className="col-span-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h3 className="mb-4 text-lg font-semibold text-slate-800">Doanh thu theo tháng</h3>
          <div className="flex h-64 items-end justify-between gap-2 px-4">
            {[1.2, 1.8, 1.5, 2.1, 2.4, 1.9, 2.8, 2.2, 3.0, 2.5, 2.9, 2.45].map((val, idx) => {
              const height = (val / 3.0) * 100
              return (
                <div key={idx} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-md bg-medical-primary/80 transition-all hover:bg-medical-primary"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-[10px] text-slate-400">T{idx + 1}</span>
                </div>
              )
            })}
          </div>
          <p className="mt-3 text-center text-xs text-slate-400">Đơn vị: triệu VNĐ (dữ liệu mẫu)</p>
        </div>

        {/* Audit Log */}
        <div className="col-span-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h3 className="mb-4 text-lg font-semibold text-slate-800">Lịch sử hệ thống</h3>
          {auditQuery.isPending ? (
            <p className="text-sm text-slate-400">Đang tải...</p>
          ) : (
            <div className="max-h-72 space-y-3 overflow-y-auto">
              {auditLog.map((entry) => (
                <div key={entry.id} className="flex items-start gap-3 border-b border-slate-100 pb-3 last:border-0">
                  <div className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full bg-medical-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-700">
                      <span className="font-medium">{entry.actor}</span>
                      {" — "}
                      <span>{ACTION_LABELS[entry.action] ?? entry.action}</span>
                      {" → "}
                      <span className="text-slate-500">{entry.target}</span>
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(entry.timestamp).toLocaleString("vi-VN")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
