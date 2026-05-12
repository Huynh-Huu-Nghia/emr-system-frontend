"use client"

import { useMemo, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  MasterTable,
  MasterTableHeader,
  MasterTableBody,
} from "@/components/ui/master-table"
import { TableRow, TableCell, TableHead } from "@/components/ui/table"
import type { Patient } from "@/core/api/patientService"
import { GENDER_LABELS } from "@/lib/constants"
import { Plus, Pencil, Search, Trash2, UserRound } from "lucide-react"
import { PatientDialog } from "@/components/reception/patient-dialog"
import { ConfirmDialog } from "@/shared/components/dialog/confirm-dialog"
import { EmptyState } from "@/shared/components/states/empty-state"
import { ErrorState } from "@/shared/components/states/error-state"
import { LoadingBlock } from "@/shared/components/states/loading-block"
import { formatDateVi } from "@/shared/lib/format/date"
import { normalizeUnknownError } from "@/shared/lib/error/normalize-api-error"
import { useDeletePatientMutation } from "@/modules/patient/hooks/use-delete-patient-mutation"
import { usePatientsQuery } from "@/modules/patient/hooks/use-patients-query"
import { queryKeys } from "@/shared/query/query-keys"

type GenderFilter = "ALL" | "MALE" | "FEMALE" | "OTHER"
type InsuranceFilter = "ALL" | "HAS" | "NONE"

