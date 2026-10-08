"use client"

import { useEffect, useRef, useState } from "react"

export default function EntryBackground() {
  const media = useRef<HTMLVideoElement>(null)
  const [allowed, setAllowed] = useState(false)
  const [paused, setPaused] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const motion = matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setAllowed(!motion.matches)
    update()
    motion.addEventListener("change", update)
    return () => motion.removeEventListener("change", update)
  }, [])

  useEffect(() => {
    const video = media.current
    if (!video) return
    const sync = () => {
      if (paused || document.hidden) video.pause()
      else void video.play().catch(error => { if (error.name !== "AbortError") setPaused(true) })
    }
    sync()
    document.addEventListener("visibilitychange", sync)
    return () => document.removeEventListener("visibilitychange", sync)
  }, [allowed, paused, failed])

  return <>
    <div className="tpp-entry-media" aria-hidden="true">
      <img src="/media/heart-lake-poster.webp" alt="" />
      {allowed && !failed && <video ref={media} src="/media/heart-lake.mp4" poster="/media/heart-lake-poster.webp" muted loop playsInline preload="auto" onError={() => setFailed(true)} />}
    </div>
    {allowed && !failed && <button type="button" className="tpp-entry-video-control" aria-label={paused ? "Play background video" : "Pause background video"}
      onClick={() => {
        if (paused) void media.current?.play().catch(() => setPaused(true))
        else media.current?.pause()
        setPaused(!paused)
      }}><span aria-hidden="true">{paused ? "▷" : "Ⅱ"}</span><span>{paused ? "Play background" : "Pause background"}</span></button>}
  </>
}
