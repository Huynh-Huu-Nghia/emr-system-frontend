import { useQuery } from "@tanstack/react-query"
import { medicineCategoryService } from "@/core/api/medicineCategoryService"
import { queryKeys } from "@/shared/query/query-keys"

export function useMedicineCategoriesQuery() {
  return useQuery({
    queryKey: ["medicine-categories"],
    queryFn: () => medicineCategoryService.getAll(),
  })
}
