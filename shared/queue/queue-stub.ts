"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { queueService, type QueueItem, type PushToQueuePayload } from "@/core/api/queueService"

export type { QueueItem as QueuePatientStub, PushToQueuePayload }

export async function pushToQueue(payload: PushToQueuePayload): Promise<QueueItem> {
  return queueService.enqueue(payload)
}

export function useListenQueue(): QueueItem[] {
  const { data = [] } = useQuery({
    queryKey: ["queue"],
    queryFn: () => queueService.getQueue(),
    refetchInterval: 5000,
  })
  return data
}

export function useInvalidateQueue() {
  const qc = useQueryClient()
  return () => qc.invalidateQueries({ queryKey: ["queue"] })
}
