"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GENDER_LABELS } from "@/lib/constants"
import { patientService, Patient } from "@/core/api/patientService"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { User, Phone, MapPin, Calendar, ShieldCheck } from "lucide-react"

// ✅ Schema cập nhật khớp 100% Database: full_name, phone, dob, insurance_code
/**
 * Validation schema for patient form data.
 * Ensures data integrity and provides user-friendly error messages.
 * Uses snake_case field names to match database schema.
 */
const patientSchema = z.object({
  full_name: z.string().min(2, "Họ tên quá ngắn").max(100, "Họ tên quá dài"),
  dob: z.string().min(1, "Vui lòng chọn ngày sinh"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  phone: z.string().min(10, "Số điện thoại không hợp lệ").regex(/^(\+84|0)[3-9]\d{8}$/, "Số điện thoại không đúng định dạng"),
  address: z.string().optional(),
  insurance_code: z.string().optional(),
})

/**
 * Props for the PatientDialog component.
 * @interface PatientDialogProps
 * @property {boolean} isOpen - Controls dialog visibility.
 * @property {() => void} onClose - Callback to close the dialog.
 * @property {Patient | null} [initialData] - Patient data for editing, null for new patient.
 * @property {() => void} [onSuccess] - Callback executed after successful save.
 */
interface PatientDialogProps {
  isOpen: boolean
  onClose: () => void
  initialData?: Patient | null
  onSuccess?: () => void
}

/**
 * PatientDialog Component
 *
 * Modal dialog for creating and editing patient records.
 * Key design decisions:
 * - Uses react-hook-form with Zod validation for robust form handling.
 * - Resets form state when dialog opens/closes to prevent stale data.
 * - Supports both registered patients (with user_id) and offline patients (null user_id).
 * - Provides immediate feedback via toast notifications.
 * - Maintains consistent styling with the application's medical theme.
 */
export function PatientDialog({ isOpen, onClose, initialData, onSuccess }: PatientDialogProps) {
  const form = useForm<z.infer<typeof patientSchema>>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      full_name: "",
      dob: "",
      gender: "MALE",
      phone: "",
      address: "",
      insurance_code: "",
    },
  })

  /**
   * Effect to reset form when dialog state changes.
   * Ensures form reflects current editing state or defaults for new patients.
   * Handles optional fields gracefully for both create and edit scenarios.
   */
  React.useEffect(() => {
    if (isOpen) {
      if (initialData) {
        form.reset({
          full_name: initialData.full_name,
          dob: initialData.dob,
          gender: initialData.gender,
          phone: initialData.phone,
          address: initialData.address || "",
          insurance_code: initialData.insurance_code || "",
        })
      } else {
        form.reset({ full_name: "", dob: "", gender: "MALE", phone: "", address: "", insurance_code: "" })
      }
    }
  }, [isOpen, initialData, form])

  /**
   * Handles form submission for both create and update operations.
   * Uses service layer for data persistence and provides user feedback.
   * Closes dialog and triggers success callback on completion.
   * @param {z.infer<typeof patientSchema>} values - Validated form data.
   */
  const onSubmit = async (values: z.infer<typeof patientSchema>) => {
    try {
      if (initialData) {
        await patientService.updatePatient(initialData.id, values)
        toast.success("Cập nhật thành công")
      } else {
        await patientService.createPatient(values)
        toast.success("Tiếp nhận bệnh nhân thành công")
      }
      onSuccess?.()
      onClose()
    } catch (error) {
      toast.error("Lỗi thao tác dữ liệu")
      console.error("Patient save error:", error)
    }
  }

  const inputStyle = "w-full h-10 bg-transparent border-0 border-b-2 border-slate-200 focus-visible:ring-0 focus-visible:border-medical-primary outline-none text-slate-700 transition-colors px-0 shadow-none rounded-none pb-1"

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white rounded-2xl p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-bold text-medical-dark uppercase tracking-tight">
            {initialData ? "Chỉnh sửa hồ sơ" : "Tiếp nhận Bệnh nhân"}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 px-6 py-4">
            
            {/* Họ và tên */}
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Họ và Tên</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input {...field} className={inputStyle} placeholder="VD: Nguyễn Văn A" />
                      <User className="absolute right-0 top-2 h-4 w-4 text-slate-300" />
                    </div>
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-6">
              {/* Ngày sinh - Mới */}
              <FormField
                control={form.control}
                name="dob"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Ngày sinh</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type="date" {...field} className={inputStyle} />
                        <Calendar className="absolute right-0 top-2 h-4 w-4 text-slate-300 pointer-events-none" />
                      </div>
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />

              {/* Giới tính */}
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Giới tính</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-0 border-b-2 border-slate-200 rounded-none px-0 shadow-none focus:ring-0 focus:border-medical-primary h-10 bg-transparent">
                          <SelectValue placeholder="Chọn" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(GENDER_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Số điện thoại */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Điện thoại</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input {...field} className={inputStyle} placeholder="09xxxxxxx" />
                        <Phone className="absolute right-0 top-2 h-4 w-4 text-slate-300" />
                      </div>
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />

              {/* Mã BHYT - Mới */}
              <FormField
                control={form.control}
                name="insurance_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Mã BHYT</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input {...field} className={inputStyle} placeholder="GD479..." />
                        <ShieldCheck className="absolute right-0 top-2 h-4 w-4 text-slate-300" />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Địa chỉ */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Địa chỉ liên hệ</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input {...field} className={inputStyle} placeholder="Số nhà, đường, quận/huyện..." />
                      <MapPin className="absolute right-0 top-2 h-4 w-4 text-slate-300" />
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter className="bg-slate-50 p-6 -mx-6 -mb-6 mt-6 gap-3">
              <Button type="button" variant="ghost" onClick={onClose} className="rounded-full font-semibold text-slate-500 hover:bg-slate-200">
                Hủy bỏ
              </Button>
              <Button type="submit" className="rounded-full px-10 bg-medical-primary hover:bg-medical-dark shadow-lg shadow-medical-primary/25 transition-all active:scale-95">
                {initialData ? "Cập nhật dữ liệu" : "Lưu hồ sơ mới"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}