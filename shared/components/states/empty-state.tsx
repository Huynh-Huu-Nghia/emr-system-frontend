import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type EmptyStateProps = {
  className?: string
  icon?: LucideIcon
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({
  className,
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[8rem] flex-col items-center justify-center gap-2 px-6 py-10 text-center",
        className
      )}
    >
      {Icon ? (
        <Icon className="h-10 w-10 text-slate-300" aria-hidden />
      ) : null}
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      {description ? (
        <p className="max-w-md text-sm text-slate-500">{description}</p>
      ) : null}
      {action}
    </div>
  )
}
