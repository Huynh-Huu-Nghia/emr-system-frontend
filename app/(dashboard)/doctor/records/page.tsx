"use client"

import { useState, useEffect, useCallback } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, FileText, Eye, RefreshCw, ArrowUp, ArrowDown, Printer } from "lucide-react"
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
import {
  medicalRecordService,
  type MedicalRecord,
} from "@/core/api/medicalRecordService"
import {
  prescriptionService,
  type Prescription,
} from "@/core/api/prescriptionService"
import { cn } from "@/lib/utils"

const AUTO_REFRESH_INTERVAL = 30_000

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

  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  const { data: records = [], isPending, isError, refetch } = useQuery({
    queryKey: ["medical-records", "list"],
    queryFn: () => medicalRecordService.getAll(),
  })

  useEffect(() => {
    const interval = setInterval(() => {
      void refetch().then(() => setLastUpdated(new Date()))
    }, AUTO_REFRESH_INTERVAL)

    return () => clearInterval(interval)
  }, [refetch])

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    await refetch()
    setLastUpdated(new Date())
    setIsRefreshing(false)
  }, [refetch])

  const filteredRecords = (searchQuery.trim()
    ? records.filter((r) => {
        const q = searchQuery.toLowerCase()
        return (
          r.diagnosis.toLowerCase().includes(q) ||
          r.symptoms.toLowerCase().includes(q) ||
          r.recordType.toLowerCase().includes(q) ||
          (r.patientName && r.patientName.toLowerCase().includes(q)) ||
          String(r.id).includes(q)
        )
      })
    : [...records]
  ).sort((a, b) => sortOrder === "asc" ? a.id - b.id : b.id - a.id)

  const handleView = async (record: MedicalRecord) => {
    setViewTarget(record)
    setPrescription(null)
    setLoadingPrescription(true)

    try {
      const p = await prescriptionService.getByMedicalRecordId(record.id)
      setPrescription(p)
    } catch {
      // no prescription
    } finally {
      setLoadingPrescription(false)
    }
  }

  if (isPending) return <LoadingBlock />
  if (isError)
    return (
      <ErrorState
        description="Không thể tải danh sách bệnh án"
        onRetry={() => void refetch()}
      />
    )

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
      
    {/* Search + Refresh toolbar */}
<div className="flex items-center gap-3">
  <div className="relative flex-1">
    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    <Input
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      placeholder="Tìm theo bệnh nhân, chẩn đoán, triệu chứng..."
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
    <RefreshCw
      className={cn("h-4 w-4", isRefreshing && "animate-spin")}
    />
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
    {lastUpdated.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })}
  </span>
