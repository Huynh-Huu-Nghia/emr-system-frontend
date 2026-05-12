"use client"

import { useSyncExternalStore } from "react"

/** Queue item — Người B thay thế bằng Supabase / WebSocket payload thật. */
export type QueuePatientStub = {
  id: string
  patientName: string
  medicalHistoryNumber: string
  enqueuedAt: string
}

const MOCK_QUEUE_KEY = "__emr_mock_queue__"

function readQueue(): QueuePatientStub[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(MOCK_QUEUE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as QueuePatientStub[]
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

/**
 * Đẩy bệnh nhân vào hàng đợi (stub). Người B: thay bằng Supabase insert / channel publish.
 */
export async function pushToQueue(payload: {
  patientName: string
  medicalHistoryNumber: string
}): Promise<QueuePatientStub> {
  await new Promise((r) => setTimeout(r, 250))
  const item: QueuePatientStub = {
    id: `q_${Date.now()}`,
    patientName: payload.patientName,
    medicalHistoryNumber: payload.medicalHistoryNumber,
    enqueuedAt: new Date().toISOString(),
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
