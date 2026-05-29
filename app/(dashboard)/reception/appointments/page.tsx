"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
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
import type { Appointment, AppointmentStatus } from "@/core/api/appointmentService"
import { ROUTES } from "@/constants/routes"
import { usePatientsQuery } from "@/modules/patient/hooks/use-patients-query"
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
import { Plus, Pencil, Ban } from "lucide-react"

type StatusFilter = "ALL" | AppointmentStatus

export default function ReceptionAppointmentsPage() {
  const [anchorDate, setAnchorDate] = useState(() => new Date())
  const [selectedYmd, setSelectedYmd] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL")

  const [editorOpen, setEditorOpen] = useState(false)
  const [editorMode, setEditorMode] = useState<"create" | "reschedule">("create")
  const [editorAppointment, setEditorAppointment] = useState<Appointment | null>(
    null
  )

  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null)

  const { data: patients = [] } = usePatientsQuery()
  const {
    data: appointments = [],
    isPending,
    isError,
    error,
    refetch,
  } = useAppointmentsQuery()

  const cancelMut = useCancelAppointmentMutation()

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
      return true
    })
  }, [appointments, statusFilter, weekStart, weekEnd, selectedYmd])

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
        description="Đặt, đổi hoặc huỷ lịch khám. Dữ liệu mock — thay `appointmentService` khi có API."
      >
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" asChild className="rounded-full">
            <Link href={ROUTES.RECEPTION.PATIENTS}>Hồ sơ bệnh nhân</Link>
          </Button>
          <Button
            className="rounded-full bg-medical-primary hover:bg-medical-dark"
            onClick={openCreate}
            disabled={patients.length === 0}
          >
            <Plus className="mr-2 h-4 w-4" />
            Đặt lịch mới
          </Button>
        </div>
      </PageHeader>

      {patients.length === 0 ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Chưa có bệnh nhân trong hệ thống. Vui lòng{" "}
          <Link className="font-semibold underline" href={ROUTES.RECEPTION.PATIENTS}>
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
              <SelectItem value="SCHEDULED">Đã đặt</SelectItem>
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
              <TableHead className="min-w-[160px] pl-6 text-[10px] font-bold uppercase tracking-widest text-medical-dark/70">
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
              <TableHead className="pr-6 text-right text-[10px] font-bold uppercase tracking-widest text-medical-dark/70">
                Thao tác
              </TableHead>
            </TableRow>
          </MasterTableHeader>
          <MasterTableBody>
            {isPending ? (
              <TableRow>
                <TableCell colSpan={6} className="p-0">
                  <LoadingBlock message="Đang tải lịch hẹn…" />
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={6} className="p-0">
                  <ErrorState description={errMsg} onRetry={() => void refetch()} />
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="p-0">
                  <EmptyState
                    title="Không có lịch hẹn"
                    description="Thử đổi tuần, bộ lọc trạng thái, hoặc đặt lịch mới."
                  />
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((a) => (
                <TableRow key={a.id} className="hover:bg-slate-50/80">
                  <TableCell className="pl-6 text-sm font-medium text-slate-800">
                    {formatDateTimeVi(a.starts_at)}
                  </TableCell>
                  <TableCell className="text-sm text-slate-700">
                    {a.patient_name}
                  </TableCell>
                  <TableCell className="text-sm font-medium text-medical-primary">
                    #{a.medical_history_number}
                  </TableCell>
                  <TableCell className="hidden max-w-[200px] truncate text-sm text-slate-500 md:table-cell">
                    {a.reason || "—"}
                  </TableCell>
                  <TableCell>
                    <AppointmentStatusBadge status={a.status} />
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    {a.status === "SCHEDULED" ? (
                      <div className="flex justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="rounded-full"
                          title="Đổi lịch"
                          onClick={() => openReschedule(a)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="rounded-full text-destructive hover:text-destructive"
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
