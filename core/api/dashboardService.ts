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
    // Backend chưa có endpoint audit log — trả mock tạm
    return [
      { id: 1, action: "LOGIN", actor: "admin", target: "system", timestamp: "2025-06-01T08:00:00Z" },
      { id: 2, action: "CREATE_PATIENT", actor: "letan_le", target: "Nguyễn Thị Mai", timestamp: "2025-06-01T08:30:00Z" },
      { id: 3, action: "CREATE_APPOINTMENT", actor: "letan_le", target: "Nguyễn Thị Mai", timestamp: "2025-06-01T08:35:00Z" },
      { id: 4, action: "COMPLETE_EXAM", actor: "bacsi_tran", target: "Nguyễn Thị Mai", timestamp: "2025-06-01T09:30:00Z" },
      { id: 5, action: "CONFIRM_PAYMENT", actor: "letan_pham", target: "Hóa đơn #102", timestamp: "2025-05-28T14:15:00Z" },
      { id: 6, action: "UPDATE_STOCK", actor: "admin", target: "Paracetamol 500mg", timestamp: "2025-05-27T16:00:00Z" },
      { id: 7, action: "LOCK_USER", actor: "admin", target: "bacsi_nguyen", timestamp: "2025-05-25T11:00:00Z" },
      { id: 8, action: "CREATE_DOCTOR", actor: "admin", target: "BS. Lê Hoàng Răng", timestamp: "2025-03-10T10:00:00Z" },
    ]
  },
}
