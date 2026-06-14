"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, Eye, Search, RefreshCw } from "lucide-react"
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
import { useMedicineCategoriesQuery } from "@/modules/admin/hooks/use-medicine-categories-query"
import { useDeleteMedicineCategoryMutation } from "@/modules/admin/hooks/use-medicine-category-mutations"
import { MedicineCategoryDialog } from "@/modules/admin/components/medicine-category-dialog"
import type { MedicineCategory } from "@/core/api/medicineCategoryService"
import { cn } from "@/lib/utils"

const AUTO_REFRESH_INTERVAL = 30_000

export function MedicineCategoriesTab() {
  const { data: categories = [], isPending, isError, refetch } = useMedicineCategoriesQuery()
  const deleteMutation = useDeleteMedicineCategoryMutation()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<MedicineCategory | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<MedicineCategory | null>(null)
  const [viewTarget, setViewTarget] = useState<MedicineCategory | null>(null)
  
  const [search, setSearch] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

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

  const handleEdit = (cat: MedicineCategory) => {
    setEditingCategory(cat)
    setDialogOpen(true)
  }

  const filteredCategories = categories.filter((c) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return c.nameVi.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
  })

  const sortedCategories = [...filteredCategories].sort((a, b) => {
    return sortOrder === "asc" ? a.displayOrder - b.displayOrder : b.displayOrder - a.displayOrder
  })

  const toggleAll = () => {
    if (selectedIds.length === sortedCategories.length && sortedCategories.length > 0) setSelectedIds([])
    else setSelectedIds(sortedCategories.map(c => c.id))
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

  if (isPending) return <LoadingBlock />
  if (isError) return <ErrorState description="Không thể tải danh sách danh mục" onRetry={() => void refetch()} />

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight text-slate-800">Danh mục thuốc</h2>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => { setEditingCategory(null); setDialogOpen(true) }}
            className="h-11 rounded-full bg-medical-primary px-6 shadow-lg shadow-medical-primary/20 transition-all hover:bg-medical-dark active:scale-95"
          >
            <Plus className="mr-2 h-5 w-5" /> Thêm danh mục
          </Button>
        </div>
      </div>

      {/* Search + Refresh toolbar */}
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
              placeholder="Tìm theo tên danh mục (Tiếng Việt hoặc Tiếng Anh)..."
              className="pl-9 h-10 rounded-xl border-slate-200 bg-white shadow-sm focus-visible:ring-1 focus-visible:ring-slate-300"
            />
          </div>
        )}
        
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

      {sortedCategories.length === 0 ? (
        <EmptyState
          title={search ? "Không tìm thấy danh mục nào phù hợp" : "Chưa có danh mục nào"}
          description={search ? `Không có kết quả cho "${search}"` : undefined}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <MasterTable showHeader={false}>
            <MasterTableHeader>
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="w-12 pl-6">
                  <input type="checkbox" className="rounded border-slate-300 w-4 h-4 accent-medical-primary cursor-pointer"
                    checked={selectedIds.length > 0 && selectedIds.length === sortedCategories.length}
                    onChange={toggleAll}
                  />
                </TableHead>
                <TableHead className="w-16 text-[10px] font-bold uppercase tracking-widest text-medical-dark/70">
                  STT
                </TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-medical-dark/70">Tên danh mục</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-medical-dark/70">Mô tả</TableHead>
                <TableHead className="pr-8 text-right text-[10px] font-bold uppercase tracking-widest text-medical-dark/70">Thao tác</TableHead>
              </TableRow>
            </MasterTableHeader>
            <MasterTableBody>
              {sortedCategories.map((cat, index) => (
                <TableRow key={cat.id} className="group transition-colors hover:bg-slate-50">
                  <TableCell className="pl-6">
                    <input type="checkbox" className="rounded border-slate-300 w-4 h-4 accent-medical-primary cursor-pointer"
                      checked={selectedIds.includes(cat.id)}
                      onChange={() => toggleRow(cat.id)}
                    />
                  </TableCell>
                  <TableCell className="text-sm font-medium text-slate-500">
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-slate-700">{cat.nameVi}</div>
                    <div className="text-xs text-slate-500">{cat.name}</div>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">{cat.description || "-"}</TableCell>
                  <TableCell className="pr-8 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setViewTarget(cat)}
                        title="Xem chi tiết"
                        className="rounded-full shadow-none transition-all hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Eye className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(cat)}
                        title="Chỉnh sửa"
                        className="rounded-full shadow-none transition-all hover:bg-slate-100"
                      >
                        <Pencil className="h-4 w-4 text-slate-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteTarget(cat)}
                        title="Xóa"
                        className="rounded-full shadow-none transition-all hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </MasterTableBody>
          </MasterTable>
        </div>
      )}

      {/* View Details Modal */}
      <MasterModal open={viewTarget != null} onOpenChange={(open) => { if (!open) setViewTarget(null) }}>
        <MasterModalContent className="sm:max-w-md">
          <MasterModalHeader title="Chi tiết Phân loại thuốc" />
          {viewTarget && (
            <div className="space-y-4 px-6 py-5">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <div className="text-xs font-medium text-slate-500">Tên tiếng Việt</div>
                  <div className="font-semibold text-slate-900">{viewTarget.nameVi}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-500">Tên gốc / Mã hệ thống</div>
                  <div className="text-sm text-slate-700">{viewTarget.name}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-500">Mô tả</div>
                  <div className="text-sm text-slate-700">{viewTarget.description || "Không có mô tả"}</div>
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

      <MedicineCategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={editingCategory}
      />

      <ConfirmDialog
        open={deleteTarget != null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
        title="Xác nhận xóa danh mục"
        description={
          deleteTarget ? (
            <span>Bạn có chắc muốn xóa danh mục <strong>{deleteTarget.nameVi}</strong>?</span>
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
        description={<span>Bạn có chắc muốn xóa <strong>{selectedIds.length}</strong> danh mục đã chọn? Hành động này không thể hoàn tác.</span>}
        variant="destructive" confirmLabel="Xóa tất cả" loading={isBulkDeleting}
        onConfirm={() => void handleBulkDelete()}
      />
    </div>
  )
}
