"use client"

import { useState } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, FileText, Eye } from "lucide-react"
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
import { LoadingBlock } from "@/shared/components/states/loading-block"
import { ErrorState } from "@/shared/components/states/error-state"
import { EmptyState } from "@/shared/components/states/empty-state"
import { useQuery } from "@tanstack/react-query"
import { medicalRecordService, type MedicalRecord } from "@/core/api/medicalRecordService"
import { prescriptionService, type Prescription } from "@/core/api/prescriptionService"

const RECORD_TYPE_LABELS: Record<string, string> = {
  GENERAL: "Tổng quát",
  PEDIATRICS: "Nhi khoa",
  DENTAL: "Răng hàm mặt",
  CARDIOLOGY: "Tim mạch",
  DERMATOLOGY: "Da liễu",
}

export default function DoctorRecordsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [viewTarget, setViewTarget] = useState<MedicalRecord | null>(null)
  const [prescription, setPrescription] = useState<Prescription | null>(null)
  const [loadingPrescription, setLoadingPrescription] = useState(false)

  const { data: records = [], isPending, isError, refetch } = useQuery({
    queryKey: ["medical-records", "list"],
    queryFn: () => medicalRecordService.getAll(),
  })

  const filteredRecords = searchQuery.trim()
    ? records.filter(
        (r) =>
          r.diagnosis.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.symptoms.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.recordType.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : records

  const handleView = async (record: MedicalRecord) => {
    setViewTarget(record)
    setPrescription(null)
    setLoadingPrescription(true)
    try {
      const p = await prescriptionService.getByMedicalRecordId(record.id)
      setPrescription(p)
    } catch {
      // no prescription for this record
    } finally {
      setLoadingPrescription(false)
    }
  }

  if (isPending) return <LoadingBlock />
  if (isError) return <ErrorState description="Không thể tải danh sách bệnh án" onRetry={() => void refetch()} />

  return (
    <div className="min-h-screen space-y-8 bg-[#fafafa] p-6 lg:p-8">
      <PageHeader
        title="Bệnh án"
        description="Tra cứu lịch sử khám bệnh và bệnh án"
      >
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <FileText className="h-4 w-4" />
          {records.length} bệnh án
        </div>
      </PageHeader>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo chẩn đoán, triệu chứng..."
              className="pl-9"
            />
          </div>
        </div>

        {filteredRecords.length === 0 ? (
          <EmptyState title="Không tìm thấy bệnh án" />
        ) : (
          <MasterTable showHeader={false}>
            <MasterTableHeader>
              <TableRow>
                <TableHead className="w-16">ID</TableHead>
                <TableHead>Chuyên khoa</TableHead>
                <TableHead>Triệu chứng</TableHead>
                <TableHead>Chẩn đoán</TableHead>
                <TableHead>Ngày khám</TableHead>
                <TableHead className="text-right">Xem</TableHead>
              </TableRow>
            </MasterTableHeader>
            <MasterTableBody>
              {filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-mono text-sm text-slate-500">{record.id}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                      {RECORD_TYPE_LABELS[record.recordType] ?? record.recordType}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-sm text-slate-600">
                    {record.symptoms}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-sm font-medium">
                    {record.diagnosis}
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {new Date(record.createdAt).toLocaleDateString("vi-VN")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleView(record)}>
                      <Eye className="h-4 w-4 text-slate-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </MasterTableBody>
          </MasterTable>
        )}
      </div>

      {/* Detail Modal */}
      <MasterModal open={viewTarget != null} onOpenChange={(open) => { if (!open) setViewTarget(null) }}>
        <MasterModalContent className="sm:max-w-lg">
          <MasterModalHeader title={viewTarget ? `Bệnh án #${viewTarget.id}` : ""} />
          {viewTarget && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Chuyên khoa</p>
                  <p className="font-medium">{RECORD_TYPE_LABELS[viewTarget.recordType] ?? viewTarget.recordType}</p>
                </div>
                <div>
                  <p className="text-slate-500">Ngày khám</p>
                  <p className="font-medium">{new Date(viewTarget.createdAt).toLocaleString("vi-VN")}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase text-slate-400">Triệu chứng</p>
                <p className="rounded-lg bg-slate-50 p-3 text-sm">{viewTarget.symptoms}</p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase text-slate-400">Chẩn đoán</p>
                <p className="rounded-lg bg-slate-50 p-3 text-sm font-medium">{viewTarget.diagnosis}</p>
              </div>

              {viewTarget.treatmentPlan && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase text-slate-400">Hướng điều trị</p>
                  <p className="rounded-lg bg-slate-50 p-3 text-sm">{viewTarget.treatmentPlan}</p>
                </div>
              )}

              {loadingPrescription && <p className="text-sm text-slate-400">Đang tải đơn thuốc...</p>}
              {prescription && prescription.details && prescription.details.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase text-slate-400">Đơn thuốc</p>
                  <div className="rounded-lg border border-slate-200">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-slate-600">Thuốc ID</th>
                          <th className="px-3 py-2 text-right font-medium text-slate-600">SL</th>
                          <th className="px-3 py-2 text-left font-medium text-slate-600">Liều dùng</th>
                        </tr>
                      </thead>
                      <tbody>
                        {prescription.details.map((d) => (
                          <tr key={d.id} className="border-t border-slate-100">
                            <td className="px-3 py-2 font-mono">#{d.medicineId}</td>
                            <td className="px-3 py-2 text-right">{d.quantity}</td>
                            <td className="px-3 py-2">{d.dosage}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {prescription.notes && (
                    <p className="text-xs text-slate-500">Ghi chú: {prescription.notes}</p>
                  )}
                  <p className="text-right text-sm font-semibold text-medical-primary">
                    Tổng: {Number(prescription.totalPrice).toLocaleString("vi-VN")}đ
                  </p>
                </div>
              )}

              <MasterModalFooter>
                <MasterModalAction variant="secondary" onClick={() => setViewTarget(null)}>
                  Đóng
                </MasterModalAction>
              </MasterModalFooter>
            </div>
          )}
        </MasterModalContent>
      </MasterModal>
    </div>
  )
}
