"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { paymentService, type PaymentRecord } from "@/core/api/paymentService"
import { LoadingBlock } from "@/shared/components/states/loading-block"
import { ErrorState } from "@/shared/components/states/error-state"

export default function PrintInvoicePage() {
  const params = useParams()
  const id = Number(params.id)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [payment, setPayment] = useState<PaymentRecord | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const pay = await paymentService.getById(id)
        setPayment(pay)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to load data"))
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id])

  useEffect(() => {
    if (!loading && !error && payment) {
      // Add a small delay to ensure rendering is complete before print dialog opens
      const timer = setTimeout(() => {
        window.print()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [loading, error, payment])

  if (loading) return <LoadingBlock />
  if (error) return <ErrorState description={error.message} onRetry={() => window.location.reload()} />
  if (!payment) return <ErrorState description="Không tìm thấy hóa đơn" />

  return (
    <div className="mx-auto max-w-3xl p-8 bg-white text-black print:p-0">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b-2 border-black pb-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-white font-bold text-2xl print:bg-black print:text-white print:border print:border-black" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
            EC
          </div>
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-tight">Electronic Clinic</h1>
            <p className="text-sm text-slate-600 print:text-black">123 Đường Sức Khỏe, Quận Y Tế, TP. HCM</p>
            <p className="text-sm text-slate-600 print:text-black">Điện thoại: 1900 1234</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold uppercase tracking-widest text-slate-400 print:text-black">Biên Lai Thu Tiền</h2>
          <p className="font-mono text-sm font-semibold mt-1">Mã Hóa Đơn: {payment.paymentCode}</p>
        </div>
      </div>

      {/* PATIENT INFO */}
      <div className="mb-8 grid grid-cols-2 gap-x-12 gap-y-2 text-sm">
        <div className="col-span-2">
          <span className="font-semibold w-32 inline-block">Bệnh nhân:</span>
          <span className="text-base uppercase font-bold">{payment.patientName || "—"}</span>
        </div>
        <div className="col-span-2">
          <span className="font-semibold w-32 inline-block">Bác sĩ khám:</span>
          <span className="font-medium text-base">{payment.doctorName || "—"}</span>
        </div>
        <div className="col-span-2">
          <span className="font-semibold w-32 inline-block">Ngày thanh toán:</span>
          <span>{payment.paidAt ? new Date(payment.paidAt).toLocaleString("vi-VN") : "Chưa thanh toán"}</span>
        </div>
      </div>

      {/* ITEMS LIST */}
      <div className="mb-12 min-h-[300px]">
        <h3 className="font-bold text-lg mb-4 border-b border-dashed border-slate-300 pb-2 print:border-black">Chi Tiết Dịch Vụ / Thuốc</h3>
        
        {(!payment.items || payment.items.length === 0) ? (
          <p className="italic text-slate-500 print:text-black">Không có danh mục nào được thanh toán.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black">
                <th className="py-2 px-1 text-left font-bold w-12">STT</th>
                <th className="py-2 px-1 text-left font-bold">Nội Dung</th>
                <th className="py-2 px-1 text-center font-bold w-20">SL</th>
                <th className="py-2 px-1 text-right font-bold w-32">Đơn Giá</th>
                <th className="py-2 px-1 text-right font-bold w-32">Thành Tiền</th>
              </tr>
            </thead>
            <tbody>
              {payment.items.map((item, index) => (
                <tr key={index} className="border-b border-dashed border-slate-200 print:border-slate-400">
                  <td className="py-3 px-1 font-mono text-slate-500 print:text-black">{String(index + 1).padStart(2, '0')}</td>
                  <td className="py-3 px-1 font-bold">{item.medicineName}</td>
                  <td className="py-3 px-1 text-center font-bold text-base">{item.quantity}</td>
                  <td className="py-3 px-1 text-right">{Number(item.unitPrice).toLocaleString("vi-VN")}đ</td>
                  <td className="py-3 px-1 text-right font-semibold">{Number(item.subtotal).toLocaleString("vi-VN")}đ</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="mt-8 flex justify-end">
          <div className="w-64 space-y-2 text-right">
            <div className="flex justify-between border-b border-slate-200 pb-2 print:border-black">
              <span className="font-medium text-slate-500 print:text-black">Tổng cộng:</span>
              <span className="font-bold">{Number(payment.totalPrice).toLocaleString("vi-VN")}đ</span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="font-bold text-base">Thanh toán:</span>
              <span className="font-bold text-xl">{Number(payment.totalPrice).toLocaleString("vi-VN")}đ</span>
            </div>
            {payment.status === "PAID" && (
              <div className="mt-4 inline-block border-2 border-emerald-500 text-emerald-600 font-bold px-4 py-1 rounded-full uppercase tracking-widest text-xs print:border-black print:text-black" style={{ transform: 'rotate(-5deg)' }}>
                ĐÃ THANH TOÁN
              </div>
            )}
             {payment.status === "CANCELLED" && (
              <div className="mt-4 inline-block border-2 border-red-500 text-red-600 font-bold px-4 py-1 rounded-full uppercase tracking-widest text-xs print:border-black print:text-black" style={{ transform: 'rotate(-5deg)' }}>
                ĐÃ HỦY
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FOOTER & SIGNATURE */}
      <div className="flex justify-between items-start mt-16 text-sm">
        <div className="w-1/2">
          <p className="italic text-slate-500 print:text-black">
            Cảm ơn quý khách đã sử dụng dịch vụ.
          </p>
        </div>
        <div className="w-1/2 text-center">
          <p className="mb-1">Ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}</p>
          <p className="font-bold uppercase tracking-wider">Người thu tiền</p>
          <div className="h-24"></div> {/* Khoảng trống cho chữ ký */}
          <p className="font-semibold text-slate-400 print:text-black">(Ký và ghi rõ họ tên)</p>
        </div>
      </div>

      {/* Tắt nút Print thủ công đi khi in */}
      <div className="mt-12 text-center print:hidden">
        <button 
          onClick={() => window.print()}
          className="px-6 py-2 bg-slate-900 text-white rounded-lg shadow font-medium hover:bg-slate-800 transition-colors"
        >
          In Biên Lai Lại
        </button>
      </div>
    </div>
  )
}
