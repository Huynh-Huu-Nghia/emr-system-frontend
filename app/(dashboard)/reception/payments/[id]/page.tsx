"use client"

import { useQuery } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"
import { paymentService } from "@/core/api/paymentService"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { ErrorState } from "@/shared/components/states/error-state"
import { LoadingBlock } from "@/shared/components/states/loading-block"
import { MasterTable, MasterTableBody, TableCell, TableHead, MasterTableHeader, TableRow } from "@/components/ui/master-table"
import { ArrowLeft, CheckCircle2, Clock, FileText, Printer, XCircle } from "lucide-react"

export default function PaymentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = Number(params.id)

  const { data: payments, isPending, isError, refetch } = useQuery({
    queryKey: ["payments"],
    queryFn: () => paymentService.getAll(),
  })

  if (isPending) return <LoadingBlock />
  if (isError) return <ErrorState description="Không thể tải chi tiết hóa đơn" onRetry={() => void refetch()} />

  const payment = payments?.find(p => p.id === id)
  if (!payment) return <ErrorState title="Trang không tìm thấy" description="Không tìm thấy hóa đơn này" />

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="min-h-screen space-y-8 bg-[#fafafa] p-6 lg:p-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" className="h-10 w-10 p-0 rounded-full hover:bg-slate-200" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <PageHeader
          title={`Chi tiết Hóa đơn ${payment.paymentCode}`}
          description="Xem chi tiết các hạng mục và in hóa đơn"
        />
        <div className="ml-auto">
          <Button onClick={handlePrint} className="gap-2 rounded-xl bg-medical-primary text-white hover:bg-medical-primary/90 shadow-sm print:hidden">
            <Printer className="h-4 w-4" />
            In hóa đơn
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Invoice Info */}
        <div className="col-span-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-800">Thông tin chung</h3>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-slate-500">Mã HĐ</div>
              <div className="font-mono font-medium text-medical-primary">{payment.paymentCode}</div>
            </div>
            <div>
              <div className="text-sm text-slate-500">Bệnh nhân</div>
              <div className="font-medium text-slate-800">{payment.patientName}</div>
            </div>
            <div>
              <div className="text-sm text-slate-500">Bác sĩ phụ trách</div>
              <div className="font-medium text-slate-800">{payment.doctorName}</div>
            </div>
            <div>
              <div className="text-sm text-slate-500">Ngày tạo</div>
              <div className="font-medium text-slate-800">{new Date(payment.createdAt).toLocaleString("vi-VN")}</div>
            </div>
            <div>
              <div className="text-sm text-slate-500">Trạng thái</div>
              <div className="mt-1">
                {payment.status === "PAID" ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700 border border-emerald-200/50">
                    <CheckCircle2 className="h-4 w-4" /> Đã thanh toán
                  </span>
                ) : payment.status === "CANCELLED" ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-sm font-semibold text-red-700 border border-red-200/50">
                    <XCircle className="h-4 w-4" /> Đã hủy
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700 border border-amber-200/50">
                    <Clock className="h-4 w-4" /> Chờ thanh toán
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Items */}
        <div className="col-span-1 lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-800">Danh sách hạng mục</h3>
          {payment.items.length === 0 ? (
            <div className="flex h-32 flex-col items-center justify-center text-slate-400">
              <FileText className="mb-2 h-6 w-6 opacity-20" />
              <p className="text-sm">Không có hạng mục nào</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <MasterTable showHeader={false}>
                <MasterTableHeader>
                  <TableRow className="border-none bg-slate-50/50">
                    <TableHead className="pl-6 text-[10px] font-bold uppercase tracking-widest text-medical-dark/70">Tên thuốc</TableHead>
                    <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest text-medical-dark/70">Số lượng</TableHead>
                    <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest text-medical-dark/70">Đơn giá</TableHead>
                    <TableHead className="pr-6 text-right text-[10px] font-bold uppercase tracking-widest text-medical-dark/70">Thành tiền</TableHead>
                  </TableRow>
                </MasterTableHeader>
                <MasterTableBody>
                  {payment.items.map((item, idx) => (
                    <TableRow key={idx} className="border-slate-100 hover:bg-slate-50 transition-colors">
                      <TableCell className="pl-6 font-medium text-slate-700">{item.medicineName}</TableCell>
                      <TableCell className="text-right text-slate-600">{item.quantity}</TableCell>
                      <TableCell className="text-right font-mono text-sm text-slate-600">{item.unitPrice.toLocaleString("vi-VN")}đ</TableCell>
                      <TableCell className="pr-6 text-right font-mono text-sm font-semibold text-slate-800">{item.subtotal.toLocaleString("vi-VN")}đ</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-slate-50/50">
                    <TableCell colSpan={3} className="pl-6 text-right font-bold text-slate-700">Tổng cộng:</TableCell>
                    <TableCell className="pr-6 text-right font-mono text-lg font-bold text-medical-primary">{payment.totalPrice.toLocaleString("vi-VN")}đ</TableCell>
                  </TableRow>
                </MasterTableBody>
              </MasterTable>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
