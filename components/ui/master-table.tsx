"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"

interface MasterTableProps {
  children: React.ReactNode
  className?: string
  showHeader?: boolean
  hasPagination?: boolean
  currentPage?: number
  totalPages?: number
  onPageChange?: (page: number) => void
}

const MasterTable = React.forwardRef<HTMLTableElement, MasterTableProps>(
  (
    {
      children,
      className,
      showHeader = true,
      hasPagination = false,
      currentPage = 1,
      totalPages = 1,
      onPageChange,
    },
    ref
  ) => {
    return (
      <div className="w-full space-y-4 rounded-xl bg-white">
        {showHeader && (
          <div className="rounded-t-xl bg-medical-light px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-medical-dark">Dữ liệu</h3>
            </div>
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-slate-200">
          <Table ref={ref} className={cn(className)}>
            {children}
          </Table>
        </div>

        {hasPagination && (
          <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
            <p className="text-sm text-slate-600">
              Trang {currentPage} / {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(currentPage - 1)}
                disabled={currentPage === 1}
                className="rounded-lg border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="rounded-lg border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                Sau
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }
)

MasterTable.displayName = "MasterTable"

// Enhanced TableHeader with medical accent
const MasterTableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <TableHeader
    ref={ref}
    className={cn(
      "bg-medical-light [&_tr]:border-b-2 [&_tr]:border-medical-primary [&_th]:text-medical-dark [&_th]:font-semibold",
      className
    )}
    {...props}
  />
))

MasterTableHeader.displayName = "MasterTableHeader"

// Enhanced TableBody with hover effect
const MasterTableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <TableBody
    ref={ref}
    className={cn("[&_tr]:hover:bg-slate-50 [&_tr]:transition-colors", className)}
    {...props}
  />
))

MasterTableBody.displayName = "MasterTableBody"

export {
  MasterTable,
  MasterTableHeader,
  MasterTableBody,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
}
