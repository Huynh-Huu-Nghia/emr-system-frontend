"use client"

import { useMemo, useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  MasterTable,
  MasterTableHeader,
  MasterTableBody,
} from "@/components/ui/master-table"
import { TableRow, TableCell, TableHead } from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type {
  Appointment,
  AppointmentStatus,
} from "@/core/api/appointmentService"
import { ROUTES } from "@/constants/routes"
import { usePatientsQuery } from "@/modules/patient/hooks/use-patients-query"
import { useDoctorsQuery } from "@/modules/admin/hooks/use-doctors-query"
import { useAppointmentsQuery } from "@/modules/appointment/hooks/use-appointments-query"
import { useCancelAppointmentMutation } from "@/modules/appointment/hooks/use-appointment-mutations"
import { AppointmentWeekStrip } from "@/modules/appointment/components/appointment-week-strip"
import { AppointmentStatusBadge } from "@/modules/appointment/components/appointment-status-badge"
import { AppointmentEditorDialog } from "@/modules/appointment/components/appointment-editor-dialog"
import { ConfirmDialog } from "@/shared/components/dialog/confirm-dialog"
import { LoadingBlock } from "@/shared/components/states/loading-block"
import { ErrorState } from "@/shared/components/states/error-state"
import { EmptyState } from "@/shared/components/states/empty-state"
import { formatDateTimeVi } from "@/shared/lib/format/date"
import { normalizeUnknownError } from "@/shared/lib/error/normalize-api-error"
import {
  endOfWeekSunday,
  isIsoInRange,
  startOfWeekMonday,
  ymdLocal,
} from "@/modules/appointment/lib/calendar-utils"
import {
  Plus,
  Pencil,
  Ban,
  Search,
  RefreshCw,
  ArrowUp,
  ArrowDown
} from "lucide-react"
import { cn } from "@/lib/utils"

type StatusFilter = "ALL" | AppointmentStatus

const AUTO_REFRESH_INTERVAL = 30_000

export default function ReceptionAppointmentsPage() {
  const [anchorDate, setAnchorDate] = useState(() => new Date())
  const [selectedYmd, setSelectedYmd] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL")

  const [search, setSearch] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  const [editorOpen, setEditorOpen] = useState(false)
  const [editorMode, setEditorMode] = useState<"create" | "reschedule">("create")
  const [editorAppointment, setEditorAppointment] =
    useState<Appointment | null>(null)

  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null)

  const { data: patients = [] } = usePatientsQuery()
  const { data: doctors = [] } = useDoctorsQuery()

  const {
    data: appointments = [],
    isPending,
    isError,
    error,
    refetch,
  } = useAppointmentsQuery()

  const cancelMut = useCancelAppointmentMutation()

  useEffect(() => {
    const interval = setInterval(() => {
      void refetch().then(() => setLastUpdated(new Date()))
    }, AUTO_REFRESH_INTERVAL)

    return () => clearInterval(interval)
  }, [refetch])

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    await refetch()
    setLastUpdated(new Date())
    setIsRefreshing(false)
  }, [refetch])

  const weekStart = useMemo(() => startOfWeekMonday(anchorDate), [anchorDate])
  const weekEnd = useMemo(() => endOfWeekSunday(weekStart), [weekStart])

  const filtered = useMemo(() => {
    return appointments.filter((a) => {
      if (statusFilter !== "ALL" && a.status !== statusFilter) return false
      if (!isIsoInRange(a.starts_at, weekStart, weekEnd)) return false

      if (selectedYmd) {
        const key = ymdLocal(new Date(a.starts_at))
        if (key !== selectedYmd) return false
      }

      if (search.trim()) {
        const q = search.toLowerCase()

        const matched =
          a.patient_name.toLowerCase().includes(q) ||
          a.medical_history_number.toString().toLowerCase().includes(q) ||
          (a.reason ?? "").toLowerCase().includes(q)

        if (!matched) return false
      }

      return true
    }).sort((a, b) => sortOrder === "asc" ? a.id - b.id : b.id - a.id)
  }, [
    appointments,
    statusFilter,
    weekStart,
    weekEnd,
    selectedYmd,
    search,
    sortOrder
  ])

  const errMsg = error ? normalizeUnknownError(error).message : undefined

  const openCreate = () => {
    setEditorMode("create")
    setEditorAppointment(null)
    setEditorOpen(true)
  }

  const openReschedule = (a: Appointment) => {
    setEditorMode("reschedule")
    setEditorAppointment(a)
    setEditorOpen(true)
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Lịch hẹn"
        description="Đặt, đổi hoặc huỷ lịch khám."
      >
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" asChild className="rounded-full">
            <Link href={ROUTES.RECEPTION.PATIENTS}>Hồ sơ bệnh nhân</Link>
          </Button>

          <Button
            className="rounded-full bg-medical-primary hover:bg-medical-dark"
            onClick={openCreate}
            disabled={patients.length === 0 || doctors.length === 0}
          >
            <Plus className="mr-2 h-4 w-4" />
            Đặt lịch mới
          </Button>
        </div>
      </PageHeader>

      {patients.length === 0 ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Chưa có bệnh nhân trong hệ thống. Vui lòng{" "}
          <Link
            className="font-semibold underline"
            href={ROUTES.RECEPTION.PATIENTS}
          >
            tạo hồ sơ bệnh nhân
          </Link>{" "}
          trước khi đặt lịch.
        </div>
      ) : null}

      <AppointmentWeekStrip
        anchorDate={anchorDate}
        onAnchorChange={(monday) => {
          setAnchorDate(monday)
          setSelectedYmd(null)
        }}
        appointments={appointments}
        selectedYmd={selectedYmd}
        onSelectYmd={setSelectedYmd}
      />

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm bệnh nhân, mã HS, lý do..."
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
          <RefreshCw
            className={cn("h-4 w-4", isRefreshing && "animate-spin")}
          />
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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-slate-600">
          {filtered.length} lịch trong khung hiển thị
        </p>

        <div className="w-full sm:w-56">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Trạng thái
          </label>

          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as StatusFilter)}
          >
            <SelectTrigger className="mt-1 w-full" size="sm">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="ALL">Tất cả</SelectItem>
              <SelectItem value="PENDING">Chờ xác nhận</SelectItem>
              <SelectItem value="CONFIRMED">Đã xác nhận</SelectItem>
              <SelectItem value="CANCELLED">Đã huỷ</SelectItem>
              <SelectItem value="COMPLETED">Hoàn tất</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <MasterTable showHeader={false}>
          <MasterTableHeader>
            <TableRow className="border-none hover:bg-transparent">
              <TableHead className="w-24 pl-6 text-[10px] font-bold uppercase tracking-widest text-medical-dark/70">
                <Button variant="ghost" className="-ml-3 h-8 px-2 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-100" onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}>
                  Mã Lịch Hẹn
                  {sortOrder === "desc" ? <ArrowDown className="ml-1.5 h-3 w-3" /> : <ArrowUp className="ml-1.5 h-3 w-3" />}
                </Button>
              </TableHead>
              <TableHead className="min-w-[160px] text-[10px] font-bold uppercase tracking-widest text-medical-dark/70">
                Thời gian
              </TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-medical-dark/70">
                Bệnh nhân
              </TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-medical-dark/70">
                Mã HS
              </TableHead>
              <TableHead className="hidden text-[10px] font-bold uppercase tracking-widest text-medical-dark/70 md:table-cell">
                Ghi chú
              </TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-medical-dark/70">
                Trạng thái
              </TableHead>
              <TableHead className="pr-8 text-right text-[10px] font-bold uppercase tracking-widest text-medical-dark/70">
                Thao tác
              </TableHead>
            </TableRow>
          </MasterTableHeader>

          <MasterTableBody>
            {isPending ? (
              <TableRow>
                <TableCell colSpan={7} className="p-0">
                  <LoadingBlock message="Đang tải lịch hẹn…" />
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={7} className="p-0">
                  <ErrorState
                    description={errMsg}
                    onRetry={() => void refetch()}
                  />
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="p-0">
                  <EmptyState
                    title="Không có lịch hẹn"
                    description="Thử đổi tuần, bộ lọc trạng thái, hoặc đặt lịch mới."
                  />
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((a) => (
                <TableRow
                  key={a.id}
                  className="group transition-colors hover:bg-slate-50"
                >
                  <TableCell className="pl-8 font-mono text-sm font-medium text-medical-primary">
                    {a.appointmentCode}
                  </TableCell>

                  <TableCell className="text-sm font-semibold text-slate-800">
                    {formatDateTimeVi(a.starts_at)}
                  </TableCell>

                  <TableCell className="text-sm font-medium text-slate-700">
                    {a.patient_name}
                  </TableCell>

                  <TableCell className="text-sm font-semibold text-medical-primary">
                    {a.medical_history_number}
                  </TableCell>

                  <TableCell className="hidden max-w-[200px] truncate text-sm text-slate-500 md:table-cell">
                    {a.reason || "—"}
                  </TableCell>

                  <TableCell>
                    <AppointmentStatusBadge status={a.status} />
                  </TableCell>

                  <TableCell className="pr-8 text-right">
                    {a.status === "PENDING" ? (
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="rounded-full shadow-none transition-all hover:bg-slate-100"
                          title="Đổi lịch"
                          onClick={() => openReschedule(a)}
                        >
                          <Pencil className="h-4 w-4 text-slate-600" />
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="rounded-full shadow-none transition-all hover:bg-red-50 hover:text-red-600"
                          title="Huỷ lịch"
                          onClick={() => setCancelTarget(a)}
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </MasterTableBody>
        </MasterTable>
      </div>

      <AppointmentEditorDialog
        key={`${editorMode}-${editorAppointment?.id ?? "new"}`}
        open={editorOpen}
        onOpenChange={setEditorOpen}
        mode={editorMode}
        appointment={editorAppointment}
        patients={patients}
        doctors={doctors}
      />

      <ConfirmDialog
        open={cancelTarget != null}
        onOpenChange={(o) => {
          if (!o) setCancelTarget(null)
        }}
        title="Huỷ lịch hẹn?"
        description={
          cancelTarget ? (
            <span>
              Huỷ lịch của <strong>{cancelTarget.patient_name}</strong> lúc{" "}
              <strong>{formatDateTimeVi(cancelTarget.starts_at)}</strong>?
            </span>
          ) : null
        }
        variant="destructive"
        confirmLabel="Huỷ lịch"
        loading={cancelMut.isPending}
        onConfirm={() => {
          if (!cancelTarget) return
          cancelMut.mutate(cancelTarget.id, {
            onSuccess: () => setCancelTarget(null),
          })
        }}
      />
    </div>
  )
}