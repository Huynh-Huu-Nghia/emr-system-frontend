import { apiFetch } from "@/shared/lib/api-client"

export interface PaymentRecord {
  id: number
  prescriptionId: number
  patientName: string
  doctorName: string
  totalPrice: number
  status: "UNPAID" | "PAID"
  createdAt: string
  paidAt?: string
  items: PaymentItem[]
}

export interface PaymentItem {
  medicineName: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export const paymentService = {
  async getAll(): Promise<PaymentRecord[]> {
    const res = await apiFetch("/api/payments")
    if (!res.ok) throw new Error("Failed to fetch payments")
    return res.json()
  },

  async getById(id: number): Promise<PaymentRecord> {
    const res = await apiFetch("/api/payments")
    if (!res.ok) throw new Error("Failed to fetch payments")
    const all: PaymentRecord[] = await res.json()
    const p = all.find((x) => x.id === id)
    if (!p) throw new Error("Payment not found")
    return p
  },

  async confirmPayment(id: number): Promise<{ status: string }> {
    const res = await apiFetch(`/api/payments/${id}/confirm`, { method: "POST" })
    if (!res.ok) throw new Error("Failed to confirm payment")
    return res.json()
  },
}
