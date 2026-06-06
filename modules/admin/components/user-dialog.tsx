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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCreateUserMutation, useUpdateUserMutation } from "@/modules/admin/hooks/use-user-mutations"
import type { UserRecord } from "@/core/api/userService"

const userSchema = z.object({
  username: z.string().min(3, "Tối thiểu 3 ký tự"),
  password: z.string().min(4, "Tối thiểu 4 ký tự").optional().or(z.literal("")),
  role: z.enum(["ADMIN", "DOCTOR", "PATIENT"]),
  status: z.enum(["ACTIVE", "INACTIVE", "BLOCKED"]),
})

type UserFormValues = z.infer<typeof userSchema>

interface UserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData: UserRecord | null
}

export function UserDialog({ open, onOpenChange, initialData }: UserDialogProps) {
  const isEditing = initialData != null
  const createMutation = useCreateUserMutation()
  const updateMutation = useUpdateUserMutation()

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: "",
      password: "",
      role: "PATIENT",
      status: "ACTIVE",
    },
  })

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({
          username: initialData.username,
          password: "",
          role: initialData.role,
          status: initialData.status,
        })
      } else {
        form.reset({ username: "", password: "", role: "PATIENT", status: "ACTIVE" })
      }
    }
  }, [open, initialData, form])

  const onSubmit = (values: UserFormValues) => {
    if (isEditing) {
      updateMutation.mutate(
        { id: initialData.id, data: { role: values.role, status: values.status } },
        { onSuccess: () => onOpenChange(false) }
      )
    } else {
      createMutation.mutate(
        { username: values.username, password: values.password || "default", role: values.role, status: values.status },
        { onSuccess: () => onOpenChange(false) }
      )
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <MasterModal open={open} onOpenChange={onOpenChange}>
      <MasterModalContent className="sm:max-w-md">
        <MasterModalHeader title={isEditing ? "Chỉnh sửa tài khoản" : "Thêm tài khoản mới"} />
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="username">Tên đăng nhập</Label>
            <Input
              id="username"
              disabled={isEditing}
              {...form.register("username")}
              placeholder="vd: bacsi_tran"
            />
            {form.formState.errors.username && (
              <p className="text-xs text-red-500">{form.formState.errors.username.message}</p>
            )}
          </div>

          {!isEditing && (
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                {...form.register("password")}
                placeholder="Nhập mật khẩu"
              />
              {form.formState.errors.password && (
                <p className="text-xs text-red-500">{form.formState.errors.password.message}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label>Vai trò</Label>
            <Select
              value={form.watch("role")}
              onValueChange={(v) => form.setValue("role", v as UserFormValues["role"])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Quản trị</SelectItem>
                <SelectItem value="DOCTOR">Bác sĩ</SelectItem>
                <SelectItem value="PATIENT">Bệnh nhân</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Trạng thái</Label>
            <Select
              value={form.watch("status")}
              onValueChange={(v) => form.setValue("status", v as UserFormValues["status"])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                <SelectItem value="INACTIVE">Ngưng hoạt động</SelectItem>
                <SelectItem value="BLOCKED">Đã khóa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <MasterModalFooter>
            <MasterModalAction variant="secondary" type="button" onClick={() => onOpenChange(false)}>
              Hủy
            </MasterModalAction>
            <MasterModalAction type="submit" disabled={isPending}>
              {isPending ? "Đang xử lý..." : isEditing ? "Cập nhật" : "Tạo mới"}
            </MasterModalAction>
          </MasterModalFooter>
        </form>
      </MasterModalContent>
    </MasterModal>
  )
}
