import { useMutation, useQueryClient } from "@tanstack/react-query"
import { userService, type UserCreateRequest, type UserUpdateRequest } from "@/core/api/userService"
import { queryKeys } from "@/shared/query/query-keys"
import { toast } from "sonner"

export function useCreateUserMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UserCreateRequest) => userService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.users.all })
      toast.success("Tạo tài khoản thành công")
    },
    onError: () => toast.error("Không thể tạo tài khoản"),
  })
}

export function useUpdateUserMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UserUpdateRequest }) =>
      userService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.users.all })
      toast.success("Cập nhật thành công")
    },
    onError: () => toast.error("Không thể cập nhật"),
  })
}

export function useDeleteUserMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => userService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.users.all })
      toast.success("Đã xóa tài khoản")
    },
    onError: () => toast.error("Không thể xóa tài khoản"),
  })
}