</div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        {filteredRecords.length === 0 ? (
          <EmptyState title="Không tìm thấy bệnh án" />
        ) : (
          <MasterTable showHeader={false}>
            <MasterTableHeader>
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="w-24 pl-6 text-[10px] font-bold uppercase tracking-widest text-medical-dark/70">
                  <Button variant="ghost" className="-ml-3 h-8 px-2 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-100" onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}>
                    Mã Bệnh Án
                    {sortOrder === "desc" ? <ArrowDown className="ml-1.5 h-3 w-3" /> : <ArrowUp className="ml-1.5 h-3 w-3" />}
                  </Button>
                </TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-medical-dark/70">
                  Bệnh nhân
                </TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-medical-dark/70">
                  Chuyên khoa
                </TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-medical-dark/70">
                  Triệu chứng
                </TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-medical-dark/70">
                  Chẩn đoán
                </TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-medical-dark/70">
                  Ngày khám
                </TableHead>
                <TableHead className="pr-8 text-right text-[10px] font-bold uppercase tracking-widest text-medical-dark/70">
                  Xem
                </TableHead>
              </TableRow>
            </MasterTableHeader>

            <MasterTableBody>
              {filteredRecords.map((record) => (
                <TableRow
                  key={record.id}
                  className="group transition-colors hover:bg-slate-50"
                >
                  <TableCell className="pl-8 font-mono text-sm font-medium text-medical-primary">
                    {record.recordCode}
                  </TableCell>

                  <TableCell className="font-medium text-slate-800">
                    {record.patientName || "—"}
                  </TableCell>

                  <TableCell>
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                      {RECORD_TYPE_LABELS[record.recordType] ??
                        record.recordType}
                    </span>
                  </TableCell>

                  <TableCell className="max-w-[200px] truncate text-sm text-slate-600">
                    {record.symptoms}
                  </TableCell>

                  <TableCell className="max-w-[200px] truncate text-sm font-semibold text-slate-700">
                    {record.diagnosis}
                  </TableCell>

                  <TableCell className="text-sm text-slate-500">
                    {new Date(record.createdAt).toLocaleDateString("vi-VN")}
                  </TableCell>

                  <TableCell className="pr-8 text-right">
                    <div className="flex items-center justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleView(record)}
                        className="rounded-full shadow-none transition-all hover:bg-slate-100"
                        title="Xem chi tiết"
                      >
                        <Eye className="h-4 w-4 text-slate-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </MasterTableBody>
          </MasterTable>
        )}
      </div>

      <MasterModal
        open={viewTarget != null}
        onOpenChange={(open) => {
          if (!open) setViewTarget(null)
        }}
      >
        <MasterModalContent className="sm:max-w-lg">
          <MasterModalHeader
            title={viewTarget ? `Bệnh án ${viewTarget.recordCode}` : ""}
          />

          {viewTarget && (
            <div className="space-y-4 px-6 py-5 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Chuyên khoa</p>
                  <p className="font-medium">
                    {RECORD_TYPE_LABELS[viewTarget.recordType] ??
                      viewTarget.recordType}
                  </p>
                </div>

                <div>
                  <p className="text-slate-500">Ngày khám</p>
                  <p className="font-medium">
                    {new Date(viewTarget.createdAt).toLocaleString("vi-VN")}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Triệu chứng
                </p>
                <p className="rounded-lg bg-slate-50 p-3 text-sm">
                  {viewTarget.symptoms}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Chẩn đoán
                </p>
                <p className="rounded-lg bg-slate-50 p-3 text-sm font-medium">
                  {viewTarget.diagnosis}
                </p>
              </div>

              {viewTarget.treatmentPlan && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    Hướng điều trị
                  </p>
                  <p className="rounded-lg bg-slate-50 p-3 text-sm">
                    {viewTarget.treatmentPlan}
                  </p>
                </div>
              )}

              {loadingPrescription && (
                <p className="text-sm text-slate-400">
                  Đang tải đơn thuốc...
                </p>
              )}

              {prescription &&
                prescription.details &&
                prescription.details.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Đơn thuốc
                    </p>

                    <div className="rounded-lg border border-slate-200">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-3 py-2 text-left font-medium text-slate-600">
                              Thuốc ID
                            </th>
                            <th className="px-3 py-2 text-right font-medium text-slate-600">
                              SL
                            </th>
                            <th className="px-3 py-2 text-left font-medium text-slate-600">
                              Liều dùng
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {prescription.details.map((d) => (
                            <tr key={d.id} className="border-t border-slate-100">
                              <td className="px-3 py-2 font-mono">
                                #{d.medicineId}
                              </td>
                              <td className="px-3 py-2 text-right">
                                {d.quantity}
                              </td>
                              <td className="px-3 py-2">{d.dosage}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {prescription.notes && (
                      <p className="text-xs text-slate-500">
                        Ghi chú: {prescription.notes}
                      </p>
                    )}

                    <p className="text-right text-sm font-semibold text-medical-primary">
                      Tổng:{" "}
                      {Number(prescription.totalPrice).toLocaleString("vi-VN")}đ
                    </p>
                  </div>
                )}

              <MasterModalFooter>
                {prescription && prescription.details && prescription.details.length > 0 && (
                  <Button
                    variant="default"
                    onClick={() => window.open(`/print/prescription/${viewTarget.id}`, '_blank')}
                    className="mr-auto gap-2"
                  >
                    <Printer className="h-4 w-4" />
                    In Toa Thuốc
                  </Button>
                )}
                <MasterModalAction
                  variant="secondary"
                  onClick={() => setViewTarget(null)}
                >
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