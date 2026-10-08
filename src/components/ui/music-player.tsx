"use client"

import { memo, useEffect, useId, useRef, useState } from "react"

const clock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`

function MusicPlayer() {
  const id = useId()
  const audioRef = useRef<HTMLAudioElement>(null)
  const attempt = useRef(0)
  const lastVolume = useRef(.35)
  const [playing, setPlaying] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(.35)
  const [muted, setMuted] = useState(false)
  const [adjustable, setAdjustable] = useState(true)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = .35
    setVolume(audio.volume)
    setAdjustable(audio.volume === .35)
    return () => { ++attempt.current; audio.pause() }
  }, [])

  const toggle = async () => {
    const audio = audioRef.current
    if (!audio) return
    const request = ++attempt.current
    if (!audio.paused || loading) { audio.pause(); setLoading(false); return }
    setError("")
    setLoading(true)
    if (adjustable) audio.volume = volume
    // A failed load needs a fresh media request when the visitor retries.
    if (audio.error) audio.load()
    try { await audio.play() }
    catch (reason) {
      if (request === attempt.current && !(reason instanceof DOMException && reason.name === "AbortError"))
        setError("Couldn’t play the track. Press Play to try again.")
    } finally { if (request === attempt.current) setLoading(false) }
  }

  const silent = muted || volume === 0
  const mute = () => {
    const audio = audioRef.current
    if (!audio) return
    if (silent) {
      audio.muted = false
      if (audio.volume === 0) audio.volume = lastVolume.current
    } else audio.muted = true
  }

  return (
    <div className="music-stamp" data-playing={playing && !loading && !silent}>
      <audio ref={audioRef} src="/media/buon-vuong-mi.mp3" preload="none" loop
        onPlaying={() => { setPlaying(true); setLoading(false) }}
        onPause={() => { setPlaying(false); setLoading(false) }}
        onWaiting={() => setLoading(true)}
        onCanPlay={() => setLoading(false)}
        onDurationChange={event => setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0)}
        onTimeUpdate={event => setCurrent(event.currentTarget.currentTime)}
        onVolumeChange={event => { setVolume(event.currentTarget.volume); setMuted(event.currentTarget.muted) }}
        onError={() => { setPlaying(false); setLoading(false); setError("The track is unavailable. Press Play to try again.") }} />
      <button type="button" className="music-trigger" popoverTarget={id} aria-label={playing ? "Music player — playing" : "Music player"}>
        <span className="music-record" aria-hidden="true" /><span className="music-trigger-label">Music</span>
      </button>
      <div id={id} popover="auto" className="music-card" role="region" aria-label="Music player controls">
        <header className="music-card-header">
          <span className="tpp-label">A listening note</span>
          <button type="button" popoverTarget={id} popoverTargetAction="hide" aria-label="Close music player">×</button>
        </header>
        <h2 lang="vi">Buồn vương mi</h2>
        <p className="music-artist">htingale</p>
        <div className="music-play-row">
          <button type="button" autoFocus className="music-play" aria-label={playing || loading ? "Pause background music" : "Play background music"} onClick={toggle}>
            <span aria-hidden="true">{playing || loading ? "Ⅱ" : "▶"}</span>{playing || loading ? "Pause" : "Play"}
          </button>
          <span className="music-time" aria-hidden="true">{clock(current)} / {duration ? clock(duration) : "—:—"}</span>
        </div>
        <input className="music-seek" type="range" aria-label="Track position" aria-valuetext={`${clock(current)} of ${clock(duration)}`}
          min="0" max={duration || 1} step=".1" value={current} disabled={!duration}
          onChange={event => { if (audioRef.current) { audioRef.current.currentTime = +event.target.value; setCurrent(+event.target.value) } }} />
        <div className="music-volume-row">
          <button type="button" onClick={mute} aria-label={silent ? "Unmute music" : "Mute music"}>{silent ? "Unmute" : "Mute"}</button>
          {adjustable ? <><input type="range" aria-label="Music volume" aria-valuetext={`${Math.round(volume * 100)} percent${muted ? ", muted" : ""}`}
            min="0" max="1" step=".01" value={volume} onChange={event => {
              const audio = audioRef.current
              if (!audio) return
              const next = +event.target.value
              if (next > 0) lastVolume.current = next
              audio.volume = next
              audio.muted = false
            }} />
          <span aria-hidden="true">{silent ? "0" : Math.round(volume * 100)}%</span></> : <span className="music-device-volume">Use your device volume</span>}
        </div>
        <p className="music-status" role="status">{error || (loading ? "Loading the track…" : playing ? "Playing · on repeat." : duration ? "Paused · pick up where you left off." : "Press Play for a little music.")}</p>
      </div>
    </div>
  )
}

export default memo(MusicPlayer)
