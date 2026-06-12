"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash2 } from "lucide-react"
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
import { useReceptionistsQuery } from "@/modules/admin/hooks/use-receptionists-query"
import { useDeleteReceptionistMutation } from "@/modules/admin/hooks/use-receptionist-mutations"
import { ReceptionistDialog } from "@/modules/admin/components/receptionist-dialog"
import type { ReceptionistRecord } from "@/core/api/receptionistService"

export function ReceptionistsTab() {
  const { data: receptionists = [], isPending, isError, refetch } = useReceptionistsQuery()
  const deleteMutation = useDeleteReceptionistMutation()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingReceptionist, setEditingReceptionist] = useState<ReceptionistRecord | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ReceptionistRecord | null>(null)

  const handleEdit = (receptionist: ReceptionistRecord) => {
    setEditingReceptionist(receptionist)
    setDialogOpen(true)
  }

  if (isPending) return <LoadingBlock />
  if (isError) return <ErrorState description="Không thể tải danh sách lễ tân" onRetry={() => void refetch()} />

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          onClick={() => { setEditingReceptionist(null); setDialogOpen(true) }}
          className="h-10 rounded-full bg-medical-primary px-5 shadow-sm transition-all hover:bg-medical-dark"
        >
          <Plus className="mr-2 h-4 w-4" /> Thêm lễ tân
        </Button>
      </div>

      {receptionists.length === 0 ? (
        <EmptyState title="Chưa có lễ tân nào" />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <MasterTable showHeader={false}>
            <MasterTableHeader>
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="pl-8 text-[10px] font-bold uppercase tracking-widest text-medical-dark/70">Họ tên</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-medical-dark/70">Username</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-medical-dark/70">SĐT</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-medical-dark/70">Email</TableHead>
                <TableHead className="pr-8 text-right text-[10px] font-bold uppercase tracking-widest text-medical-dark/70">Thao tác</TableHead>
              </TableRow>
            </MasterTableHeader>
            <MasterTableBody>
              {receptionists.map((recp) => (
                <TableRow key={recp.id} className="group transition-colors hover:bg-slate-50">
                  <TableCell className="pl-8 font-semibold text-slate-700">{recp.fullName}</TableCell>
                  <TableCell className="text-sm text-slate-500">{recp.username}</TableCell>
                  <TableCell className="text-sm text-slate-600">{recp.phone}</TableCell>
                  <TableCell className="text-sm text-slate-600">{recp.email}</TableCell>
                  <TableCell className="pr-8 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(recp)}
                        className="rounded-full shadow-none transition-all hover:bg-slate-100"
                      >
                        <Pencil className="h-4 w-4 text-slate-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteTarget(recp)}
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

      <ReceptionistDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={editingReceptionist}
      />

      <ConfirmDialog
        open={deleteTarget != null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
        title="Xác nhận xóa lễ tân"
        description={
          deleteTarget ? (
            <span>Bạn có chắc muốn xóa <strong>{deleteTarget.fullName}</strong>?</span>
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
