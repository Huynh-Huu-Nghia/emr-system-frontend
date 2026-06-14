"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Pencil, Trash2, Search, RefreshCw, ArrowUp, ArrowDown, Lock, Unlock } from "lucide-react"
import {
  MasterTable, MasterTableHeader, MasterTableBody,
  TableRow, TableHead, TableCell,
} from "@/components/ui/master-table"
import { ConfirmDialog } from "@/shared/components/dialog/confirm-dialog"
import { LoadingBlock } from "@/shared/components/states/loading-block"
import { ErrorState } from "@/shared/components/states/error-state"
import { EmptyState } from "@/shared/components/states/empty-state"
import { useDoctorsQuery } from "@/modules/admin/hooks/use-doctors-query"
import { useDeleteDoctorMutation, useUpdateDoctorMutation } from "@/modules/admin/hooks/use-doctor-mutations"
import { DoctorDialog } from "@/modules/admin/components/doctor-dialog"
import { cn } from "@/lib/utils"
import type { DoctorRecord } from "@/core/api/doctorService"

const AUTO_REFRESH_INTERVAL = 30_000

export function DoctorsTab() {
  const { data: doctors = [], isPending, isError, refetch } = useDoctorsQuery()
  const deleteMutation = useDeleteDoctorMutation()
  const updateMutation = useUpdateDoctorMutation()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingDoctor, setEditingDoctor] = useState<DoctorRecord | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<DoctorRecord | null>(null)
  const [search, setSearch] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)

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

  const handleEdit = (doctor: DoctorRecord) => { setEditingDoctor(doctor); setDialogOpen(true) }

  const filteredDoctors = doctors.filter((d) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      d.fullName.toLowerCase().includes(q) ||
      d.username.toLowerCase().includes(q) ||
      d.specialty.toLowerCase().includes(q) ||
      d.roomNumber.toLowerCase().includes(q)
    )
  }).sort((a, b) => sortOrder === "asc" ? a.id - b.id : b.id - a.id)

  const toggleAll = () => {
    if (selectedIds.length === filteredDoctors.length && filteredDoctors.length > 0) setSelectedIds([])
    else setSelectedIds(filteredDoctors.map(d => d.id))
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

  const toggleStatus = (doc: DoctorRecord) => {
    const newStatus = doc.status === "BLOCKED" ? "ACTIVE" : "BLOCKED"
    updateMutation.mutate({
      id: doc.id,
      data: { status: newStatus },
    })
  }

  const statusBadge = (status: DoctorRecord["status"]) => {
    switch (status) {
      case "ACTIVE":
        return <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">Hoạt động</span>
      case "INACTIVE":
        return <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-700">Ngưng hoạt động</span>
      case "BLOCKED":
        return <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700">Bị khóa</span>
      default:
        return null
    }
  }

  if (isPending) return <LoadingBlock />
  if (isError) return <ErrorState description="Không thể tải danh sách bác sĩ" onRetry={() => void refetch()} />

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
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
              placeholder="Tìm theo họ tên, chuyên khoa, phòng..."
              className="pl-9 h-10 rounded-xl border-slate-200 bg-white shadow-sm focus-visible:ring-1 focus-visible:ring-slate-300"
            />
          </div>
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
        <Button
          onClick={() => { setEditingDoctor(null); setDialogOpen(true) }}
          className="h-10 rounded-full bg-medical-primary px-5 shadow-sm transition-all hover:bg-medical-dark"
        >
          <Plus className="mr-2 h-4 w-4" /> Thêm bác sĩ
        </Button>
      </div>

      {/* Live indicator */}
      <div className="flex items-center gap-2 pl-1">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        <span className="text-xs text-slate-400">
          Tự động làm mới mỗi 30 giây · Cập nhật lần cuối:{" "}
          {lastUpdated.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </span>
      </div>

      {filteredDoctors.length === 0 ? (
        <EmptyState
          title={search ? "Không tìm thấy bác sĩ nào" : "Chưa có bác sĩ nào"}
          description={search ? `Không có kết quả cho "${search}"` : undefined}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <MasterTable showHeader={false}>
            <MasterTableHeader>
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="w-12 pl-6">
                  <input type="checkbox" className="rounded border-slate-300 w-4 h-4 accent-medical-primary cursor-pointer"
                    checked={selectedIds.length > 0 && selectedIds.length === filteredDoctors.length}
                    onChange={toggleAll}
                  />
                </TableHead>
                <TableHead className="w-24 text-[10px] font-bold uppercase tracking-widest text-medical-dark/70">
                  <Button variant="ghost" className="-ml-3 h-8 px-2 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-100" onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}>
                    Mã BS
                    {sortOrder === "desc" ? <ArrowDown className="ml-1.5 h-3 w-3" /> : <ArrowUp className="ml-1.5 h-3 w-3" />}
                  </Button>
                </TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-medical-dark/70">Họ tên</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-medical-dark/70">Username</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-medical-dark/70">Chuyên khoa</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-medical-dark/70">Phòng</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-medical-dark/70">SĐT</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-medical-dark/70">Email</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-medical-dark/70">Trạng thái</TableHead>
                <TableHead className="pr-8 text-right text-[10px] font-bold uppercase tracking-widest text-medical-dark/70">Thao tác</TableHead>
              </TableRow>
            </MasterTableHeader>
            <MasterTableBody>
              {filteredDoctors.map((doc) => (
                <TableRow key={doc.id} className="group transition-colors hover:bg-slate-50">
                  <TableCell className="pl-6">
                    <input type="checkbox" className="rounded border-slate-300 w-4 h-4 accent-medical-primary cursor-pointer"
                      checked={selectedIds.includes(doc.id)}
                      onChange={() => toggleRow(doc.id)}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-sm font-medium text-medical-primary">{doc.doctorCode}</TableCell>
                  <TableCell className="font-semibold text-slate-700">{doc.fullName}</TableCell>
                  <TableCell className="text-sm text-slate-500">{doc.username}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                      {doc.specialty}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-sm text-slate-600">{doc.roomNumber}</TableCell>
                  <TableCell className="text-sm text-slate-600">{doc.phone}</TableCell>
                  <TableCell className="text-sm text-slate-600">{doc.email}</TableCell>
                  <TableCell>{statusBadge(doc.status)}</TableCell>
                  <TableCell className="pr-8 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => toggleStatus(doc)}
                        title={doc.status === "BLOCKED" ? "Mở khóa tài khoản" : "Khóa tài khoản"}
                        className="rounded-full shadow-none transition-all hover:bg-slate-100">
                        {doc.status === "BLOCKED" ? <Unlock className="h-4 w-4 text-emerald-600" /> : <Lock className="h-4 w-4 text-amber-600" />}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(doc)}
                        className="rounded-full shadow-none transition-all hover:bg-slate-100">
                        <Pencil className="h-4 w-4 text-slate-600" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(doc)}
                        className="rounded-full shadow-none transition-all hover:bg-red-50 hover:text-red-600">
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

      <DoctorDialog open={dialogOpen} onOpenChange={setDialogOpen} initialData={editingDoctor} />

      <ConfirmDialog
        open={deleteTarget != null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
        title="Xác nhận xóa bác sĩ"
        description={deleteTarget ? <span>Bạn có chắc muốn xóa <strong>{deleteTarget.fullName}</strong>?</span> : null}
        variant="destructive" confirmLabel="Xóa" loading={deleteMutation.isPending}
        onConfirm={() => {
          if (!deleteTarget) return
          deleteMutation.mutate(deleteTarget.id, { onSuccess: () => { setDeleteTarget(null); void handleRefresh() } })
        }}
      />

      <ConfirmDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
        title="Xác nhận xóa hàng loạt"
        description={<span>Bạn có chắc muốn xóa <strong>{selectedIds.length}</strong> bác sĩ đã chọn? Hành động này không thể hoàn tác.</span>}
        variant="destructive" confirmLabel="Xóa tất cả" loading={isBulkDeleting}
        onConfirm={() => void handleBulkDelete()}
      />
    </div>
  )
}