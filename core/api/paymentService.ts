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

// Backend chưa có endpoint /api/payments — dùng mock tạm, sẽ ráp API thật sau
const MOCK_PAYMENTS: PaymentRecord[] = [
  {
    id: 1,
    prescriptionId: 101,
    patientName: "Nguyễn Thị Mai",
    doctorName: "BS. Trần Văn Khám",
    totalPrice: 185000,
    status: "UNPAID",
    createdAt: "2025-06-01T10:30:00Z",
    items: [
      { medicineName: "Paracetamol 500mg", quantity: 20, unitPrice: 2000, subtotal: 40000 },
      { medicineName: "Amoxicillin 250mg", quantity: 30, unitPrice: 3500, subtotal: 105000 },
      { medicineName: "Vitamin C 1000mg", quantity: 5, unitPrice: 8000, subtotal: 40000 },
    ],
  },
  {
    id: 2,
    prescriptionId: 102,
    patientName: "Trần Văn Đức",
    doctorName: "BS. Nguyễn Thị Nhi",
    totalPrice: 75000,
    status: "PAID",
    createdAt: "2025-05-28T14:00:00Z",
    paidAt: "2025-05-28T14:15:00Z",
    items: [
      { medicineName: "Omeprazole 20mg", quantity: 10, unitPrice: 5000, subtotal: 50000 },
      { medicineName: "Dầu gió xanh", quantity: 1, unitPrice: 25000, subtotal: 25000 },
    ],
  },
  {
    id: 3,
    prescriptionId: 103,
    patientName: "Lê Hoàng Yến",
    doctorName: "BS. Trần Văn Khám",
    totalPrice: 56000,
    status: "UNPAID",
    createdAt: "2025-06-01T11:00:00Z",
    items: [
      { medicineName: "Cetirizine 10mg", quantity: 14, unitPrice: 1500, subtotal: 21000 },
      { medicineName: "Paracetamol 500mg", quantity: 10, unitPrice: 2000, subtotal: 20000 },
      { medicineName: "Vitamin C 1000mg", quantity: 2, unitPrice: 8000, subtotal: 16000 },
    ],
  },
]

export const paymentService = {
  async getAll(): Promise<PaymentRecord[]> {
    // TODO: Replace with apiFetch("/api/payments") when BE is ready
    return Promise.resolve(MOCK_PAYMENTS.map((p) => ({ ...p, items: [...p.items] })))
  },

  async getById(id: number): Promise<PaymentRecord> {
    const p = MOCK_PAYMENTS.find((x) => x.id === id)
    if (!p) throw new Error("Payment not found")
    return Promise.resolve({ ...p, items: [...p.items] })
  },

  async confirmPayment(id: number): Promise<PaymentRecord> {
    // TODO: Replace with apiFetch(`/api/payments/${id}/confirm`, { method: "POST" })
    const idx = MOCK_PAYMENTS.findIndex((p) => p.id === id)
    if (idx === -1) throw new Error("Payment not found")
    MOCK_PAYMENTS[idx] = {
      ...MOCK_PAYMENTS[idx],
      status: "PAID",
      paidAt: new Date().toISOString(),
    }
    return { ...MOCK_PAYMENTS[idx], items: [...MOCK_PAYMENTS[idx].items] }
  },
}
