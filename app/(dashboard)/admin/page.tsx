"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { dashboardService } from "@/core/api/dashboardService"
import { queryKeys } from "@/shared/query/query-keys"
import { LoadingBlock } from "@/shared/components/states/loading-block"
import { ErrorState } from "@/shared/components/states/error-state"
import { PageHeader } from "@/components/ui/page-header"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Users,
  Stethoscope,
  CalendarDays,
  DollarSign,
  AlertCircle,
  Activity,
  Package,
} from "lucide-react"

const ACTION_LABELS: Record<string, string> = {
  LOGIN: "Đăng nhập",
  CREATE_PATIENT: "Tạo bệnh nhân",
  CREATE_APPOINTMENT: "Tạo lịch hẹn",
  COMPLETE_EXAM: "Hoàn tất khám",
  CONFIRM_PAYMENT: "Xác nhận thanh toán",
  UPDATE_STOCK: "Cập nhật kho thuốc",
  LOCK_USER: "Khóa tài khoản",
  CREATE_DOCTOR: "Thêm hồ sơ bác sĩ",
  CALL_QUEUE: "Gọi vào khám",
  UPDATE_CATEGORY: "Cập nhật danh mục thuốc",
  CREATE_CATEGORY: "Thêm danh mục thuốc",
}

const formatActor = (actor: string) => {
  if (!actor) return "Không rõ"
  if (actor.startsWith("RECEPTIONIST:")) return actor.replace("RECEPTIONIST:", "Lễ tân #")
  if (actor.startsWith("ADMIN:")) return actor.replace("ADMIN:", "Quản trị viên #")
  if (actor.startsWith("DOCTOR:")) return actor.replace("DOCTOR:", "Bác sĩ #")
  if (actor.startsWith("PATIENT:")) return actor.replace("PATIENT:", "Bệnh nhân #")
  return actor
}

