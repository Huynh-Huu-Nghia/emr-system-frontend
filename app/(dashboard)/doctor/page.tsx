"use client"

import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Stethoscope, Clock, UserCheck, BellRing, Volume2, VolumeX, Users, Activity, CheckCircle2 } from "lucide-react"
import { useListenQueue, useStartQueueMutation, useCallQueueMutation, type QueuePatientStub } from "@/shared/queue/queue-stub"
import { useAppointmentsQuery } from "@/modules/appointment/hooks/use-appointments-query"
import { formatDateVi } from "@/shared/lib/format/date"
import { ROUTES } from "@/constants/routes"
import { cn } from "@/lib/utils"
import { useEffect, useState, useRef } from "react"

function WaitTimeAlert({ enqueuedAt }: { enqueuedAt: string }) {
  const [mins, setMins] = useState(0)
  
  useEffect(() => {
    const calc = () => {
      const diff = Date.now() - new Date(enqueuedAt).getTime()
      setMins(Math.floor(diff / 60000))
    }
    calc()
    const int = setInterval(calc, 60000)
    return () => clearInterval(int)
  }, [enqueuedAt])

  if (mins < 30) {
    return <span className="text-slate-400">Đã chờ {mins} phút</span>
  }
  return <span className="text-red-500 font-semibold animate-pulse">⏳ Chờ lâu ({mins} phút)</span>
}

export default function DoctorDashboardPage() {
  const queue = useListenQueue()
  const startQueue = useStartQueueMutation()
  const callQueue = useCallQueueMutation()
  const { data: appointments = [] } = useAppointmentsQuery()
  const router = useRouter()

  const [soundEnabled, setSoundEnabled] = useState(false)
  const prevQueueLength = useRef(0)

  useEffect(() => {
    const saved = localStorage.getItem("doctor_sound_enabled")
    if (saved === "true") setSoundEnabled(true)
  }, [])

  const toggleSound = () => {
    const newVal = !soundEnabled
    setSoundEnabled(newVal)
    localStorage.setItem("doctor_sound_enabled", String(newVal))
  }

  useEffect(() => {
    if (soundEnabled && queue.length > prevQueueLength.current) {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
        const oscillator = audioCtx.createOscillator()
        const gainNode = audioCtx.createGain()
        oscillator.connect(gainNode)
        gainNode.connect(audioCtx.destination)
        oscillator.type = "sine"
        oscillator.frequency.value = 880 // A5
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime)
        oscillator.start()
        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.5)
        oscillator.stop(audioCtx.currentTime + 0.5)
      } catch (e) {
        console.error("Audio play failed", e)
      }
    }
    prevQueueLength.current = queue.length
  }, [queue.length, soundEnabled])

  const todayCompleted = appointments.filter(a => {
    if (a.status !== "COMPLETED") return false
    const d = new Date(a.starts_at)
    const today = new Date()
    return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate()
  }).length

  const handleCallPatient = async (patient: QueuePatientStub) => {
    await callQueue.mutateAsync(patient.id)
  }

  const handleStartExam = async (patient: QueuePatientStub) => {
    if (patient.status !== "IN_PROGRESS") {
      await startQueue.mutateAsync(patient.id)
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
        title="Phòng khám"
        description="Danh sách bệnh nhân đang chờ khám"
      >
        <div className="flex items-center gap-4 text-sm text-slate-500">
          <Button variant="ghost" size="sm" onClick={toggleSound} className={soundEnabled ? "text-medical-primary" : "text-slate-400"}>
            {soundEnabled ? <Volume2 className="h-4 w-4 mr-2" /> : <VolumeX className="h-4 w-4 mr-2" />}
            {soundEnabled ? "Đã bật âm thanh" : "Tắt âm thanh"}
          </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Đang chờ khám</p>
            <p className="text-2xl font-bold text-slate-800">{queue.filter(q => q.status === "WAITING").length}</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Đang thao tác</p>
            <p className="text-2xl font-bold text-slate-800">{queue.filter(q => q.status === "IN_PROGRESS" || q.status === "CALLED").length}</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Đã khám hôm nay</p>
            <p className="text-2xl font-bold text-slate-800">{todayCompleted}</p>
          </div>
        </div>
      </div>

      {queue.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-slate-200 bg-white py-16 shadow-sm">
          <UserCheck className="h-16 w-16 text-slate-200" />
          <p className="text-sm text-slate-500">Chưa có bệnh nhân trong hàng đợi</p>
          <p className="text-xs text-slate-400">Lễ tân check-in bệnh nhân tại /reception/checkin</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {queue.map((patient, idx) => (
            <div
              key={patient.id}
              className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-lg font-semibold text-slate-800">{patient.patientName}</p>
                  <p className="text-sm text-medical-primary">#{patient.medicalHistoryNumber}</p>
                </div>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-medical-light text-sm font-bold text-medical-primary">
                  {idx + 1}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 text-xs">
                {patient.source === "WALK_IN" ? (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-700">Vãng lai</span>
                ) : (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-medium text-emerald-700">Có hồ sơ</span>
                )}
                {patient.status === "IN_PROGRESS" && (
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 font-medium text-blue-700 animate-pulse">Đang khám</span>
                )}
                <WaitTimeAlert enqueuedAt={patient.enqueuedAt} />
              </div>

              {patient.reason && (
                <div className="text-sm text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <span className="font-semibold text-slate-700">Lý do khám:</span> {patient.reason}
                </div>
              )}

              {patient.status === "WAITING" && (
                <Button
                  disabled={callQueue.isPending}
                  onClick={() => void handleCallPatient(patient)}
                  variant="outline"
                  className="mt-auto h-10 w-full rounded-xl border-medical-primary text-medical-primary hover:bg-medical-primary/10 transition-all"
                >
                  <BellRing className="mr-2 h-4 w-4" />
                  Gọi bệnh nhân
                </Button>
              )}

              {(patient.status === "CALLED" || patient.status === "IN_PROGRESS") && (
                <Button
                  disabled={startQueue.isPending}
                  onClick={() => void handleStartExam(patient)}
                  className={cn(
                    "mt-auto h-10 w-full rounded-xl text-white shadow-sm transition-all",
                    patient.status === "IN_PROGRESS"
                      ? "bg-amber-500 hover:bg-amber-600"
                      : "bg-medical-primary hover:bg-medical-dark"
                  )}
                >
                  <Stethoscope className="mr-2 h-4 w-4" />
                  {patient.status === "IN_PROGRESS" ? "Tiếp tục khám" : "Bắt đầu khám"}
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
