"use client"

import { usePathname } from "next/navigation"

import { Header } from "@/components/layout/Header"
import { Sidebar } from "@/components/layout/Sidebar"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { allowedRolesForPath } from "@/shared/lib/rbac/allowed-roles-for-path"

export function DashboardAuthShell({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname() ?? ""
  const allowedRoles = allowedRolesForPath(pathname)

  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <div className="flex h-screen w-full bg-slate-50">
        <div className="z-20 h-full w-64 flex-shrink-0">
          <Sidebar />
        </div>

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-8">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
