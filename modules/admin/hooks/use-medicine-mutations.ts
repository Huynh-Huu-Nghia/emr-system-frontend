import { useMutation, useQueryClient } from "@tanstack/react-query"
import { medicineService, type MedicineCreateRequest, type MedicineUpdateRequest } from "@/core/api/medicineService"
import { queryKeys } from "@/shared/query/query-keys"
import { toast } from "sonner"

export function useCreateMedicineMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: MedicineCreateRequest) => medicineService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.medicines.all })
      toast.success("Thêm thuốc thành công")
    },
    onError: () => toast.error("Không thể thêm thuốc"),
  })
}

export function useUpdateMedicineMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: MedicineUpdateRequest }) =>
      medicineService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.medicines.all })
      toast.success("Cập nhật thuốc thành công")
    },
    onError: () => toast.error("Không thể cập nhật"),
  })
}

export function useDeleteMedicineMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => medicineService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.medicines.all })
      toast.success("Đã xóa thuốc")
    },
    onError: () => toast.error("Không thể xóa"),
  })
}
