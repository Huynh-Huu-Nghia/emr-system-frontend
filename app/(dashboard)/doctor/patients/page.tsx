"use client"

import { useRouter } from "next/navigation"
import { useState, useMemo, useEffect, useCallback } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Stethoscope, Clock, UserCheck, Search, RefreshCw } from "lucide-react"
import { useListenQueue, useStartQueueMutation } from "@/shared/queue/queue-stub"
import { formatDateVi } from "@/shared/lib/format/date"
import { ROUTES } from "@/constants/routes"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const AUTO_REFRESH_INTERVAL = 30_000

export default function DoctorPatientsPage() {
  const [search, setSearch] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const queue = useListenQueue()
  const startQueue = useStartQueueMutation()

  const filteredQueue = useMemo(() => {
  if (!search.trim()) return queue

  const q = search.toLowerCase()

  return queue.filter(
    (patient) =>
      patient.patientName.toLowerCase().includes(q) ||
      patient.medicalHistoryNumber.toLowerCase().includes(q) ||
      patient.source.toLowerCase().includes(q)
  )
}, [queue, search])

  const router = useRouter()

  const handleRefresh = useCallback(async () => {
  setIsRefreshing(true)
  await new Promise((resolve) => setTimeout(resolve, 500))
  setLastUpdated(new Date())
  setIsRefreshing(false)
}, [])

useEffect(() => {
  const interval = setInterval(() => {
    setLastUpdated(new Date())
  }, AUTO_REFRESH_INTERVAL)

  return () => clearInterval(interval)
}, [])

  const handleStartExam = async (patient: (typeof queue)[number]) => {
    try {
      await startQueue.mutateAsync(patient.id)
    } catch (e) {
      // Allow proceeding even if status update fails
      console.error("Failed to start queue:", e)
    }
    const params = new URLSearchParams()
    params.set("patientName", patient.patientName)
    params.set("medicalHistoryNumber", patient.medicalHistoryNumber)
    params.set("queueId", String(patient.id))
    if (patient.patientId != null) params.set("patientId", String(patient.patientId))
    if (patient.appointmentId != null) params.set("appointmentId", String(patient.appointmentId))
    if (patient.reason) params.set("reason", patient.reason)
    router.push(`${ROUTES.DOCTOR.EXAMINATION}?${params.toString()}`)
  }

  return (
    <div className="min-h-screen space-y-8 bg-[#fafafa] p-6 lg:p-8">
      <PageHeader
        title="Bệnh nhân đang chờ"
        description="Danh sách bệnh nhân chờ khám theo thứ tự check-in"
      >
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Clock className="h-4 w-4" />
          {queue.length} bệnh nhân
        </div>
      </PageHeader>

      <div className="flex items-center gap-3">
  <div className="relative flex-1">
    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    <Input
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Tìm theo tên, mã hồ sơ..."
      className="pl-9 rounded-xl border-slate-200 bg-white shadow-sm focus-visible:ring-1 focus-visible:ring-slate-300"
    />
  </div>

  <Button
    variant="outline"
    size="sm"
    onClick={() => void handleRefresh()}
    disabled={isRefreshing}
    className="gap-2 rounded-xl border-slate-200 bg-white shadow-sm"
  >
    <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
    Làm mới
  </Button>
</div>

<div className="flex items-center gap-2 -mt-5 pl-1">
  <span className="relative flex h-2 w-2">
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
  </span>

  <span className="text-xs text-slate-400">
    Tự động làm mới mỗi 30 giây · Cập nhật lần cuối:{" "}
    {lastUpdated.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })}
  </span>
</div>

      {filteredQueue.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-slate-200 bg-white py-16 shadow-sm">
          <UserCheck className="h-16 w-16 text-slate-200" />
          <p className="text-sm font-medium text-slate-600">Chưa có bệnh nhân trong hàng đợi</p>
          <p className="text-xs text-slate-400">Bệnh nhân sẽ xuất hiện khi lễ tân thực hiện check-in</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="divide-y divide-slate-100">
            {filteredQueue.map((patient, idx) => (
              <div
                key={patient.id}
                className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-slate-50"
              >
                <div className="flex items-center gap-4">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-medical-light text-sm font-bold text-medical-primary">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-800">{patient.patientName}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>#{patient.medicalHistoryNumber}</span>
                      <span>•</span>
                      <span>{formatDateVi(patient.enqueuedAt)}</span>
                      {patient.source === "WALK_IN" && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">Vãng lai</span>
                      )}
                    </div>
                    {patient.reason && (
                      <p className="mt-1 text-sm text-slate-500">
                        <span className="font-medium">Lý do khám:</span> {patient.reason}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  onClick={() => void handleStartExam(patient)}
                  disabled={startQueue.isPending}
                  size="sm"
                  className="rounded-lg bg-medical-primary text-white hover:bg-medical-dark"
                >
                  <Stethoscope className="mr-1.5 h-4 w-4" />
                  Khám
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
