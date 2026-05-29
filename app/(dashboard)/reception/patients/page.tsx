"use client"

import { useMemo, useState } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { PatientDialog } from "@/components/reception/patient-dialog"
import { PatientViewDialog } from "@/components/reception/patient-view-dialog"
import { ConfirmDialog } from "@/shared/components/dialog/confirm-dialog"
import { normalizeUnknownError } from "@/shared/lib/error/normalize-api-error"
import { useDeletePatientMutation } from "@/modules/patient/hooks/use-delete-patient-mutation"
import { usePatientsQuery } from "@/modules/patient/hooks/use-patients-query"
import { PatientFiltersToolbar } from "@/modules/patient/components/patient-filters-toolbar"
import { PatientsTable } from "@/modules/patient/components/patients-table"
import { filterPatients } from "@/modules/patient/lib/filter-patients"
import type { Patient } from "@/modules/patient/types"
import type {
  PatientGenderFilter,
  PatientInsuranceFilter,
} from "@/modules/patient/types"

export default function PatientsPage() {
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
  const [genderFilter, setGenderFilter] = useState<PatientGenderFilter>("ALL")
  const [insuranceFilter, setInsuranceFilter] =
    useState<PatientInsuranceFilter>("ALL")
  const [deleteTarget, setDeleteTarget] = useState<Patient | null>(null)
  const [viewTarget, setViewTarget] = useState<Patient | null>(null)

  const filteredPatients = useMemo(
    () =>
      filterPatients(patients, {
        searchQuery,
        genderFilter,
        insuranceFilter,
      }),
    [patients, searchQuery, genderFilter, insuranceFilter]
  )

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

  return (
    <div className="min-h-screen space-y-8 bg-[#fafafa] p-6 lg:p-8">
      <PageHeader
        title="Quản lý Bệnh nhân"
        description="Tra cứu và quản lý thông tin bệnh nhân toàn hệ thống"
      >
        <Button
          onClick={() => handleOpenDialog()}
          className="h-11 rounded-full bg-medical-primary px-6 shadow-lg shadow-medical-primary/20 transition-all hover:bg-medical-dark active:scale-95"
        >
          <Plus className="mr-2 h-5 w-5" /> Tiếp nhận mới
        </Button>
      </PageHeader>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <PatientFiltersToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          genderFilter={genderFilter}
          onGenderChange={setGenderFilter}
          insuranceFilter={insuranceFilter}
          onInsuranceChange={setInsuranceFilter}
          onClearFilters={clearFilters}
        />
        <PatientsTable
          isPending={isPending}
          isError={isError}
          errorMessage={errorMessage}
          onRetry={() => void refetch()}
          patients={patients}
          filteredPatients={filteredPatients}
          deletePending={deleteMutation.isPending}
          onEdit={(p) => handleOpenDialog(p)}
          onView={setViewTarget}
          onDeleteRequest={setDeleteTarget}
        />
      </div>

      <PatientDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingPatient}
      />

      <PatientViewDialog
        isOpen={viewTarget != null}
        onClose={() => setViewTarget(null)}
        patient={viewTarget}
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
