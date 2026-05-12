"use client"

import Link from "next/link"
import { Settings, LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ROUTES } from "@/constants/routes"
import { useAuth } from "@/context/AuthContext"

export function SidebarFooter() {
  const { logout } = useAuth()

  return (
    <div className="px-4 pb-6 border-t border-slate-200 pt-4 space-y-1">
      <Link
        href={ROUTES.SETTINGS}
        className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-slate-500 transition hover:bg-slate-50"
      >
        <Settings className="h-5 w-5" />
        Settings
      </Link>
      <Button
        type="button"
        variant="ghost"
        className="h-auto w-full justify-start rounded-2xl px-4 py-3 text-sm font-normal text-slate-500 hover:bg-slate-50"
        onClick={() => void logout()}
      >
        <LogOut className="h-5 w-5" />
        Log Out
      </Button>
    </div>
  )
}
