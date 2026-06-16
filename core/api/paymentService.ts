import { apiFetch } from "@/shared/lib/api-client"

export interface PaymentRecord {
  rowKey: string
  id: number
  prescriptionId: number
  patientName: string
  doctorName: string
  totalPrice: number
  status: "UNPAID" | "PAID" | "CANCELLED"
  createdAt: string
  paidAt?: string
  items: PaymentItem[]
  paymentCode: string
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
    const raw = await res.json()
    return (raw as Array<Record<string, unknown>>).map(mapPayment)
  },

  async getById(id: number): Promise<PaymentRecord> {
    const res = await apiFetch("/api/payments")
    if (!res.ok) throw new Error("Failed to fetch payments")
    const all: PaymentRecord[] = ((await res.json()) as Array<Record<string, unknown>>).map(mapPayment)
    const p = all.find((x) => x.id === id)
    if (!p) throw new Error("Payment not found")
    return p
  },

  async confirmPayment(id: number): Promise<{ status: string }> {
    const res = await apiFetch(`/api/payments/${id}/confirm`, { method: "POST" })
    if (!res.ok) throw new Error("Failed to confirm payment")
    return res.json()
  },

  async cancelPayment(id: number): Promise<{ status: string }> {
    const res = await apiFetch(`/api/payments/${id}/cancel`, { method: "PUT" })
    if (!res.ok) throw new Error("Failed to cancel payment")
    return res.json()
  },
}

function mapPayment(raw: Record<string, unknown>, index: number): PaymentRecord {
  const backendStatus = String(raw.status ?? "")
  const id = raw.id as number
  const prescriptionId = raw.prescriptionId as number
  return {
    rowKey: `${id || "payment"}-${prescriptionId || "prescription"}-${index}`,
    id,
    prescriptionId,
    patientName: String(raw.patientName ?? "N/A"),
    doctorName: String(raw.doctorName ?? "N/A"),
    totalPrice: Number(raw.amount ?? raw.totalPrice ?? 0),
    status: backendStatus === "CONFIRMED" ? "PAID" : backendStatus === "CANCELLED" ? "CANCELLED" : "UNPAID",
    createdAt: normalizeDate(String(raw.createdAt || "")),
    paidAt: raw.paidAt ? normalizeDate(String(raw.paidAt)) : undefined,
    items: (raw.items as PaymentItem[]) || [],
    paymentCode: `HD${String(prescriptionId).padStart(3, "0")}`,
  }
}

function normalizeDate(dateStr: string): string {
  if (!dateStr) return dateStr
  let s = dateStr.trim()
  if (!s.includes("T")) s = s.replace(" ", "T")
  if (!s.endsWith("Z") && !s.includes("+")) s = s + "Z"
  return s
}
