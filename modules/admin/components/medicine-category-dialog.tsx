"use client"

import { useEffect } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
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
import { useCreateMedicineCategoryMutation, useUpdateMedicineCategoryMutation } from "@/modules/admin/hooks/use-medicine-category-mutations"
import type { MedicineCategory } from "@/core/api/medicineCategoryService"

interface MedicineCategoryFormValues {
  name: string
  nameVi: string
  description: string
  displayOrder: string
}

const categorySchema = z.object({
  name: z.string().min(2, "Tối thiểu 2 ký tự"),
  nameVi: z.string().min(2, "Tối thiểu 2 ký tự"),
  description: z.string().optional(),
  displayOrder: z.string().min(1, "Vui lòng nhập thứ tự hiển thị"),
})

interface MedicineCategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData: MedicineCategory | null
}

export function MedicineCategoryDialog({ open, onOpenChange, initialData }: MedicineCategoryDialogProps) {
  const isEditing = initialData != null
  const createMutation = useCreateMedicineCategoryMutation()
  const updateMutation = useUpdateMedicineCategoryMutation()

  const form = useForm<MedicineCategoryFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(categorySchema) as any,
    defaultValues: { name: "", nameVi: "", description: "", displayOrder: "0" },
  })

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({
          name: initialData.name,
          nameVi: initialData.nameVi,
          description: initialData.description || "",
          displayOrder: String(initialData.displayOrder),
        })
      } else {
        form.reset({ name: "", nameVi: "", description: "", displayOrder: "0" })
      }
    }
  }, [open, initialData, form])

  const onSubmit: SubmitHandler<MedicineCategoryFormValues> = (values) => {
    const payload = {
      name: values.name,
      nameVi: values.nameVi,
      description: values.description,
      displayOrder: parseInt(values.displayOrder),
    }
    if (isEditing) {
      updateMutation.mutate(
        { id: initialData.id, data: payload },
        { onSuccess: () => onOpenChange(false) }
      )
    } else {
      createMutation.mutate(payload, { onSuccess: () => onOpenChange(false) })
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <MasterModal open={open} onOpenChange={onOpenChange}>
      <MasterModalContent className="sm:max-w-md">
        <MasterModalHeader title={isEditing ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"} />
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-4 px-6 py-5">
          <div className="space-y-2">
            <Label htmlFor="name">Tên danh mục (Tiếng Anh)</Label>
            <Input id="name" {...form.register("name")} placeholder="Painkillers" />
            {form.formState.errors.name && (
              <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="nameVi">Tên danh mục (Tiếng Việt)</Label>
            <Input id="nameVi" {...form.register("nameVi")} placeholder="Thuốc giảm đau" />
            {form.formState.errors.nameVi && (
              <p className="text-xs text-red-500">{form.formState.errors.nameVi.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả chi tiết</Label>
            <Input id="description" {...form.register("description")} placeholder="Mô tả..." />
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
