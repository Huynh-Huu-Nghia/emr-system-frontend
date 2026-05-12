/**
 * Central route map — align hrefs with real files under `app/(dashboard)/`.
 */

import type { User } from "@/core/api/authService"

export const ROUTES = {
  LOGIN: "/login",

  /** Root dashboard (role-agnostic landing inside shell). */
  HOME: "/",

  /** Placeholder settings (global). */
  SETTINGS: "/settings",

  RECEPTION: {
    DASHBOARD: "/reception",
    PATIENTS: "/reception/patients",
    CHECKIN: "/reception/checkin",
    APPOINTMENTS: "/reception/appointments",
  },

  DOCTOR: {
    DASHBOARD: "/doctor",
    PATIENTS: "/doctor/patients",
    EXAMINATION: "/doctor/examination",
    RECORDS: "/doctor/records",
  },

  ADMIN: {
    DASHBOARD: "/admin",
    STAFF: "/admin/staff",
    SETTINGS: "/admin/settings",
  },
} as const

/** Default landing when role is unknown (should not happen). */
export const POST_LOGIN_ROUTE = ROUTES.RECEPTION.PATIENTS

export function getPostLoginPathForRole(role: User["role"]): string {
  switch (role) {
    case "RECEPTIONIST":
      return ROUTES.RECEPTION.PATIENTS
    case "DOCTOR":
      return ROUTES.DOCTOR.DASHBOARD
    case "ADMIN":
      return ROUTES.ADMIN.DASHBOARD
    default:
      return POST_LOGIN_ROUTE
  }
}
