"use client"

import { useState, useEffect, useCallback } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Pencil, Trash2, AlertTriangle, Search, RefreshCw } from "lucide-react"
import {
  MasterTable,
  MasterTableHeader,
  MasterTableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/master-table"
import { ConfirmDialog } from "@/shared/components/dialog/confirm-dialog"
import { LoadingBlock } from "@/shared/components/states/loading-block"
import { ErrorState } from "@/shared/components/states/error-state"
import { EmptyState } from "@/shared/components/states/empty-state"
import { useMedicinesQuery } from "@/modules/admin/hooks/use-medicines-query"
import { useDeleteMedicineMutation } from "@/modules/admin/hooks/use-medicine-mutations"
import { MedicineDialog } from "@/modules/admin/components/medicine-dialog"
import { isLowStock, isExpiringSoon, isExpired } from "@/core/api/medicineService"
import { cn } from "@/lib/utils"
import type { Medicine } from "@/core/api/medicineService"

const AUTO_REFRESH_INTERVAL = 30_000

export default function AdminMedicinesPage() {
  const { data: medicines = [], isPending, isError, refetch } = useMedicinesQuery()
  const deleteMutation = useDeleteMedicineMutation()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Medicine | null>(null)
  const [search, setSearch] = useState("")
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

  const handleEdit = (med: Medicine) => {
    setEditingMedicine(med)
    setDialogOpen(true)
  }

  // Search filter — tên thuốc hoặc đơn vị
  const filteredMedicines = medicines.filter((m) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return m.name.toLowerCase().includes(q) || m.unit.toLowerCase().includes(q)
  })

  const warningCount = medicines.filter((m) => isLowStock(m) || isExpiringSoon(m) || isExpired(m)).length

  if (isPending) return <LoadingBlock />
  if (isError) return <ErrorState description="Không thể tải danh sách thuốc" onRetry={() => void refetch()} />

  return (
    <div className="min-h-screen space-y-8 bg-[#fafafa] p-6 lg:p-8">
      <PageHeader
        title="Quản lý Kho thuốc"
        description="CRUD danh mục thuốc, theo dõi tồn kho và hạn sử dụng"
      >
        <div className="flex items-center gap-3">
          {warningCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-medium text-amber-700">
              <AlertTriangle className="h-3.5 w-3.5" />
              {warningCount} cảnh báo
            </span>
          )}
          <Button
            onClick={() => { setEditingMedicine(null); setDialogOpen(true) }}
            className="h-11 rounded-full bg-medical-primary px-6 shadow-lg shadow-medical-primary/20 transition-all hover:bg-medical-dark active:scale-95"
          >
            <Plus className="mr-2 h-5 w-5" /> Thêm thuốc
          </Button>
        </div>
      </PageHeader>

      {/* Search + Refresh toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên thuốc, đơn vị..."
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
          <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
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
          {lastUpdated.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </span>
      </div>

      {filteredMedicines.length === 0 ? (
        <EmptyState
          title={search ? "Không tìm thấy thuốc nào" : "Chưa có thuốc nào trong kho"}
          description={search ? `Không có kết quả cho "${search}"` : undefined}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <MasterTable showHeader={false}>
            <MasterTableHeader>
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="pl-8 text-[10px] font-bold uppercase tracking-widest text-medical-dark/70">Tên thuốc</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-medical-dark/70">Đơn vị</TableHead>
                <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest text-medical-dark/70">Đơn giá</TableHead>
                <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest text-medical-dark/70">Tồn kho</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-medical-dark/70">Hạn sử dụng</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-medical-dark/70">Trạng thái</TableHead>
                <TableHead className="pr-8 text-right text-[10px] font-bold uppercase tracking-widest text-medical-dark/70">Thao tác</TableHead>
              </TableRow>
            </MasterTableHeader>
            <MasterTableBody>
              {filteredMedicines.map((med) => {
                const lowStock = isLowStock(med)
                const expiring = isExpiringSoon(med)
                const expired = isExpired(med)
                const rowClass = expired
                  ? "bg-red-50/70 hover:bg-red-50"
                  : expiring || lowStock
                  ? "bg-amber-50/70 hover:bg-amber-50"
                  : "group transition-colors hover:bg-slate-50"
                return (
                  <TableRow key={med.id} className={rowClass}>
                    <TableCell className="pl-8 font-semibold text-slate-700">{med.name}</TableCell>
                    <TableCell className="text-sm text-slate-600">{med.unit}</TableCell>
                    <TableCell className="text-right font-mono text-sm text-slate-700">
                      {med.price.toLocaleString("vi-VN")}đ
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={lowStock ? "font-semibold text-red-600" : "font-mono text-sm text-slate-700"}>
                        {med.stockQuantity}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {new Date(med.expiryDate).toLocaleDateString("vi-VN")}
                    </TableCell>
                    <TableCell>
                      {expired && (
                        <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                          Hết hạn
                        </span>
                      )}
                      {!expired && expiring && (
                        <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                          Sắp hết hạn
                        </span>
                      )}
                      {!expired && !expiring && lowStock && (
                        <span className="inline-flex items-center rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-semibold text-orange-700">
                          Sắp hết
                        </span>
                      )}
                      {!expired && !expiring && !lowStock && (
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                          Bình thường
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="pr-8 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(med)}
                          className="rounded-full shadow-none transition-all hover:bg-slate-100"
                        >
                          <Pencil className="h-4 w-4 text-slate-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTarget(med)}
                          className="rounded-full shadow-none transition-all hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </MasterTableBody>
          </MasterTable>
        </div>
      )}

      <MedicineDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={editingMedicine}
      />

      <ConfirmDialog
        open={deleteTarget != null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
        title="Xác nhận xóa thuốc"
        description={
          deleteTarget ? (
            <span>Bạn có chắc muốn xóa <strong>{deleteTarget.name}</strong> khỏi kho?</span>
          ) : null
        }
        variant="destructive"
        confirmLabel="Xóa"
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (!deleteTarget) return
          deleteMutation.mutate(deleteTarget.id, {
            onSuccess: () => {
              setDeleteTarget(null)
              void handleRefresh()
            },
          })
        }}
      />
    </div>
  )
}