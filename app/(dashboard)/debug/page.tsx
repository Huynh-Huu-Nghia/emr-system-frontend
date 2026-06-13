"use client"
import { useEffect, useState } from "react"
import { paymentService } from "@/core/api/paymentService"

export default function DebugPage() {
  const [data, setData] = useState<any>()
  
  useEffect(() => {
    paymentService.getAll().then(setData).catch(console.error)
  }, [])

  return <pre>{JSON.stringify(data, null, 2)}</pre>
}
