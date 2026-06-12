import { useMutation, useQueryClient } from "@tanstack/react-query"
import { receptionistService, type ReceptionistCreateRequest, type ReceptionistUpdateRequest } from "@/core/api/receptionistService"
import { queryKeys } from "@/shared/query/query-keys"
import { toast } from "sonner"

export function useCreateReceptionistMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ReceptionistCreateRequest) => receptionistService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.receptionists.all })
      toast.success("Thêm lễ tân thành công")
    },
    onError: () => toast.error("Không thể thêm lễ tân"),
  })
}

export function useUpdateReceptionistMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ReceptionistUpdateRequest }) =>
      receptionistService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.receptionists.all })
      toast.success("Cập nhật lễ tân thành công")
    },
    onError: () => toast.error("Không thể cập nhật"),
  })
}

export function useDeleteReceptionistMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => receptionistService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.receptionists.all })
      toast.success("Đã xóa lễ tân")
    },
    onError: () => toast.error("Không thể xóa"),
  })
}
