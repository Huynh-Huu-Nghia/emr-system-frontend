"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Pencil, Trash2, AlertTriangle, Search, RefreshCw, ArrowUp, ArrowDown, Eye } from "lucide-react"
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
import { ConfirmDialog } from "@/shared/components/dialog/confirm-dialog"
import { LoadingBlock } from "@/shared/components/states/loading-block"
import { ErrorState } from "@/shared/components/states/error-state"
import { EmptyState } from "@/shared/components/states/empty-state"
import { useMedicinesQuery } from "@/modules/admin/hooks/use-medicines-query"
import { useMedicineCategoriesQuery } from "@/modules/admin/hooks/use-medicine-categories-query"
import { useDeleteMedicineMutation } from "@/modules/admin/hooks/use-medicine-mutations"
import { MedicineDialog } from "@/modules/admin/components/medicine-dialog"
import { isLowStock, isExpiringSoon, isExpired } from "@/core/api/medicineService"
import { cn } from "@/lib/utils"
import type { Medicine } from "@/core/api/medicineService"

const AUTO_REFRESH_INTERVAL = 30_000

export function MedicinesTab() {
  const { data: medicines = [], isPending, isError, refetch } = useMedicinesQuery()
  const { data: categories = [] } = useMedicineCategoriesQuery()
  const deleteMutation = useDeleteMedicineMutation()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Medicine | null>(null)
  const [viewTarget, setViewTarget] = useState<Medicine | null>(null)
  
  const [search, setSearch] = useState("")
  const [filterCategory, setFilterCategory] = useState<string>("ALL")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)

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

  // Filter
  const filteredMedicines = medicines.filter((m) => {
    if (filterCategory !== "ALL" && m.categoryId?.toString() !== filterCategory) return false
    
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return m.name.toLowerCase().includes(q) || m.unit.toLowerCase().includes(q)
  }).sort((a, b) => sortOrder === "asc" ? a.id - b.id : b.id - a.id)

  const toggleAll = () => {
    if (selectedIds.length === filteredMedicines.length && filteredMedicines.length > 0) setSelectedIds([])
    else setSelectedIds(filteredMedicines.map(m => m.id))
  }

  const toggleRow = (id: number) => {
    if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(i => i !== id))
    else setSelectedIds([...selectedIds, id])
  }

  const handleBulkDelete = async () => {
    setIsBulkDeleting(true)
    try {
      await Promise.all(selectedIds.map((id) => deleteMutation.mutateAsync(id)))
      setSelectedIds([])
      void handleRefresh()
    } catch {
      // errors handled by toast
    } finally {
      setIsBulkDeleting(false)
      setBulkDeleteDialogOpen(false)
    }
  }

  const warningCount = medicines.filter((m) => isLowStock(m) || isExpiringSoon(m) || isExpired(m)).length

  if (isPending) return <LoadingBlock />
  if (isError) return <ErrorState description="Không thể tải danh sách thuốc" onRetry={() => void refetch()} />

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight text-slate-800">Kho thuốc</h2>
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
      </div>

      {/* Search + Filter + Refresh toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {selectedIds.length > 0 ? (
          <div className="flex-1 flex items-center gap-2 bg-red-50 text-red-600 px-4 h-10 rounded-xl border border-red-100">
            <span className="text-sm font-medium">Đã chọn {selectedIds.length} mục</span>
            <Button variant="ghost" size="sm" onClick={() => setBulkDeleteDialogOpen(true)} className="ml-auto hover:bg-red-100 hover:text-red-700 h-8">
              <Trash2 className="h-4 w-4 mr-2" /> Xóa các mục đã chọn
            </Button>
          </div>
        ) : (
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên thuốc, đơn vị..."
              className="pl-9 h-10 rounded-xl border-slate-200 bg-white shadow-sm focus-visible:ring-1 focus-visible:ring-slate-300"
            />
          </div>
        )}
        
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[200px] rounded-xl border-slate-200 bg-white shadow-sm">
            <SelectValue placeholder="Phân loại thuốc" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả phân loại</SelectItem>
            {categories.map(c => (
              <SelectItem key={c.id} value={c.id.toString()}>{c.nameVi}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick={() => void handleRefresh()}
          disabled={isRefreshing}
          className="gap-2 rounded-xl border-slate-200 bg-white shadow-sm h-10 px-4"
        >
          <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          Làm mới
        </Button>
      </div>

      {/* Live indicator */}
      <div className="flex items-center gap-2 -mt-2 pl-1">
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
          title={search || filterCategory !== "ALL" ? "Không tìm thấy thuốc nào phù hợp" : "Chưa có thuốc nào trong kho"}
          description={search ? `Không có kết quả cho "${search}"` : undefined}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <MasterTable showHeader={false}>
            <MasterTableHeader>
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="w-12 pl-6">
                  <input type="checkbox" className="rounded border-slate-300 w-4 h-4 accent-medical-primary cursor-pointer"
                    checked={selectedIds.length > 0 && selectedIds.length === filteredMedicines.length}
                    onChange={toggleAll}
                  />
                </TableHead>
                <TableHead className="w-24 text-[10px] font-bold uppercase tracking-widest text-medical-dark/70">
                  <Button variant="ghost" className="-ml-3 h-8 px-2 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-100" onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}>
                    Mã thuốc
                    {sortOrder === "desc" ? <ArrowDown className="ml-1.5 h-3 w-3" /> : <ArrowUp className="ml-1.5 h-3 w-3" />}
                  </Button>
                </TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-medical-dark/70">Tên thuốc</TableHead>
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
                    <TableCell className="pl-6">
                      <input type="checkbox" className="rounded border-slate-300 w-4 h-4 accent-medical-primary cursor-pointer"
                        checked={selectedIds.includes(med.id)}
                        onChange={() => toggleRow(med.id)}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-sm font-medium text-medical-primary">{med.medicineCode}</TableCell>
                    <TableCell className="font-semibold text-slate-700">{med.name}</TableCell>
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
                          onClick={() => setViewTarget(med)}
                          title="Xem chi tiết"
                          className="rounded-full shadow-none transition-all hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Eye className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(med)}
                          title="Chỉnh sửa"
                          className="rounded-full shadow-none transition-all hover:bg-slate-100"
                        >
                          <Pencil className="h-4 w-4 text-slate-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTarget(med)}
                          title="Xóa"
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

      {/* View Details Modal */}
      <MasterModal open={viewTarget != null} onOpenChange={(open) => { if (!open) setViewTarget(null) }}>
        <MasterModalContent className="sm:max-w-md">
          <MasterModalHeader title="Chi tiết Thuốc" />
          {viewTarget && (
            <div className="space-y-4 px-6 py-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-medium text-slate-500">Mã thuốc</div>
                  <div className="font-semibold text-medical-primary font-mono">{viewTarget.medicineCode}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-500">Tên thuốc</div>
                  <div className="font-semibold text-slate-900">{viewTarget.name}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-500">Phân loại</div>
                  <div className="text-sm text-slate-700">
                    {categories.find(c => c.id === viewTarget.categoryId)?.nameVi || "Không xác định"}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-500">Đơn vị</div>
                  <div className="text-sm text-slate-700">{viewTarget.unit}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-500">Đơn giá</div>
                  <div className="text-sm font-mono text-slate-700">{viewTarget.price.toLocaleString("vi-VN")}đ</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-500">Tồn kho</div>
                  <div className="text-sm font-mono text-slate-700">{viewTarget.stockQuantity}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-500">Hạn sử dụng</div>
                  <div className="text-sm text-slate-700">{new Date(viewTarget.expiryDate).toLocaleDateString("vi-VN")}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-500">Trạng thái tồn kho</div>
                  <div className="text-sm text-slate-700">
                    {isExpired(viewTarget) ? "Hết hạn" : isExpiringSoon(viewTarget) ? "Sắp hết hạn" : isLowStock(viewTarget) ? "Sắp hết" : "Bình thường"}
                  </div>
                </div>
              </div>
              <MasterModalFooter>
                <MasterModalAction variant="secondary" onClick={() => setViewTarget(null)}>
                  Đóng
                </MasterModalAction>
              </MasterModalFooter>
            </div>
          )}
        </MasterModalContent>
      </MasterModal>

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

      <ConfirmDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
        title="Xác nhận xóa hàng loạt"
        description={<span>Bạn có chắc muốn xóa <strong>{selectedIds.length}</strong> loại thuốc đã chọn? Hành động này không thể hoàn tác.</span>}
        variant="destructive" confirmLabel="Xóa tất cả" loading={isBulkDeleting}
        onConfirm={() => void handleBulkDelete()}
      />
    </div>
  )
}