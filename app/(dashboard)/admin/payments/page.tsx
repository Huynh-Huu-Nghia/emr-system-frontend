"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { Eye, Receipt, RefreshCw, Search, ArrowUp, ArrowDown, Printer, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  MasterTable,
  MasterTableHeader,
  MasterTableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/master-table"
import {
  MasterModal,
  MasterModalContent,
  MasterModalHeader,
  MasterModalFooter,
  MasterModalAction,
} from "@/components/ui/master-modal"
import { ConfirmDialog } from "@/shared/components/dialog/confirm-dialog"
import { LoadingBlock } from "@/shared/components/states/loading-block"
import { ErrorState } from "@/shared/components/states/error-state"
import { EmptyState } from "@/shared/components/states/empty-state"
import { usePaymentsQuery } from "@/modules/admin/hooks/use-payments-query"
import { useCancelPaymentMutation } from "@/modules/admin/hooks/use-payment-mutations"
import type { PaymentRecord } from "@/core/api/paymentService"
import { cn } from "@/lib/utils"

const AUTO_REFRESH_INTERVAL = 30_000 // 30 seconds

export default function AdminPaymentsPage() {
  const { data: payments = [], isPending, isError, refetch } = usePaymentsQuery()
  const cancelMutation = useCancelPaymentMutation()

  const [viewTarget, setViewTarget] = useState<PaymentRecord | null>(null)
  const [cancelTarget, setCancelTarget] = useState<PaymentRecord | null>(null)
  
  const [search, setSearch] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  // Auto-refresh
  useEffect(() => {
    const interval = setInterval(() => {
      void refetch().then(() => setLastUpdated(new Date()))
    }, AUTO_REFRESH_INTERVAL)
    return () => clearInterval(interval)
  }, [refetch])

  // Manual refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    await refetch()
    setLastUpdated(new Date())
    setIsRefreshing(false)
  }, [refetch])

  // Filter
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

  if (isPending) return <LoadingBlock />
  if (isError) return <ErrorState description="Không thể tải danh sách hóa đơn" onRetry={() => void refetch()} />

  const totalRevenue = filteredPayments
    .filter(p => p.status === "PAID")
    .reduce((sum, p) => sum + p.totalPrice, 0)

  const handlePrint = () => {
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (dateFrom) params.set("dateFrom", dateFrom)
    if (dateTo) params.set("dateTo", dateTo)
    params.set("sortOrder", sortOrder)
    
    window.open(`/print/payments?${params.toString()}`, '_blank')
  }

  return (
    <div className="min-h-screen space-y-8 bg-[#fafafa] p-6 lg:p-8">
      <PageHeader
        title="Quản lý Hóa đơn"
        description="Kiểm soát, theo dõi dòng tiền và báo cáo doanh thu"
      >
        <div className="flex items-center gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            {filteredPayments.length} hóa đơn
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-medical-primary">Tổng thu:</span>
            <span className="font-mono">{totalRevenue.toLocaleString("vi-VN")}đ</span>
          </div>
        </div>
      </PageHeader>

      {/* Search + Refresh toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên bệnh nhân, bác sĩ, mã HĐ..."
            className="pl-9 rounded-xl border-slate-200 bg-white shadow-sm focus-visible:ring-1 focus-visible:ring-slate-300"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Input 
            type="date" 
            value={dateFrom} 
            onChange={e => setDateFrom(e.target.value)} 
            className="w-auto rounded-xl border-slate-200 shadow-sm text-slate-600"
          />
          <span className="text-slate-400">-</span>
          <Input 
            type="date" 
            value={dateTo} 
            onChange={e => setDateTo(e.target.value)} 
            className="w-auto rounded-xl border-slate-200 shadow-sm text-slate-600"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handlePrint}
            className="gap-2 rounded-xl border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-white shadow-sm"
          >
            <Printer className="h-4 w-4" />
            In Báo Cáo
          </Button>
          <Button
            variant="outline"
            onClick={() => void handleRefresh()}
            disabled={isRefreshing}
            className="gap-2 rounded-xl border-slate-200 bg-white shadow-sm"
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Last updated + live indicator */}
      <div className="flex items-center gap-2 -mt-5 pl-1">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        <span className="text-xs text-slate-400">
          Tự động làm mới mỗi 30 giây · Cập nhật lần cuối:{" "}
          {lastUpdated.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </span>
      </div>

      {filteredPayments.length === 0 ? (
        <EmptyState
          title={search ? "Không tìm thấy hóa đơn nào" : "Chưa có hóa đơn nào"}
          description={search ? `Không có kết quả cho "${search}"` : undefined}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <MasterTable showHeader={false}>
            <MasterTableHeader>
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="w-24 pl-6 text-[10px] font-bold uppercase tracking-widest text-medical-dark/70">
                  <Button variant="ghost" className="-ml-3 h-8 px-2 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-100" onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}>
                    Mã HĐ
                    {sortOrder === "desc" ? <ArrowDown className="ml-1.5 h-3 w-3" /> : <ArrowUp className="ml-1.5 h-3 w-3" />}
                  </Button>
                </TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-medical-dark/70">Bệnh nhân</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-medical-dark/70">Bác sĩ</TableHead>
                <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest text-medical-dark/70">Tổng tiền</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-medical-dark/70">Trạng thái</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-medical-dark/70">Ngày tạo</TableHead>
                <TableHead className="pr-8 text-right text-[10px] font-bold uppercase tracking-widest text-medical-dark/70">Thao tác</TableHead>
              </TableRow>
            </MasterTableHeader>
            <MasterTableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment.rowKey} className="group transition-colors hover:bg-slate-50">
                  <TableCell className="pl-8 font-mono text-sm font-medium text-medical-primary">{payment.paymentCode}</TableCell>
                  <TableCell className="font-semibold text-slate-700">{payment.patientName}</TableCell>
                  <TableCell className="text-sm text-slate-600">{payment.doctorName}</TableCell>
                  <TableCell className="text-right font-mono text-sm font-semibold text-slate-700">
                    {payment.totalPrice.toLocaleString("vi-VN")}đ
                  </TableCell>
                  <TableCell>
                    {payment.status === "PAID" ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                        Đã thanh toán
                      </span>
                    ) : payment.status === "CANCELLED" ? (
                      <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                        Đã hủy
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                        Chờ thanh toán
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {new Date(payment.createdAt).toLocaleDateString("vi-VN")}
                  </TableCell>
                  <TableCell className="pr-8 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setViewTarget(payment)}
                        title="Xem hóa đơn"
                        className="rounded-full shadow-none transition-all hover:bg-slate-100"
                      >
                        <Eye className="h-4 w-4 text-slate-600" />
                      </Button>
                      
                      {payment.status !== "CANCELLED" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setCancelTarget(payment)}
                          title="Hủy hóa đơn"
                          className="rounded-full shadow-none transition-all hover:bg-red-50 hover:text-red-600"
                        >
                          <XCircle className="h-4 w-4 text-red-600" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </MasterTableBody>
          </MasterTable>
        </div>
      )}

      {/* Invoice detail modal */}
      <MasterModal open={viewTarget != null} onOpenChange={(open) => { if (!open) setViewTarget(null) }}>
        <MasterModalContent className="sm:max-w-lg">
          <MasterModalHeader title={viewTarget ? `Hóa đơn ${viewTarget.paymentCode}` : ""} />
          {viewTarget && (
            <div className="space-y-4 px-6 py-5">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <InvoiceMeta label="Bệnh nhân" value={viewTarget.patientName} />
                <InvoiceMeta label="Bác sĩ" value={viewTarget.doctorName} />
                <InvoiceMeta
                  label="Ngày tạo"
                  value={viewTarget.createdAt ? new Date(viewTarget.createdAt).toLocaleString("vi-VN") : "---"}
                />
                <InvoiceMeta
                  label="Trạng thái"
                  value={viewTarget.status === "PAID" ? "Đã thanh toán" : viewTarget.status === "CANCELLED" ? "Đã hủy" : "Chờ thanh toán"}
                />
              </div>

              <div className="rounded-lg border border-slate-200">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-slate-600">Thuốc</th>
                      <th className="px-3 py-2 text-right font-medium text-slate-600">SL</th>
                      <th className="px-3 py-2 text-right font-medium text-slate-600">Đơn giá</th>
                      <th className="px-3 py-2 text-right font-medium text-slate-600">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewTarget.items.map((item, index) => (
                      <tr key={`${item.medicineName}-${index}`} className="border-t border-slate-100">
                        <td className="px-3 py-2">{item.medicineName}</td>
                        <td className="px-3 py-2 text-right">{item.quantity}</td>
                        <td className="px-3 py-2 text-right font-mono">{item.unitPrice.toLocaleString("vi-VN")}đ</td>
                        <td className="px-3 py-2 text-right font-mono">{item.subtotal.toLocaleString("vi-VN")}đ</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t-2 border-slate-200 bg-slate-50">
                    <tr>
                      <td colSpan={3} className="px-3 py-2 text-right font-semibold">Tổng cộng</td>
                      <td className="px-3 py-2 text-right font-mono font-bold text-medical-primary">
                        {viewTarget.totalPrice.toLocaleString("vi-VN")}đ
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <MasterModalFooter>
                <MasterModalAction variant="secondary" onClick={() => setViewTarget(null)}>
                  Đóng
                </MasterModalAction>
              </MasterModalFooter>
            </div>
          )}
        </MasterModalContent>
      </MasterModal>

      {/* Cancel payment dialog */}
      <ConfirmDialog
        open={cancelTarget != null}
        onOpenChange={(open) => { if (!open) setCancelTarget(null) }}
        title="Xác nhận hủy hóa đơn"
        description={
          cancelTarget ? (
            <span>
              Bạn có chắc muốn hủy hóa đơn <strong>{cancelTarget.paymentCode}</strong> trị giá <strong>{cancelTarget.totalPrice.toLocaleString("vi-VN")}đ</strong> của bệnh nhân <strong>{cancelTarget.patientName}</strong>? Hành động này không thể hoàn tác.
            </span>
          ) : null
        }
        variant="destructive"
        confirmLabel="Hủy hóa đơn"
        loading={cancelMutation.isPending}
        onConfirm={() => {
          if (!cancelTarget) return
          cancelMutation.mutate(cancelTarget.prescriptionId, {
            onSuccess: () => {
              setCancelTarget(null)
              void handleRefresh()
            },
          })
        }}
      />
    </div>
  )
}

function InvoiceMeta({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-slate-500">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  )
}