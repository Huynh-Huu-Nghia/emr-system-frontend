"use client"

import { useState } from "react"
import { PageHeader } from "@/components/ui/page-header"
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
import { useDoctorsQuery } from "@/modules/admin/hooks/use-doctors-query"
import { useDeleteDoctorMutation } from "@/modules/admin/hooks/use-doctor-mutations"
import { DoctorDialog } from "@/modules/admin/components/doctor-dialog"
import type { DoctorRecord } from "@/core/api/doctorService"

export default function AdminDoctorsPage() {
  const { data: doctors = [], isPending, isError, refetch } = useDoctorsQuery()
  const deleteMutation = useDeleteDoctorMutation()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingDoctor, setEditingDoctor] = useState<DoctorRecord | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<DoctorRecord | null>(null)

  const handleEdit = (doctor: DoctorRecord) => {
    setEditingDoctor(doctor)
    setDialogOpen(true)
  }

  if (isPending) return <LoadingBlock />
  if (isError) return <ErrorState description="Không thể tải danh sách bác sĩ" onRetry={() => void refetch()} />

  return (
    <div className="min-h-screen space-y-8 bg-[#fafafa] p-6 lg:p-8">
      <PageHeader
        title="Quản lý Bác sĩ"
        description="Danh sách bác sĩ, chuyên khoa và phòng khám"
      >
        <Button
          onClick={() => { setEditingDoctor(null); setDialogOpen(true) }}
          className="h-11 rounded-full bg-medical-primary px-6 shadow-lg shadow-medical-primary/20 transition-all hover:bg-medical-dark active:scale-95"
        >
          <Plus className="mr-2 h-5 w-5" /> Thêm bác sĩ
        </Button>
      </PageHeader>

      {doctors.length === 0 ? (
        <EmptyState title="Chưa có bác sĩ nào" />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <MasterTable showHeader={false}>
            <MasterTableHeader>
              <TableRow>
                <TableHead>Họ tên</TableHead>
                <TableHead>Chuyên khoa</TableHead>
                <TableHead>Phòng</TableHead>
                <TableHead>SĐT</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </MasterTableHeader>
            <MasterTableBody>
              {doctors.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">{doc.fullName}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                      {doc.specialty}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{doc.roomNumber}</TableCell>
                  <TableCell className="text-sm text-slate-600">{doc.phone}</TableCell>
                  <TableCell className="text-sm text-slate-600">{doc.email}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(doc)}>
                        <Pencil className="h-4 w-4 text-slate-600" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(doc)}>
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

      <DoctorDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={editingDoctor}
      />

      <ConfirmDialog
        open={deleteTarget != null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
        title="Xác nhận xóa bác sĩ"
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
