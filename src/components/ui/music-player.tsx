"use client"

import { memo, useCallback, useEffect, useId, useImperativeHandle, useRef, useState, type Ref } from "react"

const clock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`

function MusicPlayer({ ref }: { ref?: Ref<{ start: () => void }> }) {
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

  const start = useCallback(async () => {
    const audio = audioRef.current
    if (!audio) return
    const request = ++attempt.current
    setError("")
    setLoading(true)
    if (audio.error) audio.load()
    try { await audio.play() }
    catch (reason) {
      if (request !== attempt.current) return
      if (!(reason instanceof DOMException && reason.name === "AbortError"))
        setError("Couldn’t play the track. Press Play to try again.")
    } finally { if (request === attempt.current) setLoading(false) }
  }, [])

  useImperativeHandle(ref, () => ({ start: () => {
    if (audioRef.current) audioRef.current.volume = .35
    void start()
  } }), [start])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = .35
    setVolume(audio.volume)
    setAdjustable(audio.volume === .35)
    return () => { ++attempt.current; audio.pause() }
  }, [])

  const toggle = () => {
    const audio = audioRef.current
    if (!audio) return
    if (!audio.paused || loading) { ++attempt.current; audio.pause(); setLoading(false); return }
    void start()
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
          <div><h2 lang="vi">Buồn vương mi</h2><p className="music-artist">htingale</p></div>
          <button type="button" popoverTarget={id} popoverTargetAction="hide" aria-label="Close music player">×</button>
        </header>
        <div className="music-play-row">
          <button type="button" autoFocus className="music-play" aria-label={playing || loading ? "Pause background music" : "Play background music"} onClick={toggle}>
            <span aria-hidden="true">{playing || loading ? "Ⅱ" : "▶"}</span>
          </button>
          <div className="music-progress"><input className="music-seek" type="range" aria-label="Track position" aria-valuetext={`${clock(current)} of ${clock(duration)}`}
          min="0" max={duration || 1} step=".1" value={current} disabled={!duration}
          onChange={event => { if (audioRef.current) { audioRef.current.currentTime = +event.target.value; setCurrent(+event.target.value) } }} />
            <span className="music-time" aria-hidden="true">{clock(current)} / {duration ? clock(duration) : "—:—"}</span>
          </div>
        </div>
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
        <p className="music-status" data-error={!!error} role="status">{error || (loading ? "Loading the track…" : playing ? "Playing · on repeat." : "Paused.")}</p>
      </div>
    </div>
  )
}

export default memo(MusicPlayer)
