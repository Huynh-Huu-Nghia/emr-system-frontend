"use client"

import { useState, useEffect, useCallback } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { CheckCircle2, Eye, Receipt, RefreshCw, Search, Wifi } from "lucide-react"
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
import { useConfirmPaymentMutation } from "@/modules/admin/hooks/use-payment-mutations"
import type { PaymentRecord } from "@/core/api/paymentService"
import { cn } from "@/lib/utils"

const AUTO_REFRESH_INTERVAL = 30_000 // 30 seconds

export default function AdminPaymentsPage() {
  const { data: payments = [], isPending, isError, refetch } = usePaymentsQuery()
  const confirmMutation = useConfirmPaymentMutation()

  const [viewTarget, setViewTarget] = useState<PaymentRecord | null>(null)
  const [confirmTarget, setConfirmTarget] = useState<PaymentRecord | null>(null)
  const [search, setSearch] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

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

  // Search filter
  const filteredPayments = payments.filter((p) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      p.patientName.toLowerCase().includes(q) ||
      p.doctorName.toLowerCase().includes(q) ||
      String(p.id).includes(q)
    )
  })

  if (isPending) return <LoadingBlock />
  if (isError) return <ErrorState description="Không thể tải danh sách hóa đơn" onRetry={() => void refetch()} />

  const unpaidCount = payments.filter((p) => p.status === "UNPAID").length

  return (
    <div className="min-h-screen space-y-8 bg-[#fafafa] p-6 lg:p-8">
      <PageHeader
        title="Thanh toán"
        description="Quản lý hóa đơn và xác nhận thu tiền"
      >
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Receipt className="h-4 w-4" />
          {unpaidCount} chờ thanh toán
        </div>
      </PageHeader>

      {/* Search + Refresh toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên bệnh nhân, bác sĩ, mã HĐ..."
            className="pl-9 rounded-xl border-slate-200 bg-white shadow-sm focus-visible:ring-1 focus-visible:ring-slate-300"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void handleRefresh()}
          disabled={isRefreshing}
          className="gap-2 rounded-xl border-slate-200 bg-white shadow-sm"
        >
          <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          Làm mới
        </Button>
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
                <TableHead className="pl-8 text-[10px] font-bold uppercase tracking-widest text-medical-dark/70">Mã HĐ</TableHead>
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
                  <TableCell className="pl-8 font-mono text-sm text-slate-500">#{payment.id}</TableCell>
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
                      {payment.status === "UNPAID" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setConfirmTarget(payment)}
                          title="Xác nhận thanh toán"
                          className="rounded-full shadow-none transition-all hover:bg-emerald-50 hover:text-emerald-600"
                        >
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
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
      {/* ... (unchanged) ... */}

      {/* Confirm payment dialog — also triggers refresh on success */}
      <ConfirmDialog
        open={confirmTarget != null}
        onOpenChange={(open) => { if (!open) setConfirmTarget(null) }}
        title="Xác nhận thu tiền"
        description={
          confirmTarget ? (
            <span>
              Xác nhận thu <strong>{confirmTarget.totalPrice.toLocaleString("vi-VN")}đ</strong> từ bệnh nhân <strong>{confirmTarget.patientName}</strong>?
            </span>
          ) : null
        }
        confirmLabel="Xác nhận thanh toán"
        loading={confirmMutation.isPending}
        onConfirm={() => {
          if (!confirmTarget) return
          confirmMutation.mutate(confirmTarget.prescriptionId, {
            onSuccess: () => {
              setConfirmTarget(null)
              void handleRefresh() // refresh immediately after confirming
            },
          })
        }}
      />
    </div>
  )
}