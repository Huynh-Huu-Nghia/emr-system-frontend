import { useQuery } from "@tanstack/react-query"

import { patientService } from "@/core/api/patientService"
import { queryKeys } from "@/shared/query/query-keys"
export function usePatientsQuery() {
  return useQuery({
    queryKey: queryKeys.patients.list(),
    queryFn: async () => {
      const res = await patientService.getAllPatients()
      if (!res.success) {
        throw new Error("Không thể tải danh sách bệnh nhân")
      }
      return res.data
    },
    meta: {
      /** Human label for logging / DevTools overlays if needed later. */
      feature: "patients:list",
    },
  })
}
