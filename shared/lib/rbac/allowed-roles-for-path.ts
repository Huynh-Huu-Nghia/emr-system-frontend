import type { User } from "@/core/api/authService"

export type AppRole = User["role"]

/**
 * Route → allowed roles. ADMIN may access reception/doctor for oversight & dev mock.
 * Adjust when RBAC becomes stricter (e.g. remove ADMIN from clinical routes).
 */
export function allowedRolesForPath(pathname: string): AppRole[] {
  const path = pathname || "/"

  if (path.startsWith("/admin")) {
    return ["ADMIN"]
  }
  if (path.startsWith("/doctor")) {
    return ["DOCTOR", "ADMIN"]
  }
  if (path.startsWith("/reception")) {
    return ["RECEPTIONIST", "ADMIN"]
  }

  return ["ADMIN", "DOCTOR", "RECEPTIONIST"]
}
