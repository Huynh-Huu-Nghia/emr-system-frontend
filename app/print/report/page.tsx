"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { dashboardService, type DashboardStats } from "@/core/api/dashboardService"
import { LoadingBlock } from "@/shared/components/states/loading-block"
import { ErrorState } from "@/shared/components/states/error-state"

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

function PrintReportContent() {
  const searchParams = useSearchParams()
  const timeframe = searchParams.get("timeframe") || "today"
  const startDate = searchParams.get("startDate") || ""
  const endDate = searchParams.get("endDate") || ""

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const data = await dashboardService.getStats(timeframe, startDate, endDate)
        setStats(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to load data"))
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [timeframe, startDate, endDate])

  useEffect(() => {
    if (!loading && !error && stats) {
      const timer = setTimeout(() => {
        window.print()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [loading, error, stats])

  if (loading) return <LoadingBlock />
  if (error) return <ErrorState description={error.message} onRetry={() => window.location.reload()} />
  if (!stats) return <ErrorState description="Không có dữ liệu báo cáo" />

  let timeText = "Hôm nay"
  if (timeframe === "week") timeText = "7 ngày qua"
  if (timeframe === "month") timeText = "30 ngày qua"
  if (timeframe === "year") timeText = `Năm ${new Date().getFullYear()}`
  if (timeframe === "all") timeText = "Tất cả thời gian"
  if (timeframe === "custom") timeText = `Từ ngày ${startDate} đến ngày ${endDate}`

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
          <h2 className="text-xl font-bold uppercase tracking-widest text-slate-400 print:text-black">BÁO CÁO THỐNG KÊ</h2>
          <p className="font-mono text-sm font-semibold mt-1">Kỳ báo cáo: {timeText}</p>
        </div>
      </div>

      <h3 className="text-xl font-bold text-center uppercase mb-6">Báo Cáo Tổng Quan Hoạt Động Phòng Khám</h3>

      {/* SUMMARY STATS */}
      <div className="mb-10 grid grid-cols-2 gap-6">
        <div className="border border-black p-4 rounded-lg">
          <h4 className="font-bold text-sm uppercase mb-3 border-b border-black pb-2">Tình hình tài chính</h4>
          <div className="flex justify-between mb-2">
            <span>Tổng doanh thu:</span>
            <span className="font-bold text-lg">{formatCurrency(stats.periodRevenue)}</span>
          </div>
          <div className="flex justify-between">
            <span>Hóa đơn chưa thanh toán:</span>
            <span className="font-bold">{stats.unpaidInvoices}</span>
          </div>
        </div>
        
        <div className="border border-black p-4 rounded-lg">
          <h4 className="font-bold text-sm uppercase mb-3 border-b border-black pb-2">Lưu lượng khám bệnh</h4>
          <div className="flex justify-between mb-2">
            <span>Lịch hẹn hoàn tất:</span>
            <span className="font-bold">{stats.completedAppointments} / {stats.periodAppointments}</span>
          </div>
          <div className="flex justify-between">
            <span>Bệnh nhân mới:</span>
            <span className="font-bold">{stats.newPatients}</span>
          </div>
        </div>
      </div>

      {/* TOP DOCTORS */}
      {stats.topDoctors && stats.topDoctors.length > 0 && (
        <div className="mb-10">
          <h4 className="font-bold uppercase mb-2">I. Hiệu suất Bác Sĩ (Top số ca khám)</h4>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-100 print:bg-gray-200" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                <th className="border border-black p-2 text-center w-12">STT</th>
                <th className="border border-black p-2 text-left">Họ và Tên Bác Sĩ</th>
                <th className="border border-black p-2 text-right w-40">Số Ca Khám Hoàn Tất</th>
              </tr>
            </thead>
            <tbody>
              {stats.topDoctors.map((doc, idx) => (
                <tr key={idx}>
                  <td className="border border-black p-2 text-center font-mono">{idx + 1}</td>
                  <td className="border border-black p-2">{doc.name}</td>
                  <td className="border border-black p-2 text-right font-bold">{doc.appointments} ca</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TOP MEDICINES */}
      {stats.topMedicines && stats.topMedicines.length > 0 && (
        <div className="mb-10">
          <h4 className="font-bold uppercase mb-2">II. Top Thuốc Xuất Kho</h4>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-100 print:bg-gray-200" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                <th className="border border-black p-2 text-center w-12">STT</th>
                <th className="border border-black p-2 text-left">Tên Thuốc</th>
                <th className="border border-black p-2 text-center w-24">Đơn Vị</th>
                <th className="border border-black p-2 text-right w-32">Số Lượng Xuất</th>
              </tr>
            </thead>
            <tbody>
              {stats.topMedicines.map((med, idx) => (
                <tr key={idx}>
                  <td className="border border-black p-2 text-center font-mono">{idx + 1}</td>
                  <td className="border border-black p-2 font-medium">{med.name}</td>
                  <td className="border border-black p-2 text-center">{med.unit}</td>
                  <td className="border border-black p-2 text-right font-bold">{med.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
          <p className="font-bold mb-16">Giám đốc Phòng Khám</p>
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

export default function PrintReportPage() {
  return (
    <Suspense fallback={<LoadingBlock />}>
      <PrintReportContent />
    </Suspense>
  )
}