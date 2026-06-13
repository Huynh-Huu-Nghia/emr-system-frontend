"use client"

import { useState } from "react"
import { FileText, History, UserCheck, X } from "lucide-react"
import { formatDateVi } from "@/shared/lib/format/date"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { MedicalRecord } from "@/core/api/medicalRecordService"

interface PatientProfileModalProps {
  patientName: string
  medicalHistoryNumber: string
  historyRecords: MedicalRecord[]
}

const RECORD_TYPE_LABELS: Record<string, string> = {
  GENERAL: "Khám tổng quát",
  PEDIATRICS: "Nhi khoa",
  DENTAL: "Răng hàm mặt",
  CARDIOLOGY: "Tim mạch",
  DERMATOLOGY: "Da liễu",
}

export function PatientProfileModal({ patientName, medicalHistoryNumber, historyRecords }: PatientProfileModalProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="bg-white text-medical-primary border-medical-primary/20 hover:bg-medical-50">
          <FileText className="w-4 h-4 mr-2" />
          Hồ sơ chi tiết
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-slate-100 bg-slate-50/50">
          <DialogTitle className="text-xl flex items-center gap-2 text-slate-800">
            <UserCheck className="w-5 h-5 text-medical-primary" />
            Hồ sơ Bệnh nhân Toàn diện
          </DialogTitle>
          <DialogDescription>
            Bệnh nhân: <strong className="text-slate-700">{patientName}</strong> — Mã hồ sơ: <strong className="text-medical-primary">{medicalHistoryNumber}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 p-6 overflow-y-auto">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <History className="w-4 h-4 text-slate-400" />
                Lịch sử Khám bệnh ({historyRecords.length} lượt)
              </h3>
              
              {historyRecords.length === 0 ? (
                <div className="text-center p-8 border border-dashed border-slate-200 rounded-xl bg-slate-50 text-slate-500 text-sm">
                  Chưa có dữ liệu khám bệnh trong quá khứ.
                </div>
              ) : (
                <div className="space-y-4">
                  {historyRecords.map((record, index) => (
                    <div key={record.id} className="relative pl-6 pb-4 border-l-2 border-slate-100 last:border-0 last:pb-0">
                      <div className="absolute w-3 h-3 bg-medical-primary rounded-full -left-[7px] top-1 ring-4 ring-white" />
                      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <span className="text-sm font-bold text-slate-800">
                              {formatDateVi(record.createdAt)}
                            </span>
                            <span className="ml-3 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                              {RECORD_TYPE_LABELS[record.recordType] || record.recordType}
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <span className="block text-xs font-medium text-slate-500 mb-1">Triệu chứng</span>
                            <p className="text-sm text-slate-700">{record.symptoms || "Không có"}</p>
                          </div>
                          <div className="bg-medical-50/30 p-3 rounded-lg border border-medical-100">
                            <span className="block text-xs font-medium text-medical-700 mb-1">Chẩn đoán</span>
                            <p className="text-sm text-slate-800 font-medium">{record.diagnosis || "Chưa rõ"}</p>
                          </div>
                        </div>

                        {record.treatmentPlan && (
                          <div className="mt-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <span className="block text-xs font-medium text-slate-500 mb-1">Hướng điều trị</span>
                            <p className="text-sm text-slate-700">{record.treatmentPlan}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
