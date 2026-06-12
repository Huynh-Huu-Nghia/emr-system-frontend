/**
 * Central factories for TanStack Query keys — invalidation stays consistent across the app.
 */
export const queryKeys = {
  patients: {
    all: ["patients"] as const,
    list: () => [...queryKeys.patients.all, "list"] as const,
    detail: (id: number) => [...queryKeys.patients.all, "detail", id] as const,
  },
  appointments: {
    all: ["appointments"] as const,
    list: () => [...queryKeys.appointments.all, "list"] as const,
  },
  users: {
    all: ["users"] as const,
    list: () => [...queryKeys.users.all, "list"] as const,
  },
  doctors: {
    all: ["doctors"] as const,
    list: () => [...queryKeys.doctors.all, "list"] as const,
  },
  receptionists: {
    all: ["receptionists"] as const,
    list: () => [...queryKeys.receptionists.all, "list"] as const,
  },
  medicines: {
    all: ["medicines"] as const,
    list: () => [...queryKeys.medicines.all, "list"] as const,
    search: (search?: string, categoryId?: number | null) =>
      [...queryKeys.medicines.all, "search", search ?? "", categoryId ?? ""] as const,
  },
  medicineCategories: {
    all: ["medicine-categories"] as const,
  },
  payments: {
    all: ["payments"] as const,
    list: () => [...queryKeys.payments.all, "list"] as const,
  },
  dashboard: {
    all: ["dashboard"] as const,
    stats: () => [...queryKeys.dashboard.all, "stats"] as const,
    auditLog: () => [...queryKeys.dashboard.all, "audit-log"] as const,
  },
} as const
