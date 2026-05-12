// ✅ Toàn bộ đường dẫn tập trung một chỗ
// Không bao giờ hardcode "/reception/dashboard" thẳng vào component

export const ROUTES = {
  LOGIN:    "/login",
  SETTINGS: "/settings",
  LOGOUT:   "/logout",

  RECEPTION: {
    DASHBOARD:    "/reception/dashboard",
    CHECKIN:      "/reception/checkin",
    APPOINTMENTS: "/reception/appointments",
  },

  DOCTOR: {
    DASHBOARD:   "/doctor/dashboard",
    PATIENTS:    "/doctor/patients",
    EXAMINATION: "/doctor/examination",
    RECORDS:     "/doctor/records",
  },

  ADMIN: {
    DASHBOARD: "/admin/dashboard",
    STAFF:     "/admin/staff",
    SETTINGS:  "/admin/settings",
  },
} as const
