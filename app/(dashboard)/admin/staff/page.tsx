"use client"

import { useState } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash2, Lock, Unlock } from "lucide-react"
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
import { useUsersQuery } from "@/modules/admin/hooks/use-users-query"
import {
  useUpdateUserMutation,
  useDeleteUserMutation,
} from "@/modules/admin/hooks/use-user-mutations"
import { UserDialog } from "@/modules/admin/components/user-dialog"
import type { UserRecord } from "@/core/api/userService"

export default function AdminStaffPage() {
  const { data: users = [], isPending, isError, refetch } = useUsersQuery()
  const updateMutation = useUpdateUserMutation()
  const deleteMutation = useDeleteUserMutation()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<UserRecord | null>(null)

  const handleEdit = (user: UserRecord) => {
    setEditingUser(user)
    setDialogOpen(true)
  }

  const handleToggleLock = (user: UserRecord) => {
    const newStatus = user.status === "ACTIVE" ? "LOCKED" : "ACTIVE"
    updateMutation.mutate({ id: user.id, data: { role: user.role, status: newStatus } })
  }

  const roleBadge = (role: UserRecord["role"]) => {
    const styles: Record<string, string> = {
      ADMIN: "bg-purple-100 text-purple-700",
      DOCTOR: "bg-blue-100 text-blue-700",
      RECEPTIONIST: "bg-green-100 text-green-700",
    }
    const labels: Record<string, string> = {
      ADMIN: "Quản trị",
      DOCTOR: "Bác sĩ",
      RECEPTIONIST: "Lễ tân",
    }
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[role]}`}>
        {labels[role]}
      </span>
    )
  }

  const statusBadge = (status: UserRecord["status"]) => {
    if (status === "ACTIVE") {
      return <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">Hoạt động</span>
    }
    return <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">Đã khóa</span>
  }

  if (isPending) return <LoadingBlock />
  if (isError) return <ErrorState description="Không thể tải danh sách người dùng" onRetry={() => void refetch()} />

  return (
    <div className="min-h-screen space-y-8 bg-[#fafafa] p-6 lg:p-8">
      <PageHeader
        title="Quản lý Tài khoản"
        description="Quản lý người dùng hệ thống: cấp quyền, khóa/mở khóa tài khoản"
      >
        <Button
          onClick={() => { setEditingUser(null); setDialogOpen(true) }}
          className="h-11 rounded-full bg-medical-primary px-6 shadow-lg shadow-medical-primary/20 transition-all hover:bg-medical-dark active:scale-95"
        >
          <Plus className="mr-2 h-5 w-5" /> Thêm tài khoản
        </Button>
      </PageHeader>

      {users.length === 0 ? (
        <EmptyState title="Chưa có tài khoản nào" />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <MasterTable showHeader={false}>
            <MasterTableHeader>
              <TableRow>
                <TableHead className="w-16">ID</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </MasterTableHeader>
            <MasterTableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-mono text-sm text-slate-500">{user.id}</TableCell>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{roleBadge(user.role)}</TableCell>
                  <TableCell>{statusBadge(user.status)}</TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleLock(user)}
                        title={user.status === "ACTIVE" ? "Khóa" : "Mở khóa"}
                      >
                        {user.status === "ACTIVE" ? <Lock className="h-4 w-4 text-amber-600" /> : <Unlock className="h-4 w-4 text-emerald-600" />}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(user)}>
                        <Pencil className="h-4 w-4 text-slate-600" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(user)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </MasterTableBody>
          </MasterTable>
        </div>
      )}

      <UserDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={editingUser}
      />

      <ConfirmDialog
        open={deleteTarget != null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
        title="Xác nhận xóa tài khoản"
        description={
          deleteTarget ? (
            <span>Bạn có chắc muốn xóa tài khoản <strong>{deleteTarget.username}</strong>?</span>
          ) : null
        }
        variant="destructive"
        confirmLabel="Xóa"
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (!deleteTarget) return
          deleteMutation.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
        }}
      />
    </div>
  )
}
