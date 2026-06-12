"use client"

import { useMemo, type ComponentType, type ReactNode } from "react"
import Link from "next/link"
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  Clock,
  FileText,
  Phone,
  Receipt,
  Users,
} from "lucide-react"

import { PageHeader } from "@/components/ui/page-header"
import { ROUTES } from "@/constants/routes"
import type { Appointment } from "@/core/api/appointmentService"
import type { QueueItem } from "@/core/api/queueService"
import { cn } from "@/lib/utils"
import { usePaymentsQuery } from "@/modules/admin/hooks/use-payments-query"
import { AppointmentStatusBadge } from "@/modules/appointment/components/appointment-status-badge"
import { useAppointmentsQuery } from "@/modules/appointment/hooks/use-appointments-query"
import { usePatientsQuery } from "@/modules/patient/hooks/use-patients-query"
import { formatDateTimeVi } from "@/shared/lib/format/date"
import { useListenQueue } from "@/shared/queue/queue-stub"

function isToday(isoLike?: string | null) {
  if (!isoLike) return false
  const d = new Date(isoLike)
  const now = new Date()
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  )
}

function isUpcomingToday(appointment: Appointment) {
  const ts = new Date(appointment.starts_at).getTime()
  return (
    isToday(appointment.starts_at) &&
    ts >= Date.now() &&
    appointment.status !== "CANCELLED"
  )
}

function shortTime(isoLike?: string | null) {
  if (!isoLike) return "Chưa rõ giờ"
  const d = new Date(isoLike)
  if (Number.isNaN(d.getTime())) return "Chưa rõ giờ"
  return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
}

function queueStatusLabel(status?: string) {
  switch ((status || "").toUpperCase()) {
    case "CALLED":
      return "Đã gọi"
    case "IN_PROGRESS":
      return "Đang khám"
    case "DONE":
      return "Hoàn tất"
    default:
      return "Đang chờ"
  }
}

export default function ReceptionPage() {
  const queue = useListenQueue()
  const { data: patients = [], isPending: loadingPatients } = usePatientsQuery()
  const { data: appointments = [], isPending: loadingAppointments } =
    useAppointmentsQuery()
  const { data: payments = [], isPending: loadingPayments } = usePaymentsQuery()

  const todayAppointments = useMemo(
    () =>
      appointments
        .filter((appointment) => isToday(appointment.starts_at))
        .sort(
          (a, b) =>
            new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()
        ),
    [appointments]
  )

  const upcomingAppointments = useMemo(
    () => todayAppointments.filter(isUpcomingToday).slice(0, 5),
    [todayAppointments]
  )

  const activeQueue = useMemo(
    () =>
      queue
        .filter((item) => !["DONE", "CANCELLED"].includes(item.status?.toUpperCase()))
        .sort((a, b) => (a.position ?? a.id) - (b.position ?? b.id)),
    [queue]
  )

  const pendingAppointments = todayAppointments.filter(
    (appointment) => appointment.status === "PENDING"
  )
  const completedAppointments = todayAppointments.filter(
    (appointment) => appointment.status === "COMPLETED"
  )
  const unpaidPayments = payments.filter((payment) => payment.status === "UNPAID")
  const registeredQueueCount = activeQueue.filter(
    (item) => item.source === "REGISTERED" || item.source === "APPOINTMENT"
  ).length
  const walkInQueueCount = activeQueue.filter((item) => item.source === "WALK_IN").length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bảng điều phối lễ tân"
        description="Theo dõi tình hình tiếp nhận, lịch hẹn, hàng đợi và thanh toán trong ngày."
      />

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={CalendarDays}
          label="Lịch hẹn hôm nay"
          value={loadingAppointments ? "..." : String(todayAppointments.length)}
          detail={`${pendingAppointments.length} lịch chờ xác nhận`}
          tone="sky"
        />
        <MetricCard
          icon={Users}
          label="Đang trong hàng đợi"
          value={String(activeQueue.length)}
          detail={`${registeredQueueCount} có hồ sơ, ${walkInQueueCount} vãng lai`}
          tone="emerald"
        />
        <MetricCard
          icon={FileText}
          label="Hồ sơ bệnh nhân"
          value={loadingPatients ? "..." : String(patients.length)}
          detail="Dữ liệu dùng để đặt lịch và check-in"
          tone="slate"
        />
        <MetricCard
          icon={Receipt}
          label="Chờ thanh toán"
          value={loadingPayments ? "..." : String(unpaidPayments.length)}
          detail={`${completedAppointments.length} lượt đã khám hôm nay`}
          tone="amber"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Panel
          title="Lịch hẹn sắp tới"
          description="Các lượt khám còn lại trong hôm nay."
          actionHref={ROUTES.RECEPTION.APPOINTMENTS}
          actionLabel="Xem lịch"
        >
          {upcomingAppointments.length === 0 ? (
            <EmptyLine text="Chưa có lịch hẹn sắp tới trong hôm nay." />
          ) : (
            <div className="divide-y divide-slate-100">
              {upcomingAppointments.map((appointment) => (
                <AppointmentRow key={appointment.id} appointment={appointment} />
              ))}
            </div>
          )}
        </Panel>

        <Panel
          title="Hàng đợi khám"
          description="Ưu tiên xử lý theo thứ tự check-in và trạng thái gọi."
          actionHref={ROUTES.RECEPTION.CHECKIN}
          actionLabel="Điều phối"
        >
          {activeQueue.length === 0 ? (
            <EmptyLine text="Hàng đợi đang trống. Check-in để đưa bệnh nhân vào hàng đợi." />
          ) : (
            <div className="space-y-3">
              {activeQueue.slice(0, 5).map((item, index) => (
                <QueueRow key={item.id} item={item} fallbackPosition={index + 1} />
              ))}
            </div>
          )}
        </Panel>
      </section>

      <Panel
        title="Việc cần chú ý"
        description="Các tín hiệu giúp ca trực không bị sót việc."
      >
        <div className="grid gap-3 md:grid-cols-2">
          <AttentionItem
            icon={AlertCircle}
            title={`${pendingAppointments.length} lịch chờ xác nhận`}
            description="Kiểm tra lại bác sĩ, giờ khám và thông tin liên hệ trước khi bệnh nhân đến."
            urgent={pendingAppointments.length > 0}
          />
          <AttentionItem
            icon={Phone}
            title={`${upcomingAppointments.length} lượt sắp tới`}
            description="Chuẩn bị hồ sơ, mã bệnh án và hướng dẫn bệnh nhân check-in đúng lượt."
            urgent={upcomingAppointments.length > 0}
          />
        </div>
      </Panel>
    </div>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
  tone,
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  value: string
  detail: string
  tone: "sky" | "emerald" | "slate" | "amber"
}) {
  const toneClass = {
    sky: "bg-sky-50 text-sky-700",
    emerald: "bg-emerald-50 text-emerald-700",
    slate: "bg-slate-100 text-slate-700",
    amber: "bg-amber-50 text-amber-800",
  }[tone]

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
        </div>
        <span className={cn("rounded-lg p-2", toneClass)}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-3 text-sm text-slate-500">{detail}</p>
    </article>
  )
}

