"use client"

import { useMemo, useState } from "react"
import { CheckCircle2, Eye, Receipt } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ui/page-header"
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
import type { PaymentRecord } from "@/core/api/paymentService"
import { useConfirmPaymentMutation } from "@/modules/admin/hooks/use-payment-mutations"
import { usePaymentsQuery } from "@/modules/admin/hooks/use-payments-query"

export default function ReceptionPaymentsPage() {
  const { data: payments = [], isPending, isError, refetch } = usePaymentsQuery()
  const confirmPayment = useConfirmPaymentMutation()
  const [viewTarget, setViewTarget] = useState<PaymentRecord | null>(null)
  const [confirmTarget, setConfirmTarget] = useState<PaymentRecord | null>(null)

  const unpaidCount = useMemo(
    () => payments.filter((payment) => payment.status === "UNPAID").length,
    [payments]
  )

  if (isPending) return <LoadingBlock />
  if (isError) {
    return (
      <ErrorState
        description="Không thể tải danh sách hóa đơn"
        onRetry={() => void refetch()}
      />
    )
  }

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

      {payments.length === 0 ? (
        <EmptyState
          title="Chưa có hóa đơn nào"
          description="Hóa đơn sẽ xuất hiện sau khi bác sĩ lưu đơn thuốc."
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <MasterTable showHeader={false}>
            <MasterTableHeader>
              <TableRow>
                <TableHead>Mã HĐ</TableHead>
                <TableHead>Bệnh nhân</TableHead>
                <TableHead>Bác sĩ</TableHead>
                <TableHead className="text-right">Tổng tiền</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </MasterTableHeader>
            <MasterTableBody>
              {payments.map((payment) => (
                <TableRow key={payment.rowKey}>
                  <TableCell className="font-mono text-sm">#{payment.id}</TableCell>
                  <TableCell className="font-medium">{payment.patientName}</TableCell>
                  <TableCell className="text-sm text-slate-600">{payment.doctorName}</TableCell>
                  <TableCell className="text-right font-mono text-sm font-semibold">
                    {payment.totalPrice.toLocaleString("vi-VN")}đ
                  </TableCell>
                  <TableCell>
                    {payment.status === "PAID" ? (
                      <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                        Đã thanh toán
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                        Chờ thanh toán
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {payment.createdAt
                      ? new Date(payment.createdAt).toLocaleDateString("vi-VN")
                      : "---"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Xem hóa đơn"
                        onClick={() => setViewTarget(payment)}
                      >
                        <Eye className="h-4 w-4 text-slate-600" />
                      </Button>
                      {payment.status === "UNPAID" ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Xác nhận thu tiền"
                          onClick={() => setConfirmTarget(payment)}
                        >
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        </Button>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </MasterTableBody>
          </MasterTable>
        </div>
      )}

      <MasterModal
        open={viewTarget != null}
        onOpenChange={(open) => {
          if (!open) setViewTarget(null)
        }}
      >
        <MasterModalContent className="sm:max-w-lg">
          <MasterModalHeader title={viewTarget ? `Hóa đơn #${viewTarget.id}` : ""} />
          {viewTarget ? (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <InvoiceMeta label="Bệnh nhân" value={viewTarget.patientName} />
                <InvoiceMeta label="Bác sĩ" value={viewTarget.doctorName} />
                <InvoiceMeta
                  label="Ngày tạo"
                  value={
                    viewTarget.createdAt
                      ? new Date(viewTarget.createdAt).toLocaleString("vi-VN")
                      : "---"
                  }
                />
                <InvoiceMeta
                  label="Trạng thái"
                  value={viewTarget.status === "PAID" ? "Đã thanh toán" : "Chờ thanh toán"}
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
                        <td className="px-3 py-2 text-right font-mono">
                          {item.unitPrice.toLocaleString("vi-VN")}đ
                        </td>
                        <td className="px-3 py-2 text-right font-mono">
                          {item.subtotal.toLocaleString("vi-VN")}đ
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t-2 border-slate-200 bg-slate-50">
                    <tr>
                      <td colSpan={3} className="px-3 py-2 text-right font-semibold">
                        Tổng cộng
                      </td>
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
          ) : null}
        </MasterModalContent>
      </MasterModal>

      <ConfirmDialog
        open={confirmTarget != null}
        onOpenChange={(open) => {
          if (!open) setConfirmTarget(null)
        }}
        title="Xác nhận thu tiền"
        description={
          confirmTarget ? (
            <span>
              Xác nhận thu{" "}
              <strong>{confirmTarget.totalPrice.toLocaleString("vi-VN")}đ</strong>{" "}
              từ bệnh nhân <strong>{confirmTarget.patientName}</strong>?
            </span>
          ) : null
        }
        confirmLabel="Xác nhận thanh toán"
        loading={confirmPayment.isPending}
        onConfirm={() => {
          if (!confirmTarget) return
          confirmPayment.mutate(confirmTarget.prescriptionId, {
            onSuccess: () => setConfirmTarget(null),
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
