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
import { useCreateReceptionistMutation, useUpdateReceptionistMutation } from "@/modules/admin/hooks/use-receptionist-mutations"
import type { ReceptionistRecord } from "@/core/api/receptionistService"

const receptionistSchema = z.object({
  username: z.string().min(3, "Tối thiểu 3 ký tự"),
  password: z.string().min(4, "Tối thiểu 4 ký tự").optional().or(z.literal("")),
  fullName: z.string().min(2, "Tối thiểu 2 ký tự"),
  department: z.string().min(2, "Tối thiểu 2 ký tự"),
  phone: z.string().min(9, "Số điện thoại không hợp lệ"),
  email: z.string().email("Email không hợp lệ"),
})

type ReceptionistFormValues = z.infer<typeof receptionistSchema>

interface ReceptionistDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData: ReceptionistRecord | null
}

export function ReceptionistDialog({ open, onOpenChange, initialData }: ReceptionistDialogProps) {
  const isEditing = initialData != null
  const createMutation = useCreateReceptionistMutation()
  const updateMutation = useUpdateReceptionistMutation()

  const form = useForm<ReceptionistFormValues>({
    resolver: zodResolver(receptionistSchema),
    defaultValues: {
      username: "",
      password: "",
      fullName: "",
      department: "",
      phone: "",
      email: "",
    },
  })

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({
          username: initialData.username,
          password: "",
          fullName: initialData.fullName,
          department: initialData.department,
          phone: initialData.phone,
          email: initialData.email,
        })
      } else {
        form.reset({ username: "", password: "", fullName: "", department: "", phone: "", email: "" })
      }
    }
  }, [open, initialData, form])

  const onSubmit = (values: ReceptionistFormValues) => {
    if (isEditing) {
      updateMutation.mutate(
        {
          id: initialData.id,
          data: {
            fullName: values.fullName,
            department: values.department,
            phone: values.phone,
            email: values.email,
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
          department: values.department || "Phòng khám",
          phone: values.phone,
          email: values.email,
        },
        { onSuccess: () => onOpenChange(false) }
      )
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <MasterModal open={open} onOpenChange={onOpenChange}>
      <MasterModalContent className="sm:max-w-lg">
        <MasterModalHeader title={isEditing ? "Chỉnh sửa Lễ tân" : "Thêm Lễ tân mới"} />
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-4 px-6 py-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">Tên đăng nhập</Label>
              <Input id="username" disabled={isEditing} {...form.register("username")} placeholder="letan_xxx" />
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
            <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Họ và tên</Label>
            <Input id="fullName" {...form.register("fullName")} placeholder="Trần Thị B" />
            {form.formState.errors.fullName && (
              <p className="text-xs text-red-500">{form.formState.errors.fullName.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="department">Phòng ban</Label>
            <Input id="department" {...form.register("department")} placeholder="Phòng khám" />
            {form.formState.errors.department && (
              <p className="text-xs text-red-500">{form.formState.errors.department.message}</p>
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
              <Input id="email" {...form.register("email")} placeholder="lt@emr.local" />
              {form.formState.errors.email && (
                <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>
              )}
            </div>
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
