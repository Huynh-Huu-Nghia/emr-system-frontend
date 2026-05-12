import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"
// ✅ Bọc toàn app trong AuthProvider để mọi trang đều dùng được useAuth()
import { AuthProvider } from "@/context/AuthContext"
import { QueryProvider } from "@/shared/query/query-provider"

const geist = Geist({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "EMR System - Quản lý Phòng khám",
  description: "Hệ thống Bệnh án điện tử và Quản lý phòng khám nội bộ",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body className={`${geist.className} bg-slate-50 text-slate-900 antialiased`}>
        <AuthProvider>
          <QueryProvider>
            {children}
            {/* Toaster đặt ở root để toast hiện được mọi trang */}
            <Toaster />
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
