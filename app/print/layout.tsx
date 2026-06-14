export default function PrintLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-white text-black print:m-0 print:p-0 print:bg-white">
      {children}
    </div>
  )
}
