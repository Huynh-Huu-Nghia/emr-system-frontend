import { Loader2 } from "lucide-react"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type LoadingBlockProps = {
  className?: string
  message?: string
  children?: ReactNode
}

/** Centered spinner for table shells and page sections. */
export function LoadingBlock({
  className,
  message = "Đang tải…",
  children,
}: LoadingBlockProps) {
  return (
    <div
      className={cn(
        "flex min-h-[8rem] flex-col items-center justify-center gap-2 text-slate-400",
        className
      )}
    >
      <Loader2 className="h-6 w-6 animate-spin text-medical-primary" aria-hidden />
      <p className="text-sm">{message}</p>
      {children}
    </div>
  )
}
