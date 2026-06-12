"use client"

import { useState } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { CheckCircle2, Eye, Receipt } from "lucide-react"
import { Button } from "@/components/ui/button"
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

export default function AdminPaymentsPage() {
  const { data: payments = [], isPending, isError, refetch } = usePaymentsQuery()
  const confirmMutation = useConfirmPaymentMutation()

  const [viewTarget, setViewTarget] = useState<PaymentRecord | null>(null)
  const [confirmTarget, setConfirmTarget] = useState<PaymentRecord | null>(null)

  if (isPending) return <LoadingBlock />
  if (isError) return <ErrorState description="Không thể tải danh sách hóa đơn" onRetry={() => void refetch()} />

  return (
    <div className="min-h-screen space-y-8 bg-[#fafafa] p-6 lg:p-8">
      <PageHeader
        title="Thanh toán"
        description="Quản lý hóa đơn và xác nhận thu tiền"
      >
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Receipt className="h-4 w-4" />
          {payments.filter((p) => p.status === "UNPAID").length} chờ thanh toán
        </div>
      </PageHeader>

      {payments.length === 0 ? (
        <EmptyState title="Chưa có hóa đơn nào" />
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
              {payments.map((payment) => (
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
      <MasterModal open={viewTarget != null} onOpenChange={(open) => { if (!open) setViewTarget(null) }}>
        <MasterModalContent className="sm:max-w-lg">
          <MasterModalHeader title={viewTarget ? `Hóa đơn #${viewTarget.id}` : ""} />
          {viewTarget && (
            <div className="space-y-4 px-6 py-5">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Bệnh nhân</p>
                  <p className="font-medium">{viewTarget.patientName}</p>
                </div>
                <div>
                  <p className="text-slate-500">Bác sĩ</p>
                  <p className="font-medium">{viewTarget.doctorName}</p>
                </div>
                <div>
                  <p className="text-slate-500">Ngày tạo</p>
                  <p className="font-medium">{new Date(viewTarget.createdAt).toLocaleString("vi-VN")}</p>
                </div>
                <div>
                  <p className="text-slate-500">Trạng thái</p>
                  <p className="font-medium">{viewTarget.status === "PAID" ? "Đã thanh toán" : "Chờ thanh toán"}</p>
                </div>
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
                    {viewTarget.items.map((item, idx) => (
                      <tr key={idx} className="border-t border-slate-100">
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

      {/* Confirm payment dialog */}
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
          confirmMutation.mutate(confirmTarget.prescriptionId, { onSuccess: () => setConfirmTarget(null) })
        }}
      />
    </div>
  )
}
