"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4 text-medical-primary" />
        ),
        info: (
          <InfoIcon className="size-4 text-medical-primary" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4 text-amber-600" />
        ),
        error: (
          <OctagonXIcon className="size-4 text-red-600" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin text-medical-primary" />
        ),
      }}
      style={
        {
          "--normal-bg": "#ffffff",
          "--normal-text": "#0f172a",
          "--normal-border": "#e2e8f0",
          "--normal-accent": "#14b8a6",
          "--success-bg": "#f0fdfa",
          "--success-text": "#0d4f46",
          "--success-border": "#99f6e4",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast rounded-xl",
          success: "bg-medical-light border-medical-primary",
          error: "bg-red-50 border-red-200",
          warning: "bg-amber-50 border-amber-200",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
