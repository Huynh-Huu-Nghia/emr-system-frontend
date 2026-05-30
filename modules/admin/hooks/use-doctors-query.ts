import { useQuery } from "@tanstack/react-query"
import { doctorService } from "@/core/api/doctorService"
import { queryKeys } from "@/shared/query/query-keys"

export function useDoctorsQuery() {
  return useQuery({
    queryKey: queryKeys.doctors.list(),
    queryFn: () => doctorService.getAll(),
  })
}
