"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Pencil, Trash2, Search, RefreshCw } from "lucide-react"
import {
  MasterTable, MasterTableHeader, MasterTableBody,
  TableRow, TableHead, TableCell,
} from "@/components/ui/master-table"
import { ConfirmDialog } from "@/shared/components/dialog/confirm-dialog"
import { LoadingBlock } from "@/shared/components/states/loading-block"
import { ErrorState } from "@/shared/components/states/error-state"
import { EmptyState } from "@/shared/components/states/empty-state"
import { useReceptionistsQuery } from "@/modules/admin/hooks/use-receptionists-query"
import { useDeleteReceptionistMutation } from "@/modules/admin/hooks/use-receptionist-mutations"
import { ReceptionistDialog } from "@/modules/admin/components/receptionist-dialog"
import { cn } from "@/lib/utils"
import type { ReceptionistRecord } from "@/core/api/receptionistService"

const AUTO_REFRESH_INTERVAL = 30_000

export function ReceptionistsTab() {
  const { data: receptionists = [], isPending, isError, refetch } = useReceptionistsQuery()
  const deleteMutation = useDeleteReceptionistMutation()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingReceptionist, setEditingReceptionist] = useState<ReceptionistRecord | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ReceptionistRecord | null>(null)
  const [search, setSearch] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

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

  const handleEdit = (receptionist: ReceptionistRecord) => { setEditingReceptionist(receptionist); setDialogOpen(true) }

  const filteredReceptionists = receptionists.filter((r) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      r.fullName.toLowerCase().includes(q) ||
      r.username.toLowerCase().includes(q) ||
      r.department.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      r.phone.includes(q)
    )
  })

  if (isPending) return <LoadingBlock />
  if (isError) return <ErrorState description="Không thể tải danh sách lễ tân" onRetry={() => void refetch()} />

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo họ tên, email, SĐT..."
            className="pl-9 rounded-xl border-slate-200 bg-white shadow-sm focus-visible:ring-1 focus-visible:ring-slate-300"
          />
        </div>
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
          onClick={() => { setEditingReceptionist(null); setDialogOpen(true) }}
          className="h-10 rounded-full bg-medical-primary px-5 shadow-sm transition-all hover:bg-medical-dark"
        >
          <Plus className="mr-2 h-4 w-4" /> Thêm lễ tân
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

      {filteredReceptionists.length === 0 ? (
        <EmptyState
          title={search ? "Không tìm thấy lễ tân nào" : "Chưa có lễ tân nào"}
          description={search ? `Không có kết quả cho "${search}"` : undefined}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <MasterTable showHeader={false}>
            <MasterTableHeader>
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="pl-8 text-[10px] font-bold uppercase tracking-widest text-medical-dark/70">Họ tên</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-medical-dark/70">Username</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-medical-dark/70">SĐT</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-medical-dark/70">Email</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-medical-dark/70">Phòng ban</TableHead>
                <TableHead className="pr-8 text-right text-[10px] font-bold uppercase tracking-widest text-medical-dark/70">Thao tác</TableHead>
              </TableRow>
            </MasterTableHeader>
            <MasterTableBody>
              {filteredReceptionists.map((recp) => (
                <TableRow key={recp.id} className="group transition-colors hover:bg-slate-50">
                  <TableCell className="pl-8 font-semibold text-slate-700">{recp.fullName}</TableCell>
                  <TableCell className="text-sm text-slate-500">{recp.username}</TableCell>
                  <TableCell className="text-sm text-slate-600">{recp.phone}</TableCell>
                  <TableCell className="text-sm text-slate-600">{recp.email}</TableCell>
                  <TableCell className="text-sm text-slate-600">{recp.department}</TableCell>
                  <TableCell className="pr-8 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(recp)}
                        className="rounded-full shadow-none transition-all hover:bg-slate-100">
                        <Pencil className="h-4 w-4 text-slate-600" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(recp)}
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

      <ReceptionistDialog open={dialogOpen} onOpenChange={setDialogOpen} initialData={editingReceptionist} />

      <ConfirmDialog
        open={deleteTarget != null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
        title="Xác nhận xóa lễ tân"
        description={deleteTarget ? <span>Bạn có chắc muốn xóa <strong>{deleteTarget.fullName}</strong>?</span> : null}
        variant="destructive" confirmLabel="Xóa" loading={deleteMutation.isPending}
        onConfirm={() => {
          if (!deleteTarget) return
          deleteMutation.mutate(deleteTarget.id, { onSuccess: () => { setDeleteTarget(null); void handleRefresh() } })
        }}
      />
    </div>
  )
}