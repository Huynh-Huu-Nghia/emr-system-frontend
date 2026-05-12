import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { patientService } from "@/core/api/patientService"
import { normalizeUnknownError } from "@/shared/lib/error/normalize-api-error"
import { queryKeys } from "@/shared/query/query-keys"

export function useDeletePatientMutation(
  opts?: Partial<{
    onSuccessMessage: string
    onErrorMessage: string
  }>
) {
  const qc = useQueryClient()
  const onSuccessMsg = opts?.onSuccessMessage ?? "Xóa bệnh nhân thành công"
  const onErrMsg = opts?.onErrorMessage ?? "Xóa bệnh nhân thất bại"

  return useMutation({
    mutationFn: async (patientId: number) => patientService.deletePatient(patientId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.patients.all })
      toast.success(onSuccessMsg)
    },
    onError: (error) => {
      const { message } = normalizeUnknownError(error)
      toast.error(onErrMsg, { description: message })
      console.error("Delete patient error:", error)
    },
  })
}
