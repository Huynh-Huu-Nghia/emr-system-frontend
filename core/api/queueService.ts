import { apiFetch } from "@/shared/lib/api-client"

export interface QueueItem {
  id: number
  patientId: number | null
  patientName: string
  medicalHistoryNumber: string
  appointmentId: number | null
  source: "REGISTERED" | "WALK_IN"
  status: string
  enqueuedAt: string
}

export interface PushToQueuePayload {
  patientName: string
  medicalHistoryNumber: string
  patientId?: number | null
  appointmentId?: number | null
  source?: "REGISTERED" | "WALK_IN"
}

export const queueService = {
  async getQueue(): Promise<QueueItem[]> {
    const res = await apiFetch("/api/queue")
    if (!res.ok) throw new Error("Failed to fetch queue")
    return res.json()
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
    return res.json()
  },

  async updatePatientId(queueId: number, patientId: number): Promise<void> {
    const res = await apiFetch(`/api/queue/${queueId}/patient`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patientId }),
    })
    if (!res.ok) throw new Error("Failed to update patient ID")
  },

  async remove(queueId: number): Promise<void> {
    const res = await apiFetch(`/api/queue/${queueId}`, { method: "DELETE" })
    if (!res.ok) throw new Error("Failed to remove from queue")
  },
}
