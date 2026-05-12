import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ErrorStateProps = {
  className?: string
  title?: string
  description?: string
  onRetry?: () => void
  retryLabel?: string
  children?: ReactNode
}

export function ErrorState({
  className,
  title = "Không thể tải dữ liệu",
  description,
  onRetry,
  retryLabel = "Thử lại",
  children,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[8rem] flex-col items-center justify-center gap-3 px-6 py-10 text-center",
        className
      )}
      role="alert"
    >
      <p className="text-sm font-semibold text-destructive">{title}</p>
      {description ? (
        <p className="max-w-md text-sm text-slate-500">{description}</p>
      ) : null}
      {children}
      {onRetry ? (
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          {retryLabel}
        </Button>
      ) : null}
    </div>
  )
}
