import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EMR System - Quản lý Phòng khám",
  description: "Hệ thống Bệnh án điện tử và Quản lý phòng khám nội bộ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${geist.className} bg-slate-50 text-slate-900 antialiased`}>
        {/* Render mọi trang ở đây, không có Sidebar/Header */}
        {children}
      </body>
    </html>
  );
}