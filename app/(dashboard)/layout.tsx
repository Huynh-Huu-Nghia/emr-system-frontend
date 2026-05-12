import { DashboardAuthShell } from "@/components/layout/dashboard-auth-shell"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardAuthShell>{children}</DashboardAuthShell>
}
