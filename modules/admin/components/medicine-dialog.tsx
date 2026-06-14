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
import { useCreateMedicineMutation, useUpdateMedicineMutation } from "@/modules/admin/hooks/use-medicine-mutations"
import { useMedicineCategoriesQuery } from "@/modules/admin/hooks/use-medicine-categories-query"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Medicine } from "@/core/api/medicineService"

interface MedicineFormValues {
  name: string
  unit: string
  price: string
  stockQuantity: string
  expiryDate: string
  categoryId: string
}

const medicineSchema = z.object({
  name: z.string().min(2, "Tối thiểu 2 ký tự"),
  unit: z.string().min(1, "Vui lòng nhập đơn vị"),
  price: z.string().min(1, "Vui lòng nhập giá"),
  stockQuantity: z.string().min(1, "Vui lòng nhập số lượng"),
  expiryDate: z.string().min(1, "Vui lòng nhập hạn sử dụng"),
  categoryId: z.string().optional(),
})

interface MedicineDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData: Medicine | null
}

export function MedicineDialog({ open, onOpenChange, initialData }: MedicineDialogProps) {
  const isEditing = initialData != null
  const createMutation = useCreateMedicineMutation()
  const updateMutation = useUpdateMedicineMutation()
  const { data: categories = [] } = useMedicineCategoriesQuery()

  const form = useForm<MedicineFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(medicineSchema) as any,
    defaultValues: { name: "", unit: "", price: "0", stockQuantity: "0", expiryDate: "", categoryId: "0" },
  })

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({
          name: initialData.name,
          unit: initialData.unit,
          price: String(initialData.price),
          stockQuantity: String(initialData.stockQuantity),
          expiryDate: initialData.expiryDate ? initialData.expiryDate.slice(0, 10) : "",
          categoryId: initialData.categoryId ? String(initialData.categoryId) : "0",
        })
      } else {
        form.reset({ name: "", unit: "", price: "0", stockQuantity: "0", expiryDate: "", categoryId: "0" })
      }
    }
  }, [open, initialData, form])

  const onSubmit: SubmitHandler<MedicineFormValues> = (values) => {
    const payload = {
      name: values.name,
      unit: values.unit,
      price: Number(values.price),
      stockQuantity: Number(values.stockQuantity),
      expiryDate: values.expiryDate,
      categoryId: values.categoryId && values.categoryId !== "0" ? Number(values.categoryId) : null,
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
        <MasterModalHeader title={isEditing ? "Chỉnh sửa thuốc" : "Thêm thuốc mới"} />
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-4 px-6 py-5">
          <div className="space-y-2">
            <Label htmlFor="categoryId">Phân loại thuốc</Label>
            <Select 
              value={form.watch("categoryId")} 
              onValueChange={(val) => form.setValue("categoryId", val)}
            >
              <SelectTrigger id="categoryId">
                <SelectValue placeholder="Chọn danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Không phân loại</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.nameVi} ({c.name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Tên thuốc</Label>
            <Input id="name" {...form.register("name")} placeholder="Paracetamol 500mg" />
            {form.formState.errors.name && (
              <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unit">Đơn vị</Label>
              <Input id="unit" {...form.register("unit")} placeholder="Viên" />
              {form.formState.errors.unit && (
                <p className="text-xs text-red-500">{form.formState.errors.unit.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Đơn giá (VNĐ)</Label>
              <Input id="price" type="number" {...form.register("price")} />
              {form.formState.errors.price && (
                <p className="text-xs text-red-500">{form.formState.errors.price.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stockQuantity">Tồn kho</Label>
              <Input id="stockQuantity" type="number" {...form.register("stockQuantity")} />
              {form.formState.errors.stockQuantity && (
                <p className="text-xs text-red-500">{form.formState.errors.stockQuantity.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Hạn sử dụng</Label>
              <Input id="expiryDate" type="date" {...form.register("expiryDate")} />
              {form.formState.errors.expiryDate && (
                <p className="text-xs text-red-500">{form.formState.errors.expiryDate.message}</p>
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
