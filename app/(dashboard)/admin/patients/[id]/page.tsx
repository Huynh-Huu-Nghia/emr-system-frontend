"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, CalendarDays, ClipboardList, CreditCard, Trash2, UserRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ui/page-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MasterTable, MasterTableHeader, MasterTableBody } from "@/components/ui/master-table"
import { TableRow, TableCell, TableHead } from "@/components/ui/table"
import { EmptyState } from "@/shared/components/states/empty-state"
import { LoadingBlock } from "@/shared/components/states/loading-block"
import { GenderBadge } from "@/shared/components/feedback/gender-badge"
import { formatDateVi, formatDateTimeVi } from "@/shared/lib/format/date"
import { AppointmentStatusBadge } from "@/modules/appointment/components/appointment-status-badge"
import { ConfirmDialog } from "@/shared/components/dialog/confirm-dialog"
import { useDeletePatientMutation } from "@/modules/patient/hooks/use-delete-patient-mutation"
import { toast } from "sonner"

import { patientService } from "@/core/api/patientService"
import { appointmentService, type Appointment } from "@/core/api/appointmentService"
import { medicalRecordService, type MedicalRecord } from "@/core/api/medicalRecordService"
import { paymentService, type PaymentRecord } from "@/core/api/paymentService"
import type { Patient } from "@/modules/patient/types"
import { ROUTES } from "@/constants/routes"

