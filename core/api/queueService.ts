import { apiFetch } from "@/shared/lib/api-client"

export interface QueueItem {
  id: number
  patientId: number | null
  patientName: string
  medicalHistoryNumber: string
  appointmentId: number | null
  source: "REGISTERED" | "WALK_IN" | "APPOINTMENT"
  status: string
  position?: number
  doctorId?: number | null
  doctorName?: string
  appointmentTime?: string
  reason?: string
  enqueuedAt: string
}

export interface PushToQueuePayload {
  patientName: string
  medicalHistoryNumber: string
  patientId?: number | null
  appointmentId?: number | null
  source?: "REGISTERED" | "WALK_IN"
}

export interface PushToQueuePayload {
  patientName: string
  medicalHistoryNumber: string
  patientId?: number | null
  appointmentId?: number | null
  source?: "REGISTERED" | "WALK_IN"
}

export const queueService = {
  async getQueue(doctorId?: number | null): Promise<QueueItem[]> {
    const query = doctorId ? `?doctorId=${doctorId}` : ""
    const res = await apiFetch(`/api/queue${query}`)
    if (!res.ok) throw new Error("Failed to fetch queue")
    const raw = await res.json()
    return raw.map(mapQueueItem)
  },

  async enqueue(data: PushToQueuePayload): Promise<QueueItem> {
    const res = await apiFetch("/api/queue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientName: data.patientName,
        medicalHistoryNumber: data.medicalHistoryNumber,
        patientId: data.patientId ?? 0,
        appointmentId: data.appointmentId ?? 0,
        source: data.source ?? (data.patientId ? "REGISTERED" : "WALK_IN"),
      }),
    })
    if (!res.ok) throw new Error("Failed to enqueue patient")
    const raw = await res.json()
    return mapQueueItem(raw)
  },

  async updatePatientId(queueId: number, patientId: number): Promise<void> {
    const res = await apiFetch(`/api/queue/${queueId}/patient`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patientId }),
    })
    if (!res.ok) throw new Error("Failed to update patient ID")
  },

  async call(queueId: number): Promise<QueueItem> {
    const res = await apiFetch(`/api/queue/${queueId}/call`, { method: "POST" })
    if (!res.ok) throw new Error("Failed to call queue item")
    const raw = await res.json()
    return mapQueueItem(raw)
  },

  async start(queueId: number): Promise<QueueItem> {
    const res = await apiFetch(`/api/queue/${queueId}/start`, { method: "POST" })
    if (!res.ok) throw new Error("Failed to start queue item")
    const raw = await res.json()
    return mapQueueItem(raw)
  },

  async remove(queueId: number): Promise<void> {
    const res = await apiFetch(`/api/queue/${queueId}`, { method: "DELETE" })
    if (!res.ok) throw new Error("Failed to remove from queue")
  },
}

function normalizeDate(dateStr: string | undefined | null): string {
  if (!dateStr) return ""
  let s = dateStr.trim()
  if (!s.includes("T")) s = s.replace(" ", "T")
  if (!s.endsWith("Z") && !s.includes("+")) s = s + "Z"
  return s
}

function mapQueueItem(item: any): QueueItem {
  return {
    ...item,
    enqueuedAt: normalizeDate(item.enqueuedAt),
    appointmentTime: item.appointmentTime ? normalizeDate(item.appointmentTime) : undefined,
  }
}
