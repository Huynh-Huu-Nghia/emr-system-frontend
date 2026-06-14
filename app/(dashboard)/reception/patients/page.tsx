"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Plus, RefreshCw } from "lucide-react"
import { PatientDialog } from "@/components/reception/patient-dialog"
import { PatientViewDialog } from "@/components/reception/patient-view-dialog"
import { ConfirmDialog } from "@/shared/components/dialog/confirm-dialog"
import { normalizeUnknownError } from "@/shared/lib/error/normalize-api-error"
import { useDeletePatientMutation } from "@/modules/patient/hooks/use-delete-patient-mutation"
import { usePatientsQuery } from "@/modules/patient/hooks/use-patients-query"
import { PatientFiltersToolbar } from "@/modules/patient/components/patient-filters-toolbar"
import { PatientsTable } from "@/modules/patient/components/patients-table"
import { filterPatients } from "@/modules/patient/lib/filter-patients"
import { cn } from "@/lib/utils"
import type { Patient, PatientGenderFilter, PatientInsuranceFilter, PatientSortOption } from "@/modules/patient/types"

const AUTO_REFRESH_INTERVAL = 30_000

export default function PatientsPage() {
  const { data: patients = [], isPending, isError, error, refetch } = usePatientsQuery()
  const deleteMutation = useDeletePatientMutation()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [genderFilter, setGenderFilter] = useState<PatientGenderFilter>("ALL")
  const [insuranceFilter, setInsuranceFilter] = useState<PatientInsuranceFilter>("ALL")
  const [sortBy, setSortBy] = useState<PatientSortOption>("NEWEST")
  const [deleteTarget, setDeleteTarget] = useState<Patient | null>(null)
  const [viewTarget, setViewTarget] = useState<Patient | null>(null)
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

  const filteredPatients = useMemo(
    () => filterPatients(patients, { searchQuery, genderFilter, insuranceFilter, sortBy }),
    [patients, searchQuery, genderFilter, insuranceFilter, sortBy]
  )

  const errorMessage = error != null ? normalizeUnknownError(error).message : undefined

  const clearFilters = () => {
    setSearchQuery("")
    setGenderFilter("ALL")
    setInsuranceFilter("ALL")
    setSortBy("NEWEST")
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
        <div className="flex items-center gap-3">
          <Button
            variant="outline" size="sm"
            onClick={() => void handleRefresh()}
            disabled={isRefreshing}
            className="gap-2 rounded-xl border-slate-200 bg-white shadow-sm"
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            Làm mới
          </Button>
          <Button
            onClick={() => handleOpenDialog()}
            className="h-11 rounded-full bg-medical-primary px-6 shadow-lg shadow-medical-primary/20 transition-all hover:bg-medical-dark active:scale-95"
          >
            <Plus className="mr-2 h-5 w-5" /> Tiếp nhận mới
          </Button>
        </div>
      </PageHeader>

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

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <PatientFiltersToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          genderFilter={genderFilter}
          onGenderChange={setGenderFilter}
          insuranceFilter={insuranceFilter}
          onInsuranceChange={setInsuranceFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
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
          canDelete={false}
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
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
        title="Xác nhận xóa bệnh nhân"
        description={
          deleteTarget ? (
            <span>Bạn có chắc muốn xóa <strong>{deleteTarget.full_name}</strong>?</span>
          ) : null
        }
        variant="destructive"
        confirmLabel="Xóa"
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (!deleteTarget) return
          deleteMutation.mutate(deleteTarget.id, {
            onSuccess: () => { setDeleteTarget(null); void handleRefresh() },
          })
        }}
      />
    </div>
  )
}