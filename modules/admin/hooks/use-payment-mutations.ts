import { useMutation, useQueryClient } from "@tanstack/react-query"
import { paymentService } from "@/core/api/paymentService"
import { queryKeys } from "@/shared/query/query-keys"
import { toast } from "sonner"

export function useConfirmPaymentMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => paymentService.confirmPayment(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.payments.all })
      toast.success("Xác nhận thanh toán thành công")
    },
    onError: () => toast.error("Không thể xác nhận thanh toán"),
  })
}

export function useCancelPaymentMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => paymentService.cancelPayment(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.payments.all })
      toast.success("Hủy hóa đơn thành công")
    },
    onError: () => toast.error("Không thể hủy hóa đơn"),
  })
}