export default function AdminPatientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const patientId = Number(params.id)
  const deleteMutation = useDeletePatientMutation()

  const [patient, setPatient] = useState<Patient | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([])
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true)
        const [pData, apptData, medData, allPayments] = await Promise.all([
          patientService.getPatientById(patientId),
          appointmentService.getByPatientId(patientId),
          medicalRecordService.getByPatientId(patientId),
          paymentService.getAll()
        ])
        setPatient(pData)
        setAppointments(apptData)
        setMedicalRecords(medData)
        setPayments(allPayments.filter(p => p.patientName === pData.full_name))
      } catch (error) {
        console.error("Failed to load patient 360 data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    void loadData()
  }, [patientId])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fafafa] p-6 lg:p-8 flex items-center justify-center">
        <LoadingBlock message="Đang tải Hồ sơ Bệnh nhân 360°..." />
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-[#fafafa] p-6 lg:p-8 flex items-center justify-center">
        <EmptyState title="Không tìm thấy bệnh nhân" description="Bệnh nhân này không tồn tại hoặc đã bị xóa." />
      </div>
    )
  }

  return (
    <div className="min-h-screen space-y-2 bg-[#fafafa] p-6 lg:p-8">
      <div className="mb-2">
        <Button 
          variant="ghost" 
          onClick={() => router.push(ROUTES.ADMIN.PATIENTS)} 
          className="text-slate-500 hover:text-medical-primary hover:bg-medical-primary/10 -ml-4 gap-2 font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách
        </Button>
      </div>

      <PageHeader
        title={`Hồ sơ: ${patient.full_name}`}
        description={`Mã hồ sơ: #${patient.medicalHistoryNumber} • Kiểm toán toàn diện`}
      >
        <Button
          variant="destructive"
          onClick={() => setIsDeleteDialogOpen(true)}
          className="rounded-xl shadow-sm gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Xóa hồ sơ
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="md:col-span-1 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-medical-primary/10 text-medical-primary">
                <UserRound className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">{patient.full_name}</h3>
                <p className="text-sm font-medium text-slate-500">#{patient.medicalHistoryNumber}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between border-b border-slate-100 pb-3">
                <span className="text-sm text-slate-500">Giới tính</span>
                <GenderBadge gender={patient.gender} />
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-3">
                <span className="text-sm text-slate-500">Ngày sinh</span>
                <span className="font-medium text-slate-700">{formatDateVi(patient.dob)}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-3">
                <span className="text-sm text-slate-500">Điện thoại</span>
                <span className="font-medium text-slate-700">{patient.phone}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-3">
                <span className="text-sm text-slate-500">Mã BHYT</span>
                <span className="font-medium text-slate-700">{patient.insurance_code || "---"}</span>
              </div>
              <div className="flex justify-between pb-1 gap-4">
                <span className="text-sm text-slate-500 whitespace-nowrap">Địa chỉ</span>
                <span className="font-medium text-slate-700 text-right break-words whitespace-normal">{patient.address}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <Tabs defaultValue="appointments" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-12 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
              <TabsTrigger value="appointments" className="rounded-lg data-[state=active]:bg-medical-primary/10 data-[state=active]:text-medical-primary font-semibold">
                <CalendarDays className="h-4 w-4 mr-2" />
                Lịch hẹn ({appointments.length})
              </TabsTrigger>
              <TabsTrigger value="records" className="rounded-lg data-[state=active]:bg-medical-primary/10 data-[state=active]:text-medical-primary font-semibold">
                <ClipboardList className="h-4 w-4 mr-2" />
                Bệnh án ({medicalRecords.length})
              </TabsTrigger>
              <TabsTrigger value="payments" className="rounded-lg data-[state=active]:bg-medical-primary/10 data-[state=active]:text-medical-primary font-semibold">
                <CreditCard className="h-4 w-4 mr-2" />
                Thanh toán ({payments.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="appointments" className="mt-6">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <MasterTable showHeader={false}>
                  <MasterTableHeader>
                    <TableRow className="border-none hover:bg-transparent bg-slate-50/50">
                      <TableHead className="pl-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">ID Ca Khám</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Bác sĩ phụ trách</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Thời gian</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Lý do</TableHead>
                      <TableHead className="pr-6 text-right text-[10px] font-bold uppercase tracking-widest text-slate-500">Trạng thái</TableHead>
                    </TableRow>
                  </MasterTableHeader>
                  <MasterTableBody>
                    {appointments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="p-0">
                          <EmptyState title="Chưa có lịch hẹn nào" />
                        </TableCell>
                      </TableRow>
                    ) : (
                      appointments.map((appt) => (
                        <TableRow key={appt.id} className="hover:bg-slate-50">
                          <TableCell className="pl-6 font-semibold text-medical-primary">{appt.appointmentCode}</TableCell>
                          <TableCell className="font-medium text-slate-700">{appt.doctor_name || "Chưa xếp"}</TableCell>
                          <TableCell className="text-slate-600">{formatDateTimeVi(appt.starts_at)}</TableCell>
                          <TableCell className="text-slate-600 max-w-[150px] truncate" title={appt.reason || ""}>{appt.reason || "---"}</TableCell>
                          <TableCell className="pr-6 text-right">
                            <AppointmentStatusBadge status={appt.status} />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </MasterTableBody>
                </MasterTable>
              </div>
            </TabsContent>

            <TabsContent value="records" className="mt-6">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <MasterTable showHeader={false}>
                  <MasterTableHeader>
                    <TableRow className="border-none hover:bg-transparent bg-slate-50/50">
                      <TableHead className="pl-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">ID Bệnh Án</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Tham chiếu (Từ Ca Khám)</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Chẩn đoán</TableHead>
                      <TableHead className="pr-6 text-right text-[10px] font-bold uppercase tracking-widest text-slate-500">Ngày tạo</TableHead>
                    </TableRow>
                  </MasterTableHeader>
                  <MasterTableBody>
                    {medicalRecords.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="p-0">
                          <EmptyState title="Chưa có bệnh án nào" />
                        </TableCell>
                      </TableRow>
                    ) : (
                      medicalRecords.map((record) => (
                        <TableRow key={record.id} className="hover:bg-slate-50">
                          <TableCell className="pl-6 font-semibold text-purple-600">{record.recordCode}</TableCell>
                          <TableCell className="font-medium text-slate-600">LH{String(record.appointmentId).padStart(3, "0")}</TableCell>
                          <TableCell className="text-slate-800 font-medium">{record.diagnosis || "---"}</TableCell>
                          <TableCell className="pr-6 text-right text-slate-500">{formatDateVi(record.createdAt)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </MasterTableBody>
                </MasterTable>
              </div>
            </TabsContent>

            <TabsContent value="payments" className="mt-6">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <MasterTable showHeader={false}>
                  <MasterTableHeader>
                    <TableRow className="border-none hover:bg-transparent bg-slate-50/50">
                      <TableHead className="pl-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">Mã Hóa Đơn</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Tham chiếu Bệnh Án</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Tổng tiền</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Trạng thái</TableHead>
                      <TableHead className="pr-6 text-right text-[10px] font-bold uppercase tracking-widest text-slate-500">Ngày tạo</TableHead>
                    </TableRow>
                  </MasterTableHeader>
                  <MasterTableBody>
                    {payments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="p-0">
                          <EmptyState title="Chưa có hóa đơn nào" />
                        </TableCell>
                      </TableRow>
                    ) : (
                      payments.map((payment) => (
                        <TableRow key={payment.id} className="hover:bg-slate-50">
                          <TableCell className="pl-6 font-semibold text-emerald-600">{payment.paymentCode}</TableCell>
                          <TableCell className="font-medium text-slate-600">BA{String(payment.prescriptionId).padStart(3, "0")}</TableCell>
                          <TableCell className="text-slate-800 font-bold">{payment.totalPrice.toLocaleString("vi-VN")} đ</TableCell>
                          <TableCell>
                            <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                              payment.status === "PAID" ? "bg-emerald-50 text-emerald-800 border-emerald-200" :
                              payment.status === "CANCELLED" ? "bg-slate-100 text-slate-600 border-slate-200" :
                              "bg-amber-50 text-amber-800 border-amber-200"
                            }`}>
                              {payment.status === "PAID" ? "Đã thanh toán" : payment.status === "CANCELLED" ? "Đã hủy" : "Chưa thanh toán"}
                            </span>
                          </TableCell>
                          <TableCell className="pr-6 text-right text-slate-500">{formatDateVi(payment.createdAt)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </MasterTableBody>
                </MasterTable>
              </div>
            </TabsContent>

          </Tabs>
        </div>
      </div>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Xác nhận xóa bệnh nhân"
        description={
          <span>Bạn có chắc muốn xóa hồ sơ <strong>{patient.full_name}</strong>? Hệ thống sẽ dọn dẹp các lịch hẹn chờ. (Không thể xóa nếu bệnh nhân đã có bệnh án).</span>
        }
        variant="destructive"
        confirmLabel="Xóa an toàn"
        loading={deleteMutation.isPending}
        onConfirm={() => {
          deleteMutation.mutate(patient.id, {
            onSuccess: () => {
              setIsDeleteDialogOpen(false)
              toast.success("Đã xóa bệnh nhân thành công.")
              router.push(ROUTES.ADMIN.PATIENTS)
            },
            onError: () => {
              setIsDeleteDialogOpen(false)
              toast.error("Không thể xóa: Bệnh nhân này đã có bệnh án hoặc giao dịch.")
            }
          })
        }}
      />
    </div>
  )
}
