import { useQuery } from "@tanstack/react-query"

import { appointmentService } from "@/core/api/appointmentService"
import { queryKeys } from "@/shared/query/query-keys"

export function useAppointmentsQuery() {
  return useQuery({
    queryKey: queryKeys.appointments.list(),
    queryFn: async () => {
      const res = await appointmentService.list()
      if (!res.success) throw new Error("Không thể tải lịch hẹn")
      return res.data
    },
  })
}
