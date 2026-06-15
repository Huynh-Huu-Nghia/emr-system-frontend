"use client"

import { useEffect, useState, useMemo, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { paymentService, type PaymentRecord } from "@/core/api/paymentService"
import { LoadingBlock } from "@/shared/components/states/loading-block"
import { ErrorState } from "@/shared/components/states/error-state"

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

function PrintPaymentsReport() {
  const searchParams = useSearchParams()
  const search = searchParams.get("search") || ""
  const dateFrom = searchParams.get("dateFrom") || ""
  const dateTo = searchParams.get("dateTo") || ""
  const sortOrder = (searchParams.get("sortOrder") as "asc" | "desc") || "desc"

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [payments, setPayments] = useState<PaymentRecord[]>([])

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const data = await paymentService.getAll()
        setPayments(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to load payments"))
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      if (search.trim()) {
        const q = search.toLowerCase()
        if (
          !p.patientName.toLowerCase().includes(q) &&
          !p.doctorName.toLowerCase().includes(q) &&
          !String(p.id).includes(q) &&
          !p.paymentCode.toLowerCase().includes(q)
        ) {
          return false
        }
      }
      
      if (dateFrom) {
        const pDate = new Date(p.createdAt).getTime()
        const fDate = new Date(`${dateFrom}T00:00:00`).getTime()
        if (pDate < fDate) return false
      }
      
      if (dateTo) {
        const pDate = new Date(p.createdAt).getTime()
        const tDate = new Date(`${dateTo}T23:59:59.999`).getTime()
        if (pDate > tDate) return false
      }

      return true
    }).sort((a, b) => sortOrder === "asc" ? a.id - b.id : b.id - a.id)
  }, [payments, search, dateFrom, dateTo, sortOrder])

  useEffect(() => {
    if (!loading && !error && payments.length > 0) {
      const timer = setTimeout(() => {
        window.print()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [loading, error, payments])

  if (loading) return <LoadingBlock />
  if (error) return <ErrorState description={error.message} onRetry={() => window.location.reload()} />
  if (payments.length === 0) return <ErrorState description="Không có dữ liệu hóa đơn" />

  let timeText = "Toàn bộ thời gian"
  if (dateFrom && dateTo) {
    timeText = `Từ ngày ${new Date(dateFrom).toLocaleDateString("vi-VN")} đến ngày ${new Date(dateTo).toLocaleDateString("vi-VN")}`
  } else if (dateFrom) {
    timeText = `Từ ngày ${new Date(dateFrom).toLocaleDateString("vi-VN")}`
  } else if (dateTo) {
    timeText = `Đến ngày ${new Date(dateTo).toLocaleDateString("vi-VN")}`
  }

  const totalRevenue = filteredPayments
    .filter(p => p.status === "PAID")
    .reduce((sum, p) => sum + p.totalPrice, 0)
    
  const paidCount = filteredPayments.filter(p => p.status === "PAID").length
  const unpaidCount = filteredPayments.filter(p => p.status === "UNPAID").length
  const cancelledCount = filteredPayments.filter(p => p.status === "CANCELLED").length

  return (
    <div className="mx-auto max-w-4xl p-8 bg-white text-black print:p-0">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b-2 border-black pb-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-white font-bold text-2xl print:bg-black print:text-white print:border print:border-black" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
            EC
          </div>
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-tight">Electronic Clinic</h1>
            <p className="text-sm text-slate-800 print:text-black">123 Đường Sức Khỏe, Quận Y Tế, TP. HCM</p>
            <p className="text-sm text-slate-800 print:text-black">Điện thoại: 1900 1234</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold uppercase tracking-widest text-slate-400 print:text-black">BÁO CÁO HÓA ĐƠN</h2>
          <p className="font-mono text-sm font-semibold mt-1">Kỳ báo cáo: {timeText}</p>
        </div>
      </div>

      <h3 className="text-xl font-bold text-center uppercase mb-6">Danh Sách Hóa Đơn</h3>

      {/* SUMMARY STATS */}
      <div className="mb-10 grid grid-cols-2 gap-6">
        <div className="border border-black p-4 rounded-lg">
          <h4 className="font-bold text-sm uppercase mb-3 border-b border-black pb-2">Tổng quan doanh thu</h4>
          <div className="flex justify-between mb-2">
            <span>Tổng doanh thu (đã thanh toán):</span>
            <span className="font-bold text-lg">{formatCurrency(totalRevenue)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tổng số hóa đơn:</span>
            <span className="font-bold">{filteredPayments.length}</span>
          </div>
        </div>
        
        <div className="border border-black p-4 rounded-lg">
          <h4 className="font-bold text-sm uppercase mb-3 border-b border-black pb-2">Trạng thái thanh toán</h4>
          <div className="flex justify-between mb-1">
            <span>Đã thanh toán:</span>
            <span className="font-bold text-emerald-600 print:text-black">{paidCount}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span>Chờ thanh toán:</span>
            <span className="font-bold text-amber-600 print:text-black">{unpaidCount}</span>
          </div>
          <div className="flex justify-between">
            <span>Đã hủy:</span>
            <span className="font-bold text-red-600 print:text-black">{cancelledCount}</span>
          </div>
        </div>
      </div>

      {/* INVOICES TABLE */}
      {filteredPayments.length > 0 ? (
        <div className="mb-10">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-100 print:bg-gray-200" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                <th className="border border-black p-2 text-center w-12">STT</th>
                <th className="border border-black p-2 text-left">Mã HĐ</th>
                <th className="border border-black p-2 text-left">Bệnh Nhân</th>
                <th className="border border-black p-2 text-left">Bác Sĩ</th>
                <th className="border border-black p-2 text-center">Trạng Thái</th>
                <th className="border border-black p-2 text-center">Ngày Tạo</th>
                <th className="border border-black p-2 text-right">Tổng Tiền</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment, idx) => (
                <tr key={payment.rowKey}>
                  <td className="border border-black p-2 text-center font-mono">{idx + 1}</td>
                  <td className="border border-black p-2 font-medium">{payment.paymentCode}</td>
                  <td className="border border-black p-2">{payment.patientName}</td>
                  <td className="border border-black p-2">{payment.doctorName}</td>
                  <td className="border border-black p-2 text-center">
                    {payment.status === "PAID" ? "Đã thanh toán" : payment.status === "CANCELLED" ? "Đã hủy" : "Chờ thanh toán"}
                  </td>
                  <td className="border border-black p-2 text-center">
                    {new Date(payment.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="border border-black p-2 text-right font-bold">{formatCurrency(payment.totalPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center p-8 border border-dashed border-slate-300 rounded-lg">
          <p className="text-slate-500">Không có hóa đơn nào phù hợp với bộ lọc hiện tại.</p>
        </div>
      )}

      {/* FOOTER & SIGNATURES */}
      <div className="mt-16 flex justify-between px-12">
        <div className="text-center">
          <p className="text-sm italic mb-1 invisible">Ngày placeholder</p>
          <p className="font-bold mb-16">Người lập Báo Cáo</p>
          <p className="font-medium italic text-sm text-slate-500 print:text-black">(Ký và ghi rõ họ tên)</p>
        </div>
        <div className="text-center">
          <p className="text-sm italic mb-1">Ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}</p>
          <p className="font-bold mb-16">Kế toán trưởng</p>
          <p className="font-medium italic text-sm text-slate-500 print:text-black">(Ký, đóng dấu và ghi rõ họ tên)</p>
        </div>
      </div>
      
      {/* Tắt nút Print thủ công đi khi in */}
      <div className="mt-12 text-center print:hidden">
        <button 
          onClick={() => window.print()}
          className="px-6 py-2 bg-emerald-600 text-white rounded-lg shadow font-medium hover:bg-emerald-700 transition-colors"
        >
          In Báo Cáo Lại
        </button>
      </div>
    </div>
  )
}

export default function PrintPaymentsPage() {
  return (
    <Suspense fallback={<LoadingBlock />}>
      <PrintPaymentsReport />
    </Suspense>
  )
}
