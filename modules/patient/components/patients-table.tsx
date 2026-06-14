"use client"

import { Button } from "@/components/ui/button"
import {
  MasterTable,
  MasterTableHeader,
  MasterTableBody,
} from "@/components/ui/master-table"
import { TableRow, TableCell, TableHead } from "@/components/ui/table"
import type { Patient } from "@/modules/patient/types"
import { EmptyState } from "@/shared/components/states/empty-state"
import { ErrorState } from "@/shared/components/states/error-state"
import { LoadingBlock } from "@/shared/components/states/loading-block"
import { GenderBadge } from "@/shared/components/feedback/gender-badge"
import { formatDateVi } from "@/shared/lib/format/date"
import { Eye, Pencil, Trash2, UserRound } from "lucide-react"

type PatientsTableProps = {
  isPending: boolean
  isError: boolean
  errorMessage?: string
  onRetry: () => void
  patients: Patient[]
  filteredPatients: Patient[]
  deletePending: boolean
  canDelete?: boolean
  onEdit?: (patient: Patient) => void
  onView: (patient: Patient) => void
  onDeleteRequest: (patient: Patient) => void
  enableSelection?: boolean
  selectedIds?: Set<number>
  onToggleSelection?: (id: number) => void
  onToggleAll?: (selectAll: boolean) => void
}

export function PatientsTable({
  isPending,
  isError,
  errorMessage,
  onRetry,
  patients,
  filteredPatients,
  deletePending,
  canDelete = true,
  onEdit,
  onView,
  onDeleteRequest,
  enableSelection = false,
  selectedIds = new Set(),
  onToggleSelection,
  onToggleAll,
}: PatientsTableProps) {
  const allIds = filteredPatients.map((p) => p.id)
  const isAllSelected = allIds.length > 0 && allIds.every((id) => selectedIds.has(id))
  const isSomeSelected = allIds.some((id) => selectedIds.has(id))

  return (
    <MasterTable showHeader={false}>
      <MasterTableHeader>
        <TableRow className="border-none hover:bg-transparent">
          {enableSelection && (
            <TableHead className="w-[50px] pl-8">
              <input
                type="checkbox"
                checked={isAllSelected}
                ref={(el) => {
                  if (el) el.indeterminate = isSomeSelected && !isAllSelected
                }}
                onChange={(e) => onToggleAll?.(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-medical-primary focus:ring-medical-primary"
              />
            </TableHead>
          )}
          <TableHead className={enableSelection ? "w-[130px] pl-4 text-[10px] font-bold uppercase tracking-widest text-medical-dark/70" : "w-[130px] pl-8 text-[10px] font-bold uppercase tracking-widest text-medical-dark/70"}>
            Mã hồ sơ
          </TableHead>
          <TableHead className="w-[220px] text-[10px] font-bold uppercase tracking-widest text-medical-dark/70">
            Họ và Tên
          </TableHead>
          <TableHead className="text-[10px] font-bold uppercase tracking-widest text-medical-dark/70">
            Giới tính
          </TableHead>
          <TableHead className="text-[10px] font-bold uppercase tracking-widest text-medical-dark/70">
            Ngày sinh
          </TableHead>
          <TableHead className="text-[10px] font-bold uppercase tracking-widest text-medical-dark/70">
            Điện thoại
          </TableHead>
          <TableHead className="text-[10px] font-bold uppercase tracking-widest text-medical-dark/70">
            Mã BHYT
          </TableHead>
          <TableHead className="pr-8 text-right text-[10px] font-bold uppercase tracking-widest text-medical-dark/70">
            Thao tác
          </TableHead>
        </TableRow>
      </MasterTableHeader>
      <MasterTableBody>
        {isPending ? (
          <TableRow>
            <TableCell colSpan={enableSelection ? 8 : 7} className="p-0">
              <LoadingBlock message="Đang tải danh sách…" />
            </TableCell>
          </TableRow>
        ) : isError ? (
          <TableRow>
            <TableCell colSpan={enableSelection ? 8 : 7} className="p-0">
              <ErrorState
                description={errorMessage}
                onRetry={() => void onRetry()}
              />
            </TableCell>
          </TableRow>
        ) : patients.length === 0 ? (
          <TableRow>
            <TableCell colSpan={enableSelection ? 8 : 7} className="p-0">
              <EmptyState
                title="Chưa có bệnh nhân nào"
                description="Bắt đầu bằng cách tiếp nhận hồ sơ mới."
              />
            </TableCell>
          </TableRow>
        ) : filteredPatients.length === 0 ? (
          <TableRow>
            <TableCell colSpan={enableSelection ? 8 : 7} className="p-0">
              <EmptyState title="Không có bệnh nhân phù hợp" />
            </TableCell>
          </TableRow>
        ) : (
          filteredPatients.map((p) => (
            <TableRow
              key={p.id}
              className={`group transition-colors ${selectedIds.has(p.id) ? "bg-medical-primary/5 hover:bg-medical-primary/10" : "hover:bg-slate-50"}`}
            >
              {enableSelection && (
                <TableCell className="pl-8">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(p.id)}
                    onChange={() => onToggleSelection?.(p.id)}
                    className="h-4 w-4 rounded border-slate-300 text-medical-primary focus:ring-medical-primary"
                  />
                </TableCell>
              )}
              <TableCell className={enableSelection ? "pl-4 font-medium text-medical-primary" : "pl-8 font-medium text-medical-primary"}>
                #{p.medicalHistoryNumber}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                    <UserRound className="h-4 w-4" />
                  </div>
                  <span className="font-semibold text-slate-700">{p.full_name}</span>
                </div>
              </TableCell>
              <TableCell>
                <GenderBadge gender={p.gender} />
              </TableCell>
              <TableCell>
                <span className="text-slate-600">{formatDateVi(p.dob)}</span>
              </TableCell>
              <TableCell>
                <span className="font-medium text-slate-700">{p.phone}</span>
              </TableCell>
              <TableCell>
                <span className="text-slate-500">{p.insurance_code || "---"}</span>
              </TableCell>
              <TableCell className="pr-8 text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Xem nhanh"
                    onClick={() => onView(p)}
                    className="rounded-full shadow-none transition-all hover:bg-slate-200"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={deletePending}
                      onClick={() => onEdit(p)}
                      className="rounded-full shadow-none transition-all hover:bg-medical-primary hover:text-white"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  {canDelete ? (
                    <Button
                      variant="destructive"
                      size="icon"
                      disabled={deletePending}
                      onClick={() => onDeleteRequest(p)}
                      className="rounded-full shadow-none"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  ) : null}
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </MasterTableBody>
    </MasterTable>
  )
}
