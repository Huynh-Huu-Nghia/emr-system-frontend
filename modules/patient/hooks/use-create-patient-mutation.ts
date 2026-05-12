import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import type { PatientCreateRequest } from "@/core/api/patientService"
import { patientService } from "@/core/api/patientService"
import { normalizeUnknownError } from "@/shared/lib/error/normalize-api-error"
import { queryKeys } from "@/shared/query/query-keys"

export function useCreatePatientMutation() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (data: PatientCreateRequest) => patientService.createPatient(data),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.patients.all })
      toast.success("Tiếp nhận bệnh nhân thành công")
    },
    onError: (error) => {
      const { message } = normalizeUnknownError(error)
      toast.error("Không thể tạo hồ sơ", { description: message })
      console.error("Create patient error:", error)
    },
  })
}
