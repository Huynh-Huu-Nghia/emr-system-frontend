"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { medicalRecordService, type MedicalRecord } from "@/core/api/medicalRecordService"
import { prescriptionService, type Prescription } from "@/core/api/prescriptionService"
import { medicineService, type Medicine } from "@/core/api/medicineService"
import { LoadingBlock } from "@/shared/components/states/loading-block"
import { ErrorState } from "@/shared/components/states/error-state"

export default function PrintPrescriptionPage() {
  const params = useParams()
  const id = Number(params.id)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  
  const [record, setRecord] = useState<MedicalRecord | null>(null)
  const [prescription, setPrescription] = useState<Prescription | null>(null)
  const [medicines, setMedicines] = useState<Record<number, Medicine>>({})

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const rec = await medicalRecordService.getById(id)
        setRecord(rec)

        const pres = await prescriptionService.getByMedicalRecordId(rec.id)
        setPrescription(pres)

        if (pres?.details && pres.details.length > 0) {
          const allMeds = await medicineService.getAll()
          const medMap: Record<number, Medicine> = {}
          allMeds.forEach(m => {
            medMap[m.id] = m
          })
          setMedicines(medMap)
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to load data"))
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id])

  useEffect(() => {
    if (!loading && !error && record) {
      // Add a small delay to ensure rendering is complete before print dialog opens
      const timer = setTimeout(() => {
        window.print()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [loading, error, record])

  if (loading) return <LoadingBlock />
  if (error) return <ErrorState description={error.message} onRetry={() => window.location.reload()} />
  if (!record) return <ErrorState description="Không tìm thấy bệnh án" />

  return (
    <div className="mx-auto max-w-3xl p-8 bg-white text-black print:p-0">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b-2 border-black pb-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-white font-bold text-2xl print:bg-black print:text-white print:border print:border-black" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
            EC
          </div>
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-tight">Electronic Clinic</h1>
            <p className="text-sm text-slate-600 print:text-black">123 Đường Sức Khỏe, Quận Y Tế, TP. HCM</p>
            <p className="text-sm text-slate-600 print:text-black">Điện thoại: 1900 1234</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold uppercase tracking-widest text-slate-400 print:text-black">Toa Thuốc</h2>
          <p className="font-mono text-sm font-semibold mt-1">Mã Bệnh Án: {record.recordCode}</p>
          <p className="font-mono text-sm">{prescription?.prescriptionCode ? `Mã Đơn: ${prescription.prescriptionCode}` : ""}</p>
        </div>
      </div>

      {/* PATIENT INFO */}
      <div className="mb-8 grid grid-cols-2 gap-x-12 gap-y-2 text-sm">
        <div className="col-span-2">
          <span className="font-semibold w-24 inline-block">Họ và tên:</span>
          <span className="text-base uppercase font-bold">{record.patientName || "—"}</span>
        </div>
        <div className="col-span-2">
          <span className="font-semibold w-24 inline-block">Chẩn đoán:</span>
          <span className="font-medium text-base">{record.diagnosis}</span>
        </div>
        <div className="col-span-2">
          <span className="font-semibold w-24 inline-block">Lời dặn:</span>
          <span>{record.treatmentPlan || "Không có"}</span>
        </div>
      </div>

      {/* PRESCRIPTION LIST */}
      <div className="mb-12 min-h-[300px]">
        <h3 className="font-bold text-lg mb-4 border-b border-dashed border-slate-300 pb-2 print:border-black">Chỉ Định Thuốc</h3>
        
        {(!prescription || !prescription.details || prescription.details.length === 0) ? (
          <p className="italic text-slate-500 print:text-black">Không có thuốc được kê trong bệnh án này.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black">
                <th className="py-2 px-1 text-left font-bold w-12">STT</th>
                <th className="py-2 px-1 text-left font-bold">Tên Thuốc</th>
                <th className="py-2 px-1 text-center font-bold w-20">Số Lượng</th>
                <th className="py-2 px-1 text-left font-bold w-1/2">Liều Dùng</th>
              </tr>
            </thead>
            <tbody>
              {prescription.details.map((detail, index) => {
                const med = medicines[detail.medicineId]
                return (
                  <tr key={detail.id} className="border-b border-dashed border-slate-200 print:border-slate-400">
                    <td className="py-3 px-1 font-mono text-slate-500 print:text-black">{String(index + 1).padStart(2, '0')}</td>
                    <td className="py-3 px-1 font-bold">
                      {med?.name || `Thuốc #${detail.medicineId}`}
                      {med?.unit && <span className="ml-1 text-xs font-normal text-slate-500 print:text-black">({med.unit})</span>}
                    </td>
                    <td className="py-3 px-1 text-center font-bold text-base">{detail.quantity}</td>
                    <td className="py-3 px-1 italic text-slate-700 print:text-black">{detail.dosage}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}

        {prescription?.notes && (
          <div className="mt-6 border border-slate-200 p-4 rounded bg-slate-50 print:bg-white print:border-black">
            <p className="text-xs font-bold uppercase tracking-wider mb-1">Ghi chú của bác sĩ:</p>
            <p className="text-sm italic">{prescription.notes}</p>
          </div>
        )}
      </div>

      {/* FOOTER & SIGNATURE */}
      <div className="flex justify-between items-start mt-16 text-sm">
        <div className="w-1/2">
          {/* Lời dặn dò chung */}
          <p className="italic text-slate-500 print:text-black">
            - Khám lại nhớ mang theo toa này.<br />
            - Tái khám sau khi hết thuốc hoặc có dấu hiệu bất thường.
          </p>
        </div>
        <div className="w-1/2 text-center">
          <p className="mb-1">Ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}</p>
          <p className="font-bold uppercase tracking-wider">Bác sĩ điều trị</p>
          <div className="h-24"></div> {/* Khoảng trống cho chữ ký */}
          <p className="font-semibold text-slate-400 print:text-black">(Ký và ghi rõ họ tên)</p>
        </div>
      </div>

      {/* Tắt nút Print thủ công đi khi in */}
      <div className="mt-12 text-center print:hidden">
        <button 
          onClick={() => window.print()}
          className="px-6 py-2 bg-slate-900 text-white rounded-lg shadow font-medium hover:bg-slate-800 transition-colors"
        >
          In Toa Thuốc Lại
        </button>
      </div>
    </div>
  )
}
