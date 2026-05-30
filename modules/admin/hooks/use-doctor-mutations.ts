import { useMutation, useQueryClient } from "@tanstack/react-query"
import { doctorService, type DoctorCreateRequest, type DoctorUpdateRequest } from "@/core/api/doctorService"
import { queryKeys } from "@/shared/query/query-keys"
import { toast } from "sonner"

export function useCreateDoctorMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: DoctorCreateRequest) => doctorService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.doctors.all })
      toast.success("Thêm bác sĩ thành công")
    },
    onError: () => toast.error("Không thể thêm bác sĩ"),
  })
}

export function useUpdateDoctorMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: DoctorUpdateRequest }) =>
      doctorService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.doctors.all })
      toast.success("Cập nhật bác sĩ thành công")
    },
    onError: () => toast.error("Không thể cập nhật"),
  })
}

export function useDeleteDoctorMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => doctorService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.doctors.all })
      toast.success("Đã xóa bác sĩ")
    },
    onError: () => toast.error("Không thể xóa"),
  })
}