const formatTarget = (target: string) => {
  if (!target) return ""
  if (target === "system") return "hệ thống"
  let t = target
  t = t.replace(/appointment #(\d+)/g, "Ca khám #$1")
  t = t.replace(/patient #(\d+)/g, "Bệnh nhân #$1")
  t = t.replace(/doctor #(\d+)/g, "Bác sĩ #$1")
  t = t.replace(/queue #(\d+)/g, "Hàng đợi số $1")
  t = t.replace(/category #(\d+)/g, "Danh mục #$1")
  t = t.replace(/medicine #(\d+)/g, "Thuốc #$1")
  t = t.replace(/invoice #(\d+)/g, "Hóa đơn #$1")
  t = t.replace(/payment #(\d+)/g, "Giao dịch #$1")
  return t
}

const formatTimestamp = (ts: string) => {
  if (!ts) return ""
  // Parse as UTC if it doesn't already have Z or +
  const dateStr = ts.includes('Z') || ts.includes('+') ? ts : ts.replace(' ', 'T') + 'Z'
  return new Date(dateStr).toLocaleString("vi-VN", {
    hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
  })
}

export default function AdminDashboardPage() {
  const [timeframe, setTimeframe] = useState("today")

  const statsQuery = useQuery({
    queryKey: [...queryKeys.dashboard.stats(), timeframe],
    queryFn: () => dashboardService.getStats(timeframe),
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
    { label: "Doanh thu", value: `${(stats.todayRevenue / 1_000_000).toFixed(1)}M`, icon: DollarSign, color: "bg-medical-primary", subtext: "Kỳ báo cáo" },
    { label: "Lịch hẹn hoàn tất", value: `${stats.completedAppointments} / ${stats.todayAppointments}`, icon: CalendarDays, color: "bg-purple-500", subtext: "Kỳ báo cáo" },
    { label: "HĐ chưa thanh toán", value: stats.unpaidInvoices, icon: AlertCircle, color: "bg-amber-500", subtext: "Toàn bộ" },
    { label: "Bệnh nhân mới", value: stats.newPatients ?? 0, icon: Activity, color: "bg-teal-500", subtext: "Kỳ báo cáo" },
    { label: "Tổng bác sĩ", value: stats.totalDoctors, icon: Stethoscope, color: "bg-emerald-500", subtext: "Toàn bộ" },
    { label: "Người dùng", value: stats.totalUsers, icon: Users, color: "bg-blue-500", subtext: "Toàn bộ" },
  ]

  const monthlyRev = stats.monthlyRevenue || Array(12).fill(0)
  const maxRev = Math.max(...monthlyRev, 1)

  return (
    <div className="min-h-screen space-y-8 bg-[#fafafa] p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Dashboard Admin"
          description="Tổng quan hoạt động hệ thống phòng khám"
        />
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-[180px] bg-white">
            <SelectValue placeholder="Chọn thời gian" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Hôm nay</SelectItem>
            <SelectItem value="week">Tuần này</SelectItem>
            <SelectItem value="month">Tháng này</SelectItem>
            <SelectItem value="year">Năm nay</SelectItem>
            <SelectItem value="all">Tất cả thời gian</SelectItem>
          </SelectContent>
        </Select>
      </div>

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
              <p className="text-xs text-slate-500">
                {card.label}
                {card.subtext && <span className="ml-1 text-[10px] text-slate-400">({card.subtext})</span>}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts Area */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Doanh thu theo tháng */}
        <div className="col-span-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h3 className="mb-4 text-lg font-semibold text-slate-800">Doanh thu theo tháng</h3>
          <div className="flex h-64 items-end justify-between gap-2 px-4">
            {monthlyRev.map((val, idx) => {
              const height = (val / maxRev) * 100
              const labelM = (val / 1_000_000).toFixed(1)
              return (
                <div key={idx} className="group relative flex h-full flex-1 flex-col items-center justify-end gap-1">
                  <div className="absolute -top-6 hidden whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-[10px] text-white shadow-lg group-hover:block">
                    {labelM}M
                  </div>
                  <div
                    className="w-full rounded-t-md bg-medical-primary/80 transition-all hover:bg-medical-primary"
                    style={{ height: `${height}%`, minHeight: val > 0 ? "4px" : "0px" }}
                  />
                  <span className="text-[10px] text-slate-400">T{idx + 1}</span>
                </div>
              )
            })}
          </div>
          <p className="mt-3 text-center text-xs text-slate-400">Đơn vị: triệu VNĐ (Năm {new Date().getFullYear()})</p>
        </div>

        {/* Top Medicines */}
        <div className="col-span-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h3 className="mb-4 text-lg font-semibold text-slate-800">Top Thuốc Xuất Kho</h3>
          {stats.topMedicines?.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-slate-400">
              <Package className="mb-2 h-8 w-8 opacity-20" />
              <p className="text-sm">Chưa có dữ liệu</p>
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              {stats.topMedicines?.map((med, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-medical-primary/10 text-xs font-bold text-medical-primary">
                      #{idx + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">{med.name}</p>
                      <p className="text-xs text-slate-500">Đơn vị: {med.unit}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-medical-primary">{med.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Audit Log Timeline */}
        <div className="col-span-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h3 className="mb-4 text-lg font-semibold text-slate-800">Dòng thời gian hoạt động</h3>
          {auditQuery.isPending ? (
            <div className="flex h-64 items-center justify-center">
              <span className="text-sm text-slate-400">Đang tải...</span>
            </div>
          ) : auditLog.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-slate-400">
              <Activity className="mb-2 h-8 w-8 opacity-20" />
              <p className="text-sm">Chưa có hoạt động nào</p>
            </div>
          ) : (
            <div className="relative max-h-72 space-y-0 overflow-y-auto pl-2 pr-2">
              <div className="absolute bottom-0 left-[13px] top-2 w-[2px] bg-slate-100" />
              {auditLog.map((entry) => (
                <div key={entry.id} className="relative pb-5 pl-6 last:pb-0">
                  <div className="absolute left-[3px] top-1.5 h-2.5 w-2.5 rounded-full border-[2px] border-white bg-medical-primary shadow-sm" />
                  <div className="flex flex-col">
                    <p className="text-sm text-slate-700">
                      <span className="font-semibold text-slate-900">{formatActor(entry.actor)}</span>
                      {" "}
                      <span className="text-slate-500">{ACTION_LABELS[entry.action] ?? entry.action}</span>
                      {" "}
                      <span className="font-medium text-medical-primary">{formatTarget(entry.target)}</span>
                    </p>
                    <p className="mt-0.5 text-[11px] font-medium text-slate-400">
                      {formatTimestamp(entry.timestamp)}
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
