"use client"

import { useEffect, useRef, useState } from "react"

export default function EntryBackground() {
  const media = useRef<HTMLVideoElement>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const video = media.current
    if (!video) return
    // A failed initial request can precede React attaching the error handler.
    if (video.error) { setFailed(true); return }
    const sync = () => {
      if (document.hidden) video.pause()
      // A browser may defer autoplay; the next trusted gesture retries it.
      else void video.play().catch(() => {})
    }
    sync()
    document.addEventListener("visibilitychange", sync)
    document.addEventListener("pointerdown", sync)
    return () => {
      document.removeEventListener("visibilitychange", sync)
      document.removeEventListener("pointerdown", sync)
    }
  }, [failed])

  return <>
    <div className="tpp-entry-media" aria-hidden="true">
      <img src="/media/heart-lake-poster.webp" alt="" />
      {!failed && <video ref={media} src="/media/heart-lake.mp4" poster="/media/heart-lake-poster.webp" muted loop playsInline preload="auto" onError={() => setFailed(true)} />}
    </div>
  </>
}
