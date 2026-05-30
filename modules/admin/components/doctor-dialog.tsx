"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  MasterModal,
  MasterModalContent,
  MasterModalHeader,
  MasterModalFooter,
  MasterModalAction,
} from "@/components/ui/master-modal"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCreateDoctorMutation, useUpdateDoctorMutation } from "@/modules/admin/hooks/use-doctor-mutations"
import type { DoctorRecord } from "@/core/api/doctorService"

const doctorSchema = z.object({
  username: z.string().min(3, "Tối thiểu 3 ký tự"),
  password: z.string().min(4, "Tối thiểu 4 ký tự").optional().or(z.literal("")),
  fullName: z.string().min(2, "Tối thiểu 2 ký tự"),
  specialty: z.string().min(2, "Vui lòng nhập chuyên khoa"),
  phone: z.string().min(9, "Số điện thoại không hợp lệ"),
  email: z.string().email("Email không hợp lệ"),
  roomNumber: z.string().min(1, "Vui lòng nhập phòng khám"),
})

type DoctorFormValues = z.infer<typeof doctorSchema>

interface DoctorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData: DoctorRecord | null
}

export function DoctorDialog({ open, onOpenChange, initialData }: DoctorDialogProps) {
  const isEditing = initialData != null
  const createMutation = useCreateDoctorMutation()
  const updateMutation = useUpdateDoctorMutation()

  const form = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorSchema),
    defaultValues: {
      username: "",
      password: "",
      fullName: "",
      specialty: "",
      phone: "",
      email: "",
      roomNumber: "",
    },
  })

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({
          username: initialData.username,
          password: "",
          fullName: initialData.fullName,
          specialty: initialData.specialty,
          phone: initialData.phone,
          email: initialData.email,
          roomNumber: initialData.roomNumber,
        })
      } else {
        form.reset({ username: "", password: "", fullName: "", specialty: "", phone: "", email: "", roomNumber: "" })
      }
    }
  }, [open, initialData, form])

  const onSubmit = (values: DoctorFormValues) => {
    if (isEditing) {
      updateMutation.mutate(
        {
          id: initialData.id,
          data: {
            fullName: values.fullName,
            specialty: values.specialty,
            phone: values.phone,
            email: values.email,
            roomNumber: values.roomNumber,
          },
        },
        { onSuccess: () => onOpenChange(false) }
      )
    } else {
      createMutation.mutate(
        {
          username: values.username,
          password: values.password || "default",
          fullName: values.fullName,
          specialty: values.specialty,
          phone: values.phone,
          email: values.email,
          roomNumber: values.roomNumber,
        },
        { onSuccess: () => onOpenChange(false) }
      )
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <MasterModal open={open} onOpenChange={onOpenChange}>
      <MasterModalContent className="sm:max-w-lg">
        <MasterModalHeader title={isEditing ? "Chỉnh sửa Bác sĩ" : "Thêm Bác sĩ mới"} />
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">Tên đăng nhập</Label>
              <Input id="username" disabled={isEditing} {...form.register("username")} placeholder="bacsi_xxx" />
              {form.formState.errors.username && (
                <p className="text-xs text-red-500">{form.formState.errors.username.message}</p>
              )}
            </div>
            {!isEditing && (
              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <Input id="password" type="password" {...form.register("password")} />
                {form.formState.errors.password && (
                  <p className="text-xs text-red-500">{form.formState.errors.password.message}</p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Họ và tên</Label>
            <Input id="fullName" {...form.register("fullName")} placeholder="BS. Nguyễn Văn A" />
            {form.formState.errors.fullName && (
              <p className="text-xs text-red-500">{form.formState.errors.fullName.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="specialty">Chuyên khoa</Label>
              <Input id="specialty" {...form.register("specialty")} placeholder="Nội tổng quát" />
              {form.formState.errors.specialty && (
                <p className="text-xs text-red-500">{form.formState.errors.specialty.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="roomNumber">Phòng khám</Label>
              <Input id="roomNumber" {...form.register("roomNumber")} placeholder="P101" />
              {form.formState.errors.roomNumber && (
                <p className="text-xs text-red-500">{form.formState.errors.roomNumber.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input id="phone" {...form.register("phone")} placeholder="0901234567" />
              {form.formState.errors.phone && (
                <p className="text-xs text-red-500">{form.formState.errors.phone.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" {...form.register("email")} placeholder="bs@emr.local" />
              {form.formState.errors.email && (
                <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>
              )}
            </div>
          </div>

          <MasterModalFooter>
            <MasterModalAction variant="secondary" type="button" onClick={() => onOpenChange(false)}>
              Hủy
            </MasterModalAction>
            <MasterModalAction type="submit" disabled={isPending}>
              {isPending ? "Đang xử lý..." : isEditing ? "Cập nhật" : "Thêm mới"}
            </MasterModalAction>
          </MasterModalFooter>
        </form>
      </MasterModalContent>
    </MasterModal>
  )
}
