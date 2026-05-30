import { useQuery } from "@tanstack/react-query"
import { paymentService } from "@/core/api/paymentService"
import { queryKeys } from "@/shared/query/query-keys"

export function usePaymentsQuery() {
  return useQuery({
    queryKey: queryKeys.payments.list(),
    queryFn: () => paymentService.getAll(),
  })
}
