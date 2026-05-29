/** Monday 00:00:00 local for the week containing `d`. */
export function startOfWeekMonday(d: Date): Date {
  const x = new Date(d)
  const day = x.getDay()
  const mondayOffset = day === 0 ? 6 : day - 1
  x.setDate(x.getDate() - mondayOffset)
  x.setHours(0, 0, 0, 0)
  return x
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

/** yyyy-MM-dd (local) — key for week cells & filters. */
export function ymdLocal(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function eachDayOfWeek(weekStartMonday: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStartMonday, i))
}

export function endOfWeekSunday(weekStartMonday: Date): Date {
  const end = addDays(weekStartMonday, 6)
  end.setHours(23, 59, 59, 999)
  return end
}

export function isIsoInRange(iso: string, from: Date, to: Date): boolean {
  const t = new Date(iso).getTime()
  return t >= from.getTime() && t <= to.getTime()
}
