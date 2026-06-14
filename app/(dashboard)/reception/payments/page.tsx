"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { CheckCircle2, Eye, Receipt, RefreshCw, Search, ArrowUp, ArrowDown, Printer } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/ui/page-header"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  MasterTable,
  MasterTableBody,
  MasterTableHeader,
  TableCell,
  TableHead,
  TableRow,
} from "@/components/ui/master-table"
import {
  MasterModal,
  MasterModalAction,
  MasterModalContent,
  MasterModalFooter,
  MasterModalHeader,
} from "@/components/ui/master-modal"
import { ConfirmDialog } from "@/shared/components/dialog/confirm-dialog"
import { EmptyState } from "@/shared/components/states/empty-state"
import { ErrorState } from "@/shared/components/states/error-state"
import { LoadingBlock } from "@/shared/components/states/loading-block"
import { cn } from "@/lib/utils"
import type { PaymentRecord } from "@/core/api/paymentService"
import { useConfirmPaymentMutation } from "@/modules/admin/hooks/use-payment-mutations"
import { usePaymentsQuery } from "@/modules/admin/hooks/use-payments-query"

const AUTO_REFRESH_INTERVAL = 30_000

export default function ReceptionPaymentsPage() {
  const { data: payments = [], isPending, isError, refetch } = usePaymentsQuery()
  const confirmPayment = useConfirmPaymentMutation()

  const [viewTarget, setViewTarget] = useState<PaymentRecord | null>(null)
  const [confirmTarget, setConfirmTarget] = useState<PaymentRecord | null>(null)
  const [filter, setFilter] = useState<"ALL" | "UNPAID" | "PAID" | "CANCELLED">("ALL")
  const [search, setSearch] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    await refetch({ cancelRefetch: true })
    setLastUpdated(new Date())
    setIsRefreshing(false)
  }, [refetch])

  useEffect(() => {
    const interval = setInterval(() => {
      void refetch().then(() => setLastUpdated(new Date()))
    }, AUTO_REFRESH_INTERVAL)
    return () => clearInterval(interval)
  }, [refetch])


  const unpaidCount = useMemo(
    () => payments.filter((p) => p.status === "UNPAID").length,
    [payments]
  )

  const filteredPayments = useMemo(() => {
    const q = search.trim().toLowerCase()
    return payments.filter((p) => {
      if (filter !== "ALL" && p.status !== filter) return false
      if (!q) return true
      return (
        p.patientName.toLowerCase().includes(q) ||
        p.doctorName.toLowerCase().includes(q) ||
        String(p.id).includes(q)
      )
    }).sort((a, b) => sortOrder === "asc" ? a.id - b.id : b.id - a.id)
  }, [payments, filter, search, sortOrder])

  if (isPending) return <LoadingBlock />
  if (isError) return <ErrorState description="Không thể tải danh sách hóa đơn" onRetry={() => void refetch()} />

  return (
    <div className="min-h-screen space-y-8 bg-[#fafafa] p-6 lg:p-8">
      <PageHeader
        title="Thanh toán lễ tân"
        description="Xem hóa đơn sau khám, xác nhận thu tiền và đối soát thuốc."
      >
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Receipt className="h-4 w-4" />
          {unpaidCount} hóa đơn chờ thu
        </div>
      </PageHeader>

      {/* Search + filter + refresh toolbar */}
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
        <Select value={filter} onValueChange={(v: "ALL" | "UNPAID" | "PAID" | "CANCELLED") => setFilter(v)}>
          <SelectTrigger className="w-[180px] rounded-xl border-slate-200 bg-white shadow-sm">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả</SelectItem>
            <SelectItem value="UNPAID">Chờ thanh toán</SelectItem>
            <SelectItem value="PAID">Đã thanh toán</SelectItem>
            <SelectItem value="CANCELLED">Đã hủy</SelectItem>
          </SelectContent>
        </Select>
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

      {/* Live indicator */}
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
          title={search || filter !== "ALL" ? "Không tìm thấy hóa đơn nào" : "Chưa có hóa đơn nào"}
          description={
            search
              ? `Không có kết quả cho "${search}"`
              : filter !== "ALL"
                ? "Thử chọn trạng thái khác."
                : "Hóa đơn sẽ xuất hiện sau khi bác sĩ lưu đơn thuốc."
          }
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
                      <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                        Đã thanh toán
                      </span>
                    ) : payment.status === "CANCELLED" ? (
                      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500">
                        Đã hủy
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                        Chờ thanh toán
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString("vi-VN") : "---"}
                  </TableCell>
                  <TableCell className="pr-8 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Xem hóa đơn"
                        onClick={() => setViewTarget(payment)}
                        className="rounded-full shadow-none transition-all hover:bg-slate-100"
                      >
                        <Eye className="h-4 w-4 text-slate-600" />
                      </Button>
                      {payment.status === "UNPAID" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Xác nhận thu tiền"
                          onClick={() => setConfirmTarget(payment)}
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

      <MasterModal open={viewTarget != null} onOpenChange={(open) => { if (!open) setViewTarget(null) }}>
        <MasterModalContent className="sm:max-w-lg">
          <MasterModalHeader title={viewTarget ? `Hóa đơn #${viewTarget.id}` : ""} />
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
                  value={paymentStatusLabel(viewTarget.status)}
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
                {viewTarget.status === "PAID" && (
                  <Button
                    variant="default"
                    onClick={() => window.open(`/print/invoice/${viewTarget.id}`, '_blank')}
                    className="mr-auto gap-2"
                  >
                    <Printer className="h-4 w-4" />
                    In Hóa Đơn
                  </Button>
                )}
                <MasterModalAction variant="secondary" onClick={() => setViewTarget(null)}>
                  Đóng
                </MasterModalAction>
              </MasterModalFooter>
            </div>
          )}
        </MasterModalContent>
      </MasterModal>

      <ConfirmDialog
        open={confirmTarget != null}
        onOpenChange={(open) => { if (!open) setConfirmTarget(null) }}
        title="Xác nhận thu tiền"
        description={
          confirmTarget ? (
            <span>
              Xác nhận thu <strong>{confirmTarget.totalPrice.toLocaleString("vi-VN")}đ</strong>{" "}
              từ bệnh nhân <strong>{confirmTarget.patientName}</strong>?
            </span>
          ) : null
        }
        confirmLabel="Xác nhận thanh toán"
        loading={confirmPayment.isPending}
        onConfirm={() => {
          if (!confirmTarget) return
          confirmPayment.mutate(confirmTarget.prescriptionId, {
            onSuccess: () => { setConfirmTarget(null); void handleRefresh() },
          })
        }}
      />
    </div>
  )
}

function InvoiceMeta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-slate-500">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  )
}

function paymentStatusLabel(status: string) {
  if (status === "PAID") return "Đã thanh toán"
  if (status === "CANCELLED") return "Đã hủy"
  return "Chờ thanh toán"
}