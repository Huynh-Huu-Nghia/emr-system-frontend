import { useQuery } from "@tanstack/react-query"
import { receptionistService } from "@/core/api/receptionistService"
import { queryKeys } from "@/shared/query/query-keys"

export function useReceptionistsQuery() {
  return useQuery({
    queryKey: queryKeys.receptionists.list(),
    queryFn: () => receptionistService.getAll(),
  })
}
