"use client"

import { useState } from "react"
import { Bell, Check, CheckCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { notificationService, type Notification } from "@/core/api/notificationService"
import { useAuth } from "@/context/AuthContext"

export function NotificationBell() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)

  const userId = user?.id ? Number(user.id) : 0

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications", userId],
    queryFn: () => notificationService.getByUser(userId),
    enabled: userId > 0,
    refetchInterval: 30000,
  })

  const markReadMutation = useMutation({
    mutationFn: (id: number) => notificationService.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications", userId] }),
  })

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationService.markAllRead(userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications", userId] }),
  })

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="relative"
        onClick={() => setOpen(!open)}
      >
        <Bell className="h-5 w-5 text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h4 className="text-sm font-semibold text-slate-700">Thông báo</h4>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllReadMutation.mutate()}
                className="text-xs text-medical-primary hover:underline"
              >
                <CheckCheck className="mr-1 inline h-3 w-3" />
                Đọc tất cả
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-slate-400">Không có thông báo</p>
            ) : (
              notifications.slice(0, 20).map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 border-b border-slate-50 px-4 py-3 last:border-0 ${
                    n.isRead ? "opacity-60" : "bg-blue-50/50"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-700">{n.title}</p>
                    {n.message && <p className="mt-0.5 text-xs text-slate-500">{n.message}</p>}
                    <p className="mt-1 text-[10px] text-slate-400">
                      {new Date(n.createdAt).toLocaleString("vi-VN")}
                    </p>
                  </div>
                  {!n.isRead && (
                    <button
                      onClick={() => markReadMutation.mutate(n.id)}
                      className="mt-1 flex-shrink-0 text-slate-400 hover:text-medical-primary"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
