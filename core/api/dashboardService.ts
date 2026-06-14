import { apiFetch } from "@/shared/lib/api-client"

export interface TopMedicine {
  name: string
  unit: string
  quantity: number
}

export interface TopDoctor {
  name: string
  appointments: number
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
  topDoctors: TopDoctor[]
}

export interface AuditLogEntry {
  id: number
  action: string
  actor: string
  target: string
  timestamp: string
}

export const dashboardService = {
  async getStats(timeframe: string = "today", startDate?: string, endDate?: string): Promise<DashboardStats> {
    let url = `/api/dashboard?timeframe=${timeframe}`
    if (timeframe === "custom" && startDate && endDate) {
      url += `&startDate=${startDate}&endDate=${endDate}`
    }
    const res = await apiFetch(url)
    if (!res.ok) throw new Error("Failed to fetch dashboard stats")
    const data = await res.json()
    return {
      ...data,
      unpaidInvoices: data.unpaidInvoices ?? 0,
      topMedicines: data.topMedicines ?? [],
      topDoctors: data.topDoctors ?? [],
    }
  },

  async getAuditLog(timeframe: string = "all", startDate?: string, endDate?: string): Promise<AuditLogEntry[]> {
    let url = `/api/audit-log?timeframe=${timeframe}`
    if (timeframe === "custom" && startDate && endDate) {
      url += `&startDate=${startDate}&endDate=${endDate}`
    }
    const res = await apiFetch(url)
    if (!res.ok) throw new Error("Failed to fetch audit log")
    return res.json()
  },
}
