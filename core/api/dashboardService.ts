import { apiFetch } from "@/shared/lib/api-client"

export interface TopMedicine {
  name: string
  unit: string
  quantity: number
}

export interface DashboardStats {
  totalUsers: number
  totalDoctors: number
  totalPatients: number
  newPatients: number
  periodAppointments: number
  completedAppointments: number
  revenue: number
  periodRevenue: number
  monthlyRevenue: number[]
  unpaidInvoices: number
  topMedicines: TopMedicine[]
}

export interface AuditLogEntry {
  id: number
  action: string
  actor: string
  target: string
  timestamp: string
}

export const dashboardService = {
  async getStats(timeframe: string = "today"): Promise<DashboardStats> {
    const res = await apiFetch(`/api/dashboard?timeframe=${timeframe}`)
    if (!res.ok) throw new Error("Failed to fetch dashboard stats")
    const data = await res.json()
    return {
      ...data,
      unpaidInvoices: data.unpaidInvoices ?? 0,
      topMedicines: data.topMedicines ?? [],
    }
  },

  async getAuditLog(timeframe: string = "all"): Promise<AuditLogEntry[]> {
    const res = await apiFetch(`/api/audit-log?timeframe=${timeframe}`)
    if (!res.ok) throw new Error("Failed to fetch audit log")
    return res.json()
  },
}
