/**
 * Central factories for TanStack Query keys — invalidation stays consistent across the app.
 */
export const queryKeys = {
  patients: {
    all: ["patients"] as const,
    list: () => [...queryKeys.patients.all, "list"] as const,
    detail: (id: number) => [...queryKeys.patients.all, "detail", id] as const,
  },
} as const
