type PlaceholderPageProps = {
  title: string
  description?: string
}

/** Minimal stub for routes not implemented yet — keeps navigation usable while testing. */
export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="max-w-2xl space-y-3">
      <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
      {description ? (
        <p className="text-slate-600">{description}</p>
      ) : (
        <p className="text-slate-500">
          Trang đang được phát triển. Quay lại sau hoặc dùng menu khác để kiểm thử.
        </p>
      )}
    </div>
  )
}
