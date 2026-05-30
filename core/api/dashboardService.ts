import { apiFetch } from "@/shared/lib/api-client"

export interface DashboardStats {
  totalUsers: number
  totalDoctors: number
  totalPatients: number
  todayAppointments: number
  revenue: number
  unpaidInvoices: number
}

export interface AuditLogEntry {
  id: number
  action: string
  actor: string
  target: string
  timestamp: string
}

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const res = await apiFetch("/api/dashboard")
    if (!res.ok) throw new Error("Failed to fetch dashboard stats")
    const data = await res.json()
    return {
      ...data,
      unpaidInvoices: data.unpaidInvoices ?? 0,
    }
  },

  async getAuditLog(): Promise<AuditLogEntry[]> {
    const res = await apiFetch("/api/audit-log")
    if (!res.ok) throw new Error("Failed to fetch audit log")
    return res.json()
  },
}
