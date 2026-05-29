"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { Patient } from "@/modules/patient/types"
import { GENDER_LABELS } from "@/lib/constants"
import { formatDateVi } from "@/shared/lib/format/date"

type PatientViewDialogProps = {
  isOpen: boolean
  onClose: () => void
  patient?: Patient | null
}

export function PatientViewDialog({
  isOpen,
  onClose,
  patient,
}: PatientViewDialogProps) {
  return (
    <Dialog
      open={isOpen && !!patient}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent className="max-w-lg overflow-hidden rounded-2xl border-none bg-white p-0 shadow-2xl">
        {patient ? (
          <>
            <DialogHeader className="p-6 pb-0">
              <DialogTitle className="text-xl font-bold uppercase tracking-tight text-medical-dark">
                Thông tin bệnh nhân
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 px-6 py-4 text-slate-700">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400">
                    Mã hồ sơ
                  </p>
                  <p className="mt-1 font-semibold text-slate-800">
                    #{patient.medicalHistoryNumber}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400">
                    Giới tính
                  </p>
                  <p className="mt-1 font-semibold text-slate-800">
                    {GENDER_LABELS[patient.gender]}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400">
                    Ngày sinh
                  </p>
                  <p className="mt-1 font-semibold text-slate-800">
                    {formatDateVi(patient.dob)}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400">
                    Số điện thoại
                  </p>
                  <p className="mt-1 font-semibold text-slate-800">{patient.phone}</p>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-[10px] uppercase tracking-widest text-slate-400">
                  Họ và tên
                </p>
                <p className="mt-1 font-semibold text-slate-800">{patient.full_name}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400">
                    Mã BHYT
                  </p>
                  <p className="mt-1 font-semibold text-slate-800">
                    {patient.insurance_code || "Không có"}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400">
                    Ngày tạo
                  </p>
                  <p className="mt-1 font-semibold text-slate-800">
                    {formatDateVi(patient.created_at)}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-[10px] uppercase tracking-widest text-slate-400">
                  Địa chỉ
                </p>
                <p className="mt-1 font-semibold text-slate-800">
                  {patient.address || "Chưa có địa chỉ"}
                </p>
              </div>
            </div>

            <DialogFooter className="-mx-6 -mb-6 mt-4 bg-slate-50 p-6">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={onClose}
              >
                Đóng
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