function Panel({
  title,
  description,
  actionHref,
  actionLabel,
  children,
}: {
  title: string
  description: string
  actionHref?: string
  actionLabel?: string
  children: ReactNode
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        {actionHref && actionLabel ? (
          <Link
            href={actionHref}
            className="inline-flex h-7 items-center gap-1 rounded-lg px-2.5 text-[0.8rem] font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            {actionLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  )
}

function AppointmentRow({ appointment }: { appointment: Appointment }) {
  return (
    <div className="grid gap-3 py-3 sm:grid-cols-[96px_1fr_auto] sm:items-center">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
        <Clock className="h-4 w-4 text-slate-400" />
        {shortTime(appointment.starts_at)}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-900">
          {appointment.patient_name || "Chưa có tên bệnh nhân"}
        </p>
        <p className="mt-1 truncate text-xs text-slate-500">
          {appointment.doctor_name || "Chưa gán bác sĩ"}
          {appointment.reason ? ` · ${appointment.reason}` : ""}
        </p>
      </div>
      <AppointmentStatusBadge status={appointment.status} />
    </div>
  )
}

function QueueRow({
  item,
  fallbackPosition,
}: {
  item: QueueItem
  fallbackPosition: number
}) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">
            #{item.position ?? fallbackPosition} · {item.patientName}
          </p>
          <p className="mt-1 truncate text-xs text-slate-500">
            {item.medicalHistoryNumber}
            {item.doctorName ? ` · ${item.doctorName}` : ""}
          </p>
        </div>
        <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-600">
          {queueStatusLabel(item.status)}
        </span>
      </div>
      <p className="mt-2 text-xs text-slate-500">
        {item.appointmentTime
          ? formatDateTimeVi(item.appointmentTime)
          : item.enqueuedAt
            ? `Check-in ${shortTime(item.enqueuedAt)}`
            : "Chưa có thời gian"}
      </p>
    </div>
  )
}

function AttentionItem({
  icon: Icon,
  title,
  description,
  urgent,
}: {
  icon: ComponentType<{ className?: string }>
  title: string
  description: string
  urgent?: boolean
}) {
  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        urgent
          ? "border-amber-200 bg-amber-50 text-amber-950"
          : "border-slate-200 bg-slate-50 text-slate-700"
      )}
    >
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4" />
        <p className="text-sm font-semibold">{title}</p>
      </div>
      <p className="mt-2 text-xs leading-5 opacity-80">{description}</p>
    </div>
  )
}

function EmptyLine({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
      {text}
    </div>
  )
}
