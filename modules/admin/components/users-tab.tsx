"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Pencil, Trash2, Lock, Unlock, Search, RefreshCw, ArrowUp, ArrowDown } from "lucide-react"
import {
  MasterTable, MasterTableHeader, MasterTableBody,
  TableRow, TableHead, TableCell,
} from "@/components/ui/master-table"
import { ConfirmDialog } from "@/shared/components/dialog/confirm-dialog"
import { LoadingBlock } from "@/shared/components/states/loading-block"
import { ErrorState } from "@/shared/components/states/error-state"
import { EmptyState } from "@/shared/components/states/empty-state"
import { useUsersQuery } from "@/modules/admin/hooks/use-users-query"
import { useUpdateUserMutation, useDeleteUserMutation } from "@/modules/admin/hooks/use-user-mutations"
import { UserDialog } from "@/modules/admin/components/user-dialog"
import { cn } from "@/lib/utils"
import type { UserRecord } from "@/core/api/userService"

const AUTO_REFRESH_INTERVAL = 30_000

export function UsersTab() {
  const { data: users = [], isPending, isError, refetch } = useUsersQuery()
  const updateMutation = useUpdateUserMutation()
  const deleteMutation = useDeleteUserMutation()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<UserRecord | null>(null)
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

  const handleEdit = (user: UserRecord) => { setEditingUser(user); setDialogOpen(true) }

  const handleToggleLock = (user: UserRecord) => {
    const newStatus = user.status === "ACTIVE" ? "BLOCKED" : "ACTIVE"
    updateMutation.mutate({ id: user.id, data: { role: user.role, status: newStatus } })
  }

  const adminUsers = users
    .filter((u) => u.role === "ADMIN")
    .filter((u) => {
      if (!search.trim()) return true
      const q = search.toLowerCase()
      return u.username.toLowerCase().includes(q) || String(u.id).includes(q)
    })
    .sort((a, b) => sortOrder === "asc" ? a.id - b.id : b.id - a.id)

  const toggleAll = () => {
    if (selectedIds.length === adminUsers.length && adminUsers.length > 0) setSelectedIds([])
    else setSelectedIds(adminUsers.map(u => u.id))
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
      // errors are handled by mutation toast
    } finally {
      setIsBulkDeleting(false)
      setBulkDeleteDialogOpen(false)
    }
  }

  const roleBadge = (role: UserRecord["role"]) => {
    const styles: Record<string, string> = {
      ADMIN: "bg-purple-100 text-purple-700", DOCTOR: "bg-blue-100 text-blue-700",
      RECEPTIONIST: "bg-green-100 text-green-700", PATIENT: "bg-slate-100 text-slate-700",
    }
    const labels: Record<string, string> = {
      ADMIN: "Quản trị", DOCTOR: "Bác sĩ", RECEPTIONIST: "Lễ tân", PATIENT: "Bệnh nhân",
    }
    return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[role]}`}>{labels[role]}</span>
  }

  const statusBadge = (status: UserRecord["status"]) => {
  switch (status) {
    case "ACTIVE":
      return <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">Hoạt động</span>;
    case "INACTIVE":
      return <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">Ngưng hoạt động</span>;
    case "BLOCKED":
      return <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">Bị khóa</span>;
    default:
      return null;
  }
};

  if (isPending) return <LoadingBlock />
  if (isError) return <ErrorState description="Không thể tải danh sách người dùng" onRetry={() => void refetch()} />

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
              placeholder="Tìm theo username, ID..."
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
          onClick={() => { setEditingUser(null); setDialogOpen(true) }}
          className="h-10 rounded-full bg-medical-primary px-5 shadow-sm transition-all hover:bg-medical-dark"
        >
          <Plus className="mr-2 h-4 w-4" /> Thêm Admin
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

      {adminUsers.length === 0 ? (
        <EmptyState
          title={search ? "Không tìm thấy tài khoản nào" : "Chưa có tài khoản quản trị nào"}
          description={search ? `Không có kết quả cho "${search}"` : undefined}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <MasterTable showHeader={false}>
            <MasterTableHeader>
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="w-12 pl-6">
                  <input type="checkbox" className="rounded border-slate-300 w-4 h-4 accent-medical-primary cursor-pointer"
                    checked={selectedIds.length > 0 && selectedIds.length === adminUsers.length}
                    onChange={toggleAll}
                  />
                </TableHead>
                <TableHead className="w-24 text-[10px] font-bold uppercase tracking-widest text-medical-dark/70">
                  <Button variant="ghost" className="-ml-3 h-8 px-2 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-100" onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}>
                    ID
                    {sortOrder === "desc" ? <ArrowDown className="ml-1.5 h-3 w-3" /> : <ArrowUp className="ml-1.5 h-3 w-3" />}
                  </Button>
                </TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-medical-dark/70">Username</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-medical-dark/70">Vai trò</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-medical-dark/70">Trạng thái</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-medical-dark/70">Ngày tạo</TableHead>
                <TableHead className="pr-8 text-right text-[10px] font-bold uppercase tracking-widest text-medical-dark/70">Thao tác</TableHead>
              </TableRow>
            </MasterTableHeader>
            <MasterTableBody>
              {adminUsers.map((user) => (
                <TableRow key={user.id} className="group transition-colors hover:bg-slate-50">
                  <TableCell className="pl-6">
                    <input type="checkbox" className="rounded border-slate-300 w-4 h-4 accent-medical-primary cursor-pointer"
                      checked={selectedIds.includes(user.id)}
                      onChange={() => toggleRow(user.id)}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-sm text-slate-500">{user.id}</TableCell>
                  <TableCell className="font-medium text-slate-700">{user.username}</TableCell>
                  <TableCell>{roleBadge(user.role)}</TableCell>
                  <TableCell>{statusBadge(user.status)}</TableCell>
                  <TableCell className="text-sm text-slate-500">{new Date(user.createdAt).toLocaleDateString("vi-VN")}</TableCell>
                  <TableCell className="pr-8 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleToggleLock(user)}
                        title={user.status === "ACTIVE" ? "Khóa" : "Mở khóa"}
                        className="rounded-full shadow-none transition-all hover:bg-slate-100">
                        {user.status === "ACTIVE"
                          ? <Lock className="h-4 w-4 text-amber-600" />
                          : <Unlock className="h-4 w-4 text-emerald-600" />}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(user)}
                        className="rounded-full shadow-none transition-all hover:bg-slate-100">
                        <Pencil className="h-4 w-4 text-slate-600" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(user)}
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

      <UserDialog open={dialogOpen} onOpenChange={setDialogOpen} initialData={editingUser} />

      <ConfirmDialog
        open={deleteTarget != null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
        title="Xác nhận xóa tài khoản"
        description={deleteTarget ? <span>Bạn có chắc muốn xóa tài khoản <strong>{deleteTarget.username}</strong>?</span> : null}
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
        description={<span>Bạn có chắc muốn xóa <strong>{selectedIds.length}</strong> tài khoản đã chọn? Hành động này không thể hoàn tác.</span>}
        variant="destructive" confirmLabel="Xóa tất cả" loading={isBulkDeleting}
        onConfirm={() => void handleBulkDelete()}
      />
    </div>
  )
}