import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import type { AppointmentCreateRequest } from "@/core/api/appointmentService"
import { appointmentService } from "@/core/api/appointmentService"
import { normalizeUnknownError } from "@/shared/lib/error/normalize-api-error"
import { queryKeys } from "@/shared/query/query-keys"

export function useCreateAppointmentMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: AppointmentCreateRequest) =>
      appointmentService.create(body),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.appointments.all })
      toast.success("Đã tạo lịch hẹn")
    },
    onError: (e) => {
      toast.error("Không thể tạo lịch", {
        description: normalizeUnknownError(e).message,
      })
    },
  })
}

export function useRescheduleAppointmentMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vars: {
      id: number
      starts_at: string
      reason?: string | null
    }) => appointmentService.reschedule(vars.id, vars.starts_at, vars.reason),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.appointments.all })
      toast.success("Đã cập nhật lịch hẹn")
    },
    onError: (e) => {
      toast.error("Không thể đổi lịch", {
        description: normalizeUnknownError(e).message,
      })
    },
  })
}

export function useCancelAppointmentMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => appointmentService.cancel(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.appointments.all })
      toast.success("Đã huỷ lịch hẹn")
    },
    onError: (e) => {
      toast.error("Không thể huỷ lịch", {
        description: normalizeUnknownError(e).message,
      })
    },
  })
}
