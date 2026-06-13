import { useMutation, useQueryClient } from "@tanstack/react-query"
import { medicineCategoryService, type MedicineCategoryCreateRequest, type MedicineCategoryUpdateRequest } from "@/core/api/medicineCategoryService"
import { toast } from "sonner"

export function useCreateMedicineCategoryMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: MedicineCategoryCreateRequest) => medicineCategoryService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["medicine-categories"] })
      toast.success("Thêm danh mục thành công")
    },
    onError: () => toast.error("Không thể thêm danh mục"),
  })
}

export function useUpdateMedicineCategoryMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: MedicineCategoryUpdateRequest }) =>
      medicineCategoryService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["medicine-categories"] })
      toast.success("Cập nhật danh mục thành công")
    },
    onError: () => toast.error("Không thể cập nhật danh mục"),
  })
}

export function useDeleteMedicineCategoryMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => medicineCategoryService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["medicine-categories"] })
      toast.success("Đã xóa danh mục")
    },
    onError: () => toast.error("Không thể xóa danh mục"),
  })
}
