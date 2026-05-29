"use client"

import { useListenQueue } from "@/shared/queue/queue-stub"
import { formatDateVi } from "@/shared/lib/format/date"

export default function DoctorPatientsPage() {
  const queue = useListenQueue()

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Bệnh nhân đang chờ</h1>
        <p className="mt-2 text-slate-600">
          Dùng hook <code className="rounded bg-slate-100 px-1 text-sm">useListenQueue()</code>{" "}
          (stub). Lễ tân check-in ở <strong>/reception/checkin</strong> — dữ liệu lưu{" "}
          <code className="rounded bg-slate-100 px-1 text-sm">localStorage</code>, tab Bác sĩ
          cập nhật qua sự kiện <code className="rounded bg-slate-100 px-1 text-sm">storage</code>.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {queue.length === 0 ? (
          <p className="text-sm text-slate-500">
            Chưa có bệnh nhân trong hàng đợi. Mở tab Lễ tân → Check-in để thử.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {queue.map((q) => (
              <li
                key={q.id}
                className="flex flex-col gap-1 border-b border-slate-50 py-3 text-sm last:border-0 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-slate-800">{q.patientName}</span>
                  <span className="text-medical-primary">#{q.medicalHistoryNumber}</span>
                  {q.source === "WALK_IN" ? (
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-900">
                      Vãng lai
                    </span>
                  ) : q.source === "REGISTERED" ? (
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase text-emerald-800">
                      Hồ sơ
                    </span>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-x-3 text-xs text-slate-400">
                  <span>{formatDateVi(q.enqueuedAt)}</span>
                  {q.patientId != null ? <span>patient_id: {q.patientId}</span> : null}
                  {q.appointmentId != null ? (
                    <span>appointment_id: {q.appointmentId}</span>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
