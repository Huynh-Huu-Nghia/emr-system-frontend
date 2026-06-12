"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { queueService, type QueueItem, type PushToQueuePayload } from "@/core/api/queueService"

export type { QueueItem as QueuePatientStub, PushToQueuePayload }

const queueKey = ["queue"] as const

export async function pushToQueue(payload: PushToQueuePayload): Promise<QueueItem> {
  return queueService.enqueue(payload)
}

export function useListenQueue(doctorId?: number | null): QueueItem[] {
  const { data = [] } = useQuery({
    queryKey: doctorId ? [...queueKey, "doctor", doctorId] : queueKey,
    queryFn: () => queueService.getQueue(doctorId),
    refetchInterval: 5000,
  })
  return data
}

export function useInvalidateQueue() {
  const qc = useQueryClient()
  return () => qc.invalidateQueries({ queryKey: queueKey })
}

export function useCallQueueMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (queueId: number) => queueService.call(queueId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queueKey })
      toast.success("Đã gọi bệnh nhân vào phòng khám")
    },
    onError: () => toast.error("Không thể gọi bệnh nhân"),
  })
}

export function useStartQueueMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (queueId: number) => queueService.start(queueId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queueKey })
    },
    onError: () => toast.error("Không thể bắt đầu lượt khám"),
  })
}

export function useCompleteQueueMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (queueId: number) => queueService.remove(queueId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queueKey })
      toast.success("Đã hoàn tất lượt khám")
    },
    onError: () => toast.error("Không thể hoàn tất lượt khám"),
  })
}
