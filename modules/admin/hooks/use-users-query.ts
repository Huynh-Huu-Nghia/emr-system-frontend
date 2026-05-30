import { useQuery } from "@tanstack/react-query"
import { userService } from "@/core/api/userService"
import { queryKeys } from "@/shared/query/query-keys"

export function useUsersQuery() {
  return useQuery({
    queryKey: queryKeys.users.list(),
    queryFn: () => userService.getAll(),
  })
}
