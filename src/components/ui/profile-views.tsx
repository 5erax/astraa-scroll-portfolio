"use client"

import { useEffect, useRef, useState } from "react"

export default function ProfileViews({ opened }: { opened: boolean }) {
  const [count, setCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const visit = useRef("")

  useEffect(() => {
    if (opened) visit.current ||= crypto.randomUUID()
    let current = true
    fetch("/api/profile-views", {
      method: opened ? "POST" : "GET",
      headers: opened ? { "Idempotency-Key": visit.current } : undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(6000),
    }).then(async response => {
      if (!response.ok) throw new Error("Counter unavailable")
      const data = await response.json()
      if (!Number.isSafeInteger(data.count) || data.count < 319) throw new Error("Invalid counter response")
      if (current) setCount(data.count)
    }).catch(() => { if (current) setCount(null) })
      .finally(() => { if (current) setLoading(false) })
    return () => { current = false }
  }, [opened])

  const label = count !== null ? `${count.toLocaleString("en-US")} profile views` : loading ? "Profile views loading" : "Profile views temporarily unavailable"
  return (
    <span className="tpp-profile-views" role="img" aria-label={label} title={label}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" />
      </svg>
      <span aria-hidden="true" style={{ minWidth: "3ch" }}>{count === null ? loading ? "\u00a0" : "—" : count.toLocaleString("en-US")}</span>
    </span>
  )
}
