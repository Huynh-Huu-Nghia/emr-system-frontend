"use client"

import { ReactNode } from "react"

interface PageHeaderProps {
  title: string
  description?: string
  children?: ReactNode
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex items-end justify-between border-b-2 border-slate-100 pb-6 mb-6">
      <div className="space-y-1">
        {/* text-medical-dark lấy từ CSS của bạn */}
        <h1 className="text-3xl font-bold tracking-tight text-medical-dark">
          {title}
        </h1>
        {description && <p className="text-slate-500 font-medium">{description}</p>}
      </div>
      <div className="flex items-center gap-3">{children}</div>
    </div>
  )
}