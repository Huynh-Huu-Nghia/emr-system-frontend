"use client"

import { useSyncExternalStore } from "react"

/** Queue item — thay bằng Supabase / WebSocket payload thật khi có BE. */
export type QueuePatientStub = {
  id: string
  patientName: string
  medicalHistoryNumber: string
  enqueuedAt: string
  /** ID bệnh nhân trong DB — optional cho bản ghi cũ / vãng lai */
  patientId?: number | null
  /** Liên kết lịch hẹn khi check-in theo lịch */
  appointmentId?: number | null
  /** Nguồn check-in — giúp BE xử lý khác nhau */
  source?: "REGISTERED" | "WALK_IN"
}

const MOCK_QUEUE_KEY = "__emr_mock_queue__"

function normalizeQueueItem(raw: unknown): QueuePatientStub | null {
  if (!raw || typeof raw !== "object") return null
  const o = raw as Record<string, unknown>
  const id = typeof o.id === "string" ? o.id : null
  const patientName = typeof o.patientName === "string" ? o.patientName : ""
  const medicalHistoryNumber =
    typeof o.medicalHistoryNumber === "string" ? o.medicalHistoryNumber : ""
  const enqueuedAt =
    typeof o.enqueuedAt === "string" ? o.enqueuedAt : new Date().toISOString()
  if (!id || !patientName || !medicalHistoryNumber) return null
  const patientId =
    typeof o.patientId === "number"
      ? o.patientId
      : o.patientId === null
        ? null
        : undefined
  const appointmentId =
    typeof o.appointmentId === "number"
      ? o.appointmentId
      : o.appointmentId === null
        ? null
        : undefined
  const source =
    o.source === "REGISTERED" || o.source === "WALK_IN" ? o.source : undefined
  return {
    id,
    patientName,
    medicalHistoryNumber,
    enqueuedAt,
    patientId,
    appointmentId,
    source,
  }
}

function readQueue(): QueuePatientStub[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(MOCK_QUEUE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed
      .map(normalizeQueueItem)
      .filter((x): x is QueuePatientStub => x != null)
  } catch {
    return []
  }
}

function writeQueue(items: QueuePatientStub[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(MOCK_QUEUE_KEY, JSON.stringify(items))
}

function subscribeQueue(onStoreChange: () => void) {
  const bump = () => onStoreChange()
  const onStorage = (e: StorageEvent) => {
    if (e.key === MOCK_QUEUE_KEY || e.key === null) bump()
  }
  window.addEventListener("emr:queue-updated", bump)
  window.addEventListener("storage", onStorage)
  return () => {
    window.removeEventListener("emr:queue-updated", bump)
    window.removeEventListener("storage", onStorage)
  }
}

export type PushToQueuePayload = {
  patientName: string
  medicalHistoryNumber: string
  patientId?: number | null
  appointmentId?: number | null
  source?: "REGISTERED" | "WALK_IN"
}

/**
 * Đẩy bệnh nhân vào hàng đợi (stub). Khi có BE: gọi API tương ứng với cùng payload.
 */
export async function pushToQueue(
  payload: PushToQueuePayload
): Promise<QueuePatientStub> {
  await new Promise((r) => setTimeout(r, 250))
  const source: QueuePatientStub["source"] =
    payload.source ??
    (payload.patientId != null && payload.patientId > 0
      ? "REGISTERED"
      : "WALK_IN")
  const item: QueuePatientStub = {
    id: `q_${Date.now()}`,
    patientName: payload.patientName.trim(),
    medicalHistoryNumber: payload.medicalHistoryNumber.trim(),
    enqueuedAt: new Date().toISOString(),
    patientId: payload.patientId ?? null,
    appointmentId: payload.appointmentId ?? null,
    source,
  }
  const next = [...readQueue(), item]
  writeQueue(next)
  window.dispatchEvent(new CustomEvent("emr:queue-updated"))
  return item
}

/**
 * Hook lắng nghe hàng đợi (stub: localStorage + CustomEvent + storage).
 * Người B: thay bằng Supabase Realtime subscription.
 */
export function useListenQueue(): QueuePatientStub[] {
  return useSyncExternalStore(
    subscribeQueue,
    readQueue,
    () => [] as QueuePatientStub[]
  )
}
