import { useQuery } from "@tanstack/react-query"
import { medicineService } from "@/core/api/medicineService"
import { queryKeys } from "@/shared/query/query-keys"

export function useMedicinesQuery() {
  return useQuery({
    queryKey: queryKeys.medicines.list(),
    queryFn: () => medicineService.getAll(),
  })
}
