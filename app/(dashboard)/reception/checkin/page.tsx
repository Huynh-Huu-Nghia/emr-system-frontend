"use client"

import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { pushToQueue, useListenQueue } from "@/shared/queue/queue-stub"
import { formatDateVi } from "@/shared/lib/format/date"

export default function ReceptionCheckinPage() {
  const queue = useListenQueue()
  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)

  const handleCheckIn = async () => {
    const n = name.trim()
    const c = code.trim()
    if (!n || !c) {
      toast.error("Nhập tên và mã hồ sơ (mock)")
      return
    }
    setLoading(true)
    try {
      await pushToQueue({ patientName: n, medicalHistoryNumber: c })
      toast.success("Đã đưa vào hàng đợi (mock)")
      setName("")
      setCode("")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Tiếp đón & Check-in</h1>
        <p className="mt-2 text-slate-600">
          Mock: đẩy bệnh nhân vào hàng đợi qua <code className="rounded bg-slate-100 px-1 text-sm">pushToQueue</code>
          . Người B nối Supabase Realtime sau.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">
          Check-in nhanh
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-slate-500">Họ tên</label>
            <Input
              className="mt-1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nguyễn Văn A"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">Mã hồ sơ</label>
            <Input
              className="mt-1"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="BN001"
            />
          </div>
        </div>
        <Button
          className="mt-6 rounded-full bg-medical-primary hover:bg-medical-dark"
          loading={loading}
          onClick={() => void handleCheckIn()}
        >
          Cho vào hàng đợi
        </Button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">
          Hàng đợi hiện tại (stub)
        </h2>
        {queue.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">Chưa có ca nào trong hàng đợi.</p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-100">
            {queue.map((q) => (
              <li key={q.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <span className="font-medium text-slate-800">{q.patientName}</span>
                <span className="text-medical-primary">#{q.medicalHistoryNumber}</span>
                <span className="text-xs text-slate-400">
                  {formatDateVi(q.enqueuedAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
