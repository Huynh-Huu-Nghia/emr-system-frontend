"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { GENDER_LABELS } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { User, Phone, MapPin, Calendar, ShieldCheck, KeyRound } from "lucide-react"
import type { Patient } from "@/modules/patient/types"
import { patientFormSchema, type PatientFormValues } from "@/modules/patient/schemas/patient-form-schema"
import { useCreatePatientMutation } from "@/modules/patient/hooks/use-create-patient-mutation"
import { useUpdatePatientMutation } from "@/modules/patient/hooks/use-update-patient-mutation"

interface PatientDialogProps {
  isOpen: boolean
  onClose: () => void
  initialData?: Patient | null
  /** Optional hook after mutations succeed (e.g. extra analytics). Cache is invalidated in mutations. */
  onSuccess?: () => void
}

export function PatientDialog({
  isOpen,
  onClose,
  initialData,
  onSuccess,
}: PatientDialogProps) {
  const createMutation = useCreatePatientMutation()
  const updateMutation = useUpdatePatientMutation()
  const saving = createMutation.isPending || updateMutation.isPending

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      full_name: "",
      dob: "",
      gender: "MALE",
      phone: "",
      address: "",
      insurance_code: "",
      create_account: false,
      username: "",
      password: "",
    },
  })

  const createAccount = form.watch("create_account")

  React.useEffect(() => {
    if (!isOpen) return
    if (initialData) {
      form.reset({
        full_name: initialData.full_name,
        dob: initialData.dob,
        gender: initialData.gender,
        phone: initialData.phone,
        address: initialData.address || "",
        insurance_code: initialData.insurance_code || "",
        create_account: false,
        username: "",
        password: "",
      })
    } else {
      form.reset({
        full_name: "",
        dob: "",
        gender: "MALE",
        phone: "",
        address: "",
        insurance_code: "",
        create_account: false,
        username: "",
        password: "",
      })
    }
  }, [isOpen, initialData, form])

  const onSubmit = async (values: PatientFormValues) => {
    try {
      if (initialData) {
        await updateMutation.mutateAsync({ id: initialData.id, data: values })
      } else {
        await createMutation.mutateAsync({
          ...values,
          username: values.create_account ? values.username?.trim() : "",
          password: values.create_account ? values.password : "",
        })
      }
      onSuccess?.()
      onClose()
    } catch {
      /* toast handled in mutation onError */
    }
  }

  const inputStyle =
    "h-10 w-full rounded-none border-0 border-b-2 border-slate-200 bg-transparent px-0 pb-1 text-slate-700 shadow-none outline-none transition-colors focus-visible:border-medical-primary focus-visible:ring-0"

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Chỉnh sửa hồ sơ" : "Tiếp nhận Bệnh nhân"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-5 px-6 py-5">
              <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Họ và Tên
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        className={inputStyle}
                        placeholder="VD: Nguyễn Văn A"
                      />
                      <User className="pointer-events-none absolute right-0 top-2 h-4 w-4 text-slate-300" />
                    </div>
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="dob"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Ngày sinh
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type="date" {...field} className={inputStyle} />
                        <Calendar className="pointer-events-none absolute right-0 top-2 h-4 w-4 text-slate-300" />
                      </div>
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Giới tính
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-10 rounded-none border-0 border-b-2 border-slate-200 bg-transparent px-0 shadow-none focus:border-medical-primary focus:ring-0">
                          <SelectValue placeholder="Chọn" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(GENDER_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Điện thoại
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          className={inputStyle}
                          placeholder="09xxxxxxx"
                        />
                        <Phone className="pointer-events-none absolute right-0 top-2 h-4 w-4 text-slate-300" />
                      </div>
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="insurance_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Mã BHYT
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          className={inputStyle}
                          placeholder="GD479..."
                        />
                        <ShieldCheck className="pointer-events-none absolute right-0 top-2 h-4 w-4 text-slate-300" />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Địa chỉ liên hệ
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        className={inputStyle}
                        placeholder="Số nhà, đường, quận/huyện..."
                      />
                      <MapPin className="pointer-events-none absolute right-0 top-2 h-4 w-4 text-slate-300" />
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />

            {!initialData ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <FormField
                  control={form.control}
                  name="create_account"
                  render={({ field }) => (
                    <FormItem>
                      <label className="flex items-start gap-3 text-sm font-medium text-slate-700">
                        <input
                          type="checkbox"
                          checked={Boolean(field.value)}
                          onChange={(event) => field.onChange(event.target.checked)}
                          className="mt-1 h-4 w-4 rounded border-slate-300 text-medical-primary"
                        />
                        <span>
                          Tạo tài khoản đăng nhập cho bệnh nhân
                          <span className="mt-1 block text-xs font-normal text-slate-500">
                            Chỉ bật khi bệnh nhân cần tra cứu thông tin qua hệ thống.
                          </span>
                        </span>
                      </label>
                    </FormItem>
                  )}
                />

                {createAccount ? (
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            Tên đăng nhập
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input {...field} className={inputStyle} placeholder="patient_a" />
                              <User className="pointer-events-none absolute right-0 top-2 h-4 w-4 text-slate-300" />
                            </div>
                          </FormControl>
                          <FormMessage className="text-[11px]" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            Mật khẩu
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input {...field} type="password" className={inputStyle} placeholder="Tối thiểu 6 ký tự" />
                              <KeyRound className="pointer-events-none absolute right-0 top-2 h-4 w-4 text-slate-300" />
                            </div>
                          </FormControl>
                          <FormMessage className="text-[11px]" />
                        </FormItem>
                      )}
                    />
                  </div>
                ) : null}
              </div>
            ) : null}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                disabled={saving}
                onClick={onClose}
                className="rounded-full font-semibold text-slate-500 hover:bg-slate-200"
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                loading={saving}
                className="rounded-full bg-medical-primary px-10 shadow-lg shadow-medical-primary/25 transition-all hover:bg-medical-dark active:scale-95"
              >
                {initialData ? "Cập nhật dữ liệu" : "Lưu hồ sơ mới"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
