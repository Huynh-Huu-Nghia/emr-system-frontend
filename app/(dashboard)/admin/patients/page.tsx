"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { RefreshCw, Trash2 } from "lucide-react"
import { ConfirmDialog } from "@/shared/components/dialog/confirm-dialog"
import { normalizeUnknownError } from "@/shared/lib/error/normalize-api-error"
import { useDeletePatientMutation } from "@/modules/patient/hooks/use-delete-patient-mutation"
import { usePatientsQuery } from "@/modules/patient/hooks/use-patients-query"
import { PatientFiltersToolbar } from "@/modules/patient/components/patient-filters-toolbar"
import { PatientsTable } from "@/modules/patient/components/patients-table"
import { filterPatients } from "@/modules/patient/lib/filter-patients"
import { cn } from "@/lib/utils"
import type { Patient, PatientGenderFilter, PatientInsuranceFilter, PatientSortOption } from "@/modules/patient/types"
import { ROUTES } from "@/constants/routes"
import { toast } from "sonner"

const AUTO_REFRESH_INTERVAL = 30_000

export default function AdminPatientsPage() {
  const router = useRouter()
  const { data: patients = [], isPending, isError, error, refetch } = usePatientsQuery()
  const deleteMutation = useDeletePatientMutation()

  const [searchQuery, setSearchQuery] = useState("")
  const [genderFilter, setGenderFilter] = useState<PatientGenderFilter>("ALL")
  const [insuranceFilter, setInsuranceFilter] = useState<PatientInsuranceFilter>("ALL")
  const [sortBy, setSortBy] = useState<PatientSortOption>("NEWEST")
  const [deleteTarget, setDeleteTarget] = useState<Patient | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // Selection states
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false)
  const [bulkDeleteProgress, setBulkDeleteProgress] = useState<{ total: number, success: number, fail: number } | null>(null)

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

  const handleToggleSelection = (id: number) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setSelectedIds(newSet)
  }

  const handleToggleAll = (selectAll: boolean) => {
    if (selectAll) {
      setSelectedIds(new Set(filteredPatients.map((p) => p.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return
    const ids = Array.from(selectedIds)
    let successCount = 0
    let failCount = 0

    setBulkDeleteProgress({ total: ids.length, success: 0, fail: 0 })

    for (const id of ids) {
      try {
        await deleteMutation.mutateAsync(id)
        successCount++
      } catch (err) {
        failCount++
      }
      setBulkDeleteProgress({ total: ids.length, success: successCount, fail: failCount })
    }

    if (failCount > 0) {
      toast.error(`Xóa thất bại ${failCount} bệnh nhân (có thể do đã có bệnh án)`)
    }
    if (successCount > 0) {
      toast.success(`Đã xóa thành công ${successCount} bệnh nhân test`)
    }

    setSelectedIds(new Set())
    setBulkDeleteProgress(null)
    setIsBulkDeleteModalOpen(false)
    void handleRefresh()
  }

  return (
    <div className="min-h-screen space-y-8 bg-[#fafafa] p-6 lg:p-8">
      <PageHeader
        title="Quản lý Bệnh nhân (Admin)"
        description="Tra cứu, kiểm toán và dọn dẹp dữ liệu hồ sơ y tế"
      >
        <div className="flex items-center gap-3">
          {selectedIds.size > 0 && (
            <Button
              variant="destructive"
              onClick={() => setIsBulkDeleteModalOpen(true)}
              className="gap-2 rounded-xl shadow-sm"
            >
              <Trash2 className="h-4 w-4" />
              Xóa {selectedIds.size} dòng
            </Button>
          )}
          <Button
            variant="outline" size="sm"
            onClick={() => void handleRefresh()}
            disabled={isRefreshing}
            className="gap-2 rounded-xl border-slate-200 bg-white shadow-sm"
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            Làm mới
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
          deletePending={deleteMutation.isPending || bulkDeleteProgress != null}
          canDelete={true}
          enableSelection={true}
          selectedIds={selectedIds}
          onToggleSelection={handleToggleSelection}
          onToggleAll={handleToggleAll}
          onView={(p) => router.push(`${ROUTES.ADMIN.PATIENTS}/${p.id}`)}
          onDeleteRequest={setDeleteTarget}
        />
      </div>

      <ConfirmDialog
        open={deleteTarget != null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
        title="Xác nhận xóa bệnh nhân"
        description={
          deleteTarget ? (
            <span>Bạn có chắc muốn xóa hồ sơ <strong>{deleteTarget.full_name}</strong>? Hệ thống sẽ dọn dẹp các lịch hẹn chờ. (Không thể xóa nếu bệnh nhân đã có bệnh án).</span>
          ) : null
        }
        variant="destructive"
        confirmLabel="Xóa an toàn"
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (!deleteTarget) return
          deleteMutation.mutate(deleteTarget.id, {
            onSuccess: () => { setDeleteTarget(null); void handleRefresh(); toast.success("Đã xóa bệnh nhân thành công.") },
            onError: (err) => { setDeleteTarget(null); toast.error("Không thể xóa: Bệnh nhân này đã có bệnh án hoặc giao dịch.") }
          })
        }}
      />

      <ConfirmDialog
        open={isBulkDeleteModalOpen}
        onOpenChange={(open) => { if (!open && !bulkDeleteProgress) setIsBulkDeleteModalOpen(false) }}
        title={`Xóa hàng loạt ${selectedIds.size} bệnh nhân`}
        description={
          bulkDeleteProgress ? (
            <div className="space-y-2">
              <p>Đang tiến hành dọn dẹp...</p>
              <div className="w-full bg-slate-200 rounded-full h-2.5">
                <div className="bg-red-600 h-2.5 rounded-full" style={{ width: `${((bulkDeleteProgress.success + bulkDeleteProgress.fail) / bulkDeleteProgress.total) * 100}%` }}></div>
              </div>
              <p className="text-sm text-slate-500">Thành công: {bulkDeleteProgress.success} | Thất bại (giữ lại an toàn): {bulkDeleteProgress.fail}</p>
            </div>
          ) : (
            <span>Bạn có chắc muốn chạy lệnh dọn dẹp hàng loạt? Tính năng này sẽ quét {selectedIds.size} hồ sơ và <strong>tự động giữ lại các hồ sơ có chứa Bệnh án</strong>. Các hồ sơ rỗng/test sẽ bị xóa vĩnh viễn.</span>
          )
        }
        variant="destructive"
        confirmLabel={bulkDeleteProgress ? "Đang xử lý..." : "Chạy dọn dẹp"}
        loading={bulkDeleteProgress != null}
        onConfirm={() => void handleBulkDelete()}
      />
    </div>
  )
}
