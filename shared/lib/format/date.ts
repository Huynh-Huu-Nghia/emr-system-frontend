/** Short date presentation for dashboards (VN locale). */
export function formatDateVi(isoLike: string): string {
  try {
    const date = new Date(isoLike)
    if (Number.isNaN(date.getTime())) return isoLike

    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date)
  } catch {
    return isoLike
  }
}
