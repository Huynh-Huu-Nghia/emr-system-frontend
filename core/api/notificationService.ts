import { apiFetch } from "@/shared/lib/api-client"

export interface Notification {
  id: number
  userId: number
  type: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
}

export const notificationService = {
  async getByUser(userId: number): Promise<Notification[]> {
    const res = await apiFetch(`/api/notifications?userId=${userId}`)
    if (!res.ok) throw new Error("Failed to fetch notifications")
    return res.json()
  },

  async create(data: { userId: number; type: string; title: string; message: string }): Promise<{ id: number }> {
    const res = await apiFetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error("Failed to create notification")
    return res.json()
  },

  async markRead(id: number): Promise<void> {
    const res = await apiFetch(`/api/notifications/${id}`, { method: "PUT" })
    if (!res.ok) throw new Error("Failed to mark notification as read")
  },

  async markAllRead(userId: number): Promise<void> {
    const res = await apiFetch(`/api/notifications/read-all?userId=${userId}`, { method: "POST" })
    if (!res.ok) throw new Error("Failed to mark all as read")
  },
}
