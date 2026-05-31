import { apiFetch } from "@/shared/lib/api-client"

export interface SendEmailRequest {
  to: string
  subject: string
  content: string
  type?: "APPOINTMENT" | "INVOICE" | "NOTIFICATION"
}

export const emailService = {
  async send(data: SendEmailRequest): Promise<{ success: boolean; message: string }> {
    const res = await apiFetch("/api/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error("Failed to send email")
    return res.json()
  },

  async sendAppointmentConfirmation(to: string, patientName: string, date: string, doctorName: string) {
    return emailService.send({
      to,
      subject: `Xác nhận lịch hẹn - ${date}`,
      content: `Kính gửi ${patientName}, lịch hẹn của bạn với ${doctorName} vào ${date} đã được xác nhận.`,
      type: "APPOINTMENT",
    })
  },

  async sendInvoice(to: string, patientName: string, invoiceId: number, totalPrice: number) {
    return emailService.send({
      to,
      subject: `Hóa đơn #${invoiceId} - Phòng khám EMR`,
      content: `Kính gửi ${patientName}, hóa đơn #${invoiceId} với tổng tiền ${totalPrice.toLocaleString("vi-VN")}đ đã được thanh toán thành công.`,
      type: "INVOICE",
    })
  },
}
