import { GENDER_LABELS } from "@/lib/constants"
import { cn } from "@/lib/utils"
import type { Patient } from "@/modules/patient/types"

const genderClass: Record<Patient["gender"], string> = {
  MALE: "bg-blue-50 text-blue-600",
  FEMALE: "bg-pink-50 text-pink-600",
  OTHER: "bg-slate-100 text-slate-700",
}

type GenderBadgeProps = {
  gender: Patient["gender"]
  className?: string
}

export function GenderBadge({ gender, className }: GenderBadgeProps) {
  return (
    <span
      className={cn(
        "rounded-full px-3 py-1 text-[10px] font-bold uppercase",
        genderClass[gender],
        className
      )}
    >
      {GENDER_LABELS[gender]}
    </span>
  )
}
