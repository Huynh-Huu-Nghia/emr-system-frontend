"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface MasterModalProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
  className?: string
}

const MasterModal = React.forwardRef<HTMLDivElement, MasterModalProps>(
  ({ open, onOpenChange, children, className }, ref) => {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <div ref={ref} className={className}>
          {children}
        </div>
      </Dialog>
    )
  }
)

MasterModal.displayName = "MasterModal"

interface MasterModalContentProps
  extends React.ComponentProps<typeof DialogContent> {
  showCloseButton?: boolean
}

const MasterModalContent = React.forwardRef<
  HTMLDivElement,
  MasterModalContentProps
>(({ className, showCloseButton = true, ...props }, ref) => (
  <DialogContent
    ref={ref}
    className={cn(
      "rounded-2xl border-medical-light shadow-[0_20px_60px_rgba(13,148,136,0.08)]",
      className
    )}
    showCloseButton={showCloseButton}
    {...props}
  />
))

MasterModalContent.displayName = "MasterModalContent"

interface MasterModalHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title: React.ReactNode; 
}

const MasterModalHeader = React.forwardRef<
  HTMLDivElement,
  MasterModalHeaderProps
>(({ className, title, ...props }, ref) => (
  <DialogHeader
    ref={ref}
    className={cn("border-b border-slate-100 pb-4", className)}
    {...props}
  >
    {title && (
      <DialogTitle className="text-xl font-semibold text-medical-dark">
        {title}
      </DialogTitle>
    )}
  </DialogHeader>
))

MasterModalHeader.displayName = "MasterModalHeader"

const MasterModalFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <DialogFooter
    ref={ref}
    className={cn(
      "border-t border-slate-100 bg-white pt-4",
      className
    )}
    {...props}
  />
))

MasterModalFooter.displayName = "MasterModalFooter"

interface MasterModalActionProps 
  extends Omit<React.ComponentProps<typeof Button>, 'variant'> {
    variant?: "primary" | "secondary" | "danger";
}

const MasterModalAction = React.forwardRef<
  HTMLButtonElement,
  MasterModalActionProps
>(({ variant = "primary", className, ...props }, ref) => {
  const variantClasses = {
    primary: "bg-medical-primary text-white hover:bg-medical-dark",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
    danger: "bg-red-600 text-white hover:bg-red-700",
  }

  return (
    <Button
      ref={ref}
      className={cn(variantClasses[variant], className)}
      {...props}
    />
  )
})

MasterModalAction.displayName = "MasterModalAction"

export {
  MasterModal,
  MasterModalContent,
  MasterModalHeader,
  MasterModalFooter,
  MasterModalAction,
  DialogTrigger,
  DialogClose,
  DialogPortal,
  DialogOverlay,
}
