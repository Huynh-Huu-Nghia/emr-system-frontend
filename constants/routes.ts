/**
 * Central route map — align hrefs with real files under `app/(dashboard)/`.
 */

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

/** Default route after successful login (mock auth — adjust per role later). */
export const POST_LOGIN_ROUTE = ROUTES.RECEPTION.PATIENTS