export default function PatientsPage() {
  const qc = useQueryClient()
  const {
    data: patients = [],
    isPending,
    isError,
    error,
    refetch,
  } = usePatientsQuery()

  const deleteMutation = useDeletePatientMutation()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [genderFilter, setGenderFilter] = useState<GenderFilter>("ALL")
  const [insuranceFilter, setInsuranceFilter] =
    useState<InsuranceFilter>("ALL")
  const [deleteTarget, setDeleteTarget] = useState<Patient | null>(null)

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const query = searchQuery.trim().toLowerCase()
      const matchesSearch =
        !query ||
        patient.full_name.toLowerCase().includes(query) ||
        patient.medicalHistoryNumber.toLowerCase().includes(query) ||
        patient.phone.toLowerCase().includes(query) ||
        (patient.insurance_code ?? "").toLowerCase().includes(query)

      const matchesGender =
        genderFilter === "ALL" || patient.gender === genderFilter

      const matchesInsurance =
        insuranceFilter === "ALL" ||
        (insuranceFilter === "HAS" && !!patient.insurance_code) ||
        (insuranceFilter === "NONE" && !patient.insurance_code)

      return matchesSearch && matchesGender && matchesInsurance
    })
  }, [patients, searchQuery, genderFilter, insuranceFilter])

  const errorMessage =
    error != null ? normalizeUnknownError(error).message : undefined

  const clearFilters = () => {
    setSearchQuery("")
    setGenderFilter("ALL")
    setInsuranceFilter("ALL")
  }

  const handleOpenDialog = (patient: Patient | null = null) => {
    setEditingPatient(patient)
    setIsModalOpen(true)
  }

  const invalidatePatients = () =>
    qc.invalidateQueries({ queryKey: queryKeys.patients.all })

  return (
    <div className="min-h-screen bg-[#fafafa] p-6 lg:p-8 space-y-8">
      <PageHeader
        title="Quản lý Bệnh nhân"
        description="Tra cứu và quản lý thông tin bệnh nhân toàn hệ thống"
      >
        <Button
          onClick={() => handleOpenDialog()}
          className="rounded-full px-6 h-11 bg-medical-primary hover:bg-medical-dark shadow-lg shadow-medical-primary/20 transition-all active:scale-95"
        >
          <Plus className="mr-2 h-5 w-5" /> Tiếp nhận mới
        </Button>
      </PageHeader>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr_1fr_120px] items-end">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Tìm kiếm nhanh
              </label>
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm mã hồ sơ, tên, SĐT, mã BHYT"
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Giới tính
              </label>
              <Select
                value={genderFilter}
                onValueChange={(value) => setGenderFilter(value as GenderFilter)}
              >
                <SelectTrigger className="w-full" size="sm">
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả</SelectItem>
                  <SelectItem value="MALE">Nam</SelectItem>
                  <SelectItem value="FEMALE">Nữ</SelectItem>
                  <SelectItem value="OTHER">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                BHYT
              </label>
              <Select
                value={insuranceFilter}
                onValueChange={(value) =>
                  setInsuranceFilter(value as InsuranceFilter)
                }
              >
                <SelectTrigger className="w-full" size="sm">
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả</SelectItem>
                  <SelectItem value="HAS">Có BHYT</SelectItem>
                  <SelectItem value="NONE">Không BHYT</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={clearFilters}
              >
                Xóa lọc
              </Button>
            </div>
          </div>
        </div>

        <MasterTable showHeader={false}>
          <MasterTableHeader>
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="w-[130px] pl-8 font-bold uppercase text-[10px] tracking-widest text-medical-dark/70">
                Mã hồ sơ
              </TableHead>
              <TableHead className="w-[220px] font-bold uppercase text-[10px] tracking-widest text-medical-dark/70">
                Họ và Tên
              </TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest text-medical-dark/70">
                Giới tính
              </TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest text-medical-dark/70">
                Ngày sinh
              </TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest text-medical-dark/70">
                Điện thoại
              </TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest text-medical-dark/70">
                Mã BHYT
              </TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest text-medical-dark/70 text-right pr-8">
                Thao tác
              </TableHead>
            </TableRow>
          </MasterTableHeader>
          <MasterTableBody>
            {isPending ? (
              <TableRow>
                <TableCell colSpan={7} className="p-0">
                  <LoadingBlock message="Đang tải danh sách…" />
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={7} className="p-0">
                  <ErrorState
                    description={errorMessage}
                    onRetry={() => void refetch()}
                  />
                </TableCell>
              </TableRow>
            ) : patients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="p-0">
                  <EmptyState
                    title="Chưa có bệnh nhân nào"
                    description="Bắt đầu bằng cách tiếp nhận hồ sơ mới."
                  />
                </TableCell>
              </TableRow>
            ) : filteredPatients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="p-0">
                  <EmptyState title="Không có bệnh nhân phù hợp" />
                </TableCell>
              </TableRow>
            ) : (
              filteredPatients.map((p) => (
                <TableRow
                  key={p.id}
                  className="group hover:bg-slate-50 transition-colors"
                >
                  <TableCell className="pl-8 font-medium text-medical-primary">
                    #{p.medicalHistoryNumber}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                        <UserRound className="h-4 w-4" />
                      </div>
                      <span className="font-semibold text-slate-700">
                        {p.full_name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                        p.gender === "MALE"
                          ? "bg-blue-50 text-blue-600"
                          : p.gender === "FEMALE"
                            ? "bg-pink-50 text-pink-600"
                            : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {GENDER_LABELS[p.gender]}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-slate-600">{formatDateVi(p.dob)}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-slate-700 font-medium">{p.phone}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-slate-500">
                      {p.insurance_code || "---"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right pr-8 flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={deleteMutation.isPending}
                      onClick={() => handleOpenDialog(p)}
                      className="rounded-full hover:bg-medical-primary hover:text-white transition-all shadow-none"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      disabled={deleteMutation.isPending}
                      onClick={() => setDeleteTarget(p)}
                      className="rounded-full shadow-none"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </MasterTableBody>
        </MasterTable>
      </div>

      <PatientDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingPatient}
        onSuccess={() => void invalidatePatients()}
      />

      <ConfirmDialog
        open={deleteTarget != null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        title="Xác nhận xóa bệnh nhân"
        description={
          deleteTarget ? (
            <span>
              Bạn có chắc muốn xóa <strong>{deleteTarget.full_name}</strong>?
            </span>
          ) : null
        }
        variant="destructive"
        confirmLabel="Xóa"
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (!deleteTarget) return
          deleteMutation.mutate(deleteTarget.id, {
            onSuccess: () => setDeleteTarget(null),
          })
        }}
      />
    </div>
  )
}
