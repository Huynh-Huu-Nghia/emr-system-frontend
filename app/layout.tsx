import type { Metadata } from "next"

import "./globals.css"

import { AppProviders } from "@/components/providers/app-providers"

export const metadata: Metadata = {
  title: "EMR System - Quản lý Phòng khám",
  description: "Hệ thống Bệnh án điện tử và Quản lý phòng khám nội bộ",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="font-sans bg-slate-50 text-slate-900 antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
