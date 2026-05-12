"use client"

import { ThemeProvider } from "next-themes"

import { AuthProvider } from "@/context/AuthContext"
import { Toaster } from "@/components/ui/sonner"
import { QueryProvider } from "@/shared/query/query-provider"

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AuthProvider>
        <QueryProvider>
          {children}
          <Toaster />
        </QueryProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
