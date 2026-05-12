import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import type { PatientCreateRequest } from "@/core/api/patientService"
import { patientService } from "@/core/api/patientService"
import { normalizeUnknownError } from "@/shared/lib/error/normalize-api-error"
import { queryKeys } from "@/shared/query/query-keys"

export function useUpdatePatientMutation() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (vars: { id: number; data: Partial<PatientCreateRequest> }) =>
      patientService.updatePatient(vars.id, vars.data),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.patients.all })
      toast.success("Cập nhật thành công")
    },
    onError: (error) => {
      const { message } = normalizeUnknownError(error)
      toast.error("Không thể cập nhật hồ sơ", { description: message })
      console.error("Update patient error:", error)
    },
  })
}
