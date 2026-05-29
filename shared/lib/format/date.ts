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

/** Ngày + giờ hiển thị danh sách lịch hẹn (VN). */
export function formatDateTimeVi(isoLike: string): string {
  try {
    const date = new Date(isoLike)
    if (Number.isNaN(date.getTime())) return isoLike

    return new Intl.DateTimeFormat("vi-VN", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  } catch {
    return isoLike
  }
}

/** Giá trị cho input[type=datetime-local] theo giờ local. */
export function toDatetimeLocalValue(isoLike: string): string {
  try {
    const d = new Date(isoLike)
    if (Number.isNaN(d.getTime())) return ""
    const pad = (n: number) => String(n).padStart(2, "0")
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  } catch {
    return ""
  }
}

/** Parse từ datetime-local → ISO (UTC). */
export function fromDatetimeLocalValue(localValue: string): string {
  const d = new Date(localValue)
  return d.toISOString()
}
