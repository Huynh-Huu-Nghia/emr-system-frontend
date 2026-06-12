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
    PAYMENTS: "/reception/payments",
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
    DOCTORS: "/admin/doctors",
    MEDICINES: "/admin/medicines",
    PAYMENTS: "/admin/payments",
    SETTINGS: "/admin/settings",
  },
} as const

/** Default landing when role is unknown (should not happen). */
export const POST_LOGIN_ROUTE = ROUTES.LOGIN

export function getPostLoginPathForRole(role: User["role"]): string {
  switch (role) {
    case "RECEPTIONIST":
      return ROUTES.RECEPTION.DASHBOARD
    case "DOCTOR":
      return ROUTES.DOCTOR.DASHBOARD
    case "ADMIN":
      return ROUTES.ADMIN.DASHBOARD
    default:
      return POST_LOGIN_ROUTE
  }
}
