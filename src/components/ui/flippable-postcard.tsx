"use client"

import { useRef, useState, type ReactNode } from "react"

export default function FlippablePostcard({ front, back }: { front: ReactNode; back: ReactNode }) {
  const paper = useRef<HTMLDivElement>(null)
  const angle = useRef(0)
  const gesture = useRef({ id: -1, x: 0, y: 0, width: 1, start: 0, dragged: false, vertical: false })
  const [flipped, setFlipped] = useState(false)

  const settle = (back: boolean, direction = 1, instant = false) => {
    const element = paper.current
    if (!element) return
    const wasBack = Math.abs(Math.round(angle.current / 180)) % 2 === 1
    if (wasBack !== back) angle.current += direction * 180
    element.style.transition = instant || matchMedia("(prefers-reduced-motion: reduce)").matches ? "none" : ""
    element.style.transform = `rotateY(${angle.current}deg)`
    setFlipped(back)
    requestAnimationFrame(() => element.querySelector<HTMLButtonElement>(`[data-side=${back ? "back" : "front"}] [data-flip-control]`)?.focus({ preventScroll: true }))
  }
  const cancel = () => {
    if (gesture.current.id === -1) return
    gesture.current.id = -1
    gesture.current.dragged = false
    paper.current?.removeAttribute("data-dragging")
    if (paper.current) {
      paper.current.style.transition = ""
      paper.current.style.transform = `rotateY(${angle.current}deg)`
    }
  }

  return <div className="tpp-card3d tpp-postcard" style={{ transform: "rotate(-1.2deg)" }}>
    <div ref={paper} className="tpp-flip" data-back={flipped ? "" : undefined}
      onClickCapture={event => {
        if (gesture.current.dragged) { event.preventDefault(); event.stopPropagation(); gesture.current.dragged = false }
      }}
      onClick={event => {
        if ((event.target as HTMLElement).closest(".tpp-postcard-hit,[data-flip-control]")) settle(!flipped, 1, event.detail === 0)
      }}
      onPointerDown={event => {
        if (!event.isPrimary || event.button !== 0 || !(event.target as HTMLElement).closest(".tpp-postcard-hit")) return
        const matrix = new DOMMatrixReadOnly(getComputedStyle(event.currentTarget).transform)
        const wrapped = Math.atan2(-matrix.m13, matrix.m11) * 180 / Math.PI
        gesture.current = { id: event.pointerId, x: event.clientX, y: event.clientY, width: event.currentTarget.offsetWidth,
          start: wrapped + 360 * Math.round((angle.current - wrapped) / 360), dragged: false, vertical: false }
      }}
      onPointerMove={event => {
        const current = gesture.current
        if (current.id !== event.pointerId || current.vertical) return
        const dx = event.clientX - current.x, dy = event.clientY - current.y
        if (!current.dragged) {
          if (Math.abs(dy) > 8 && Math.abs(dy) >= Math.abs(dx)) { current.vertical = true; return }
          if (Math.abs(dx) < 8 || Math.abs(dx) <= Math.abs(dy)) return
          current.dragged = true
          event.currentTarget.setPointerCapture(event.pointerId)
          event.currentTarget.setAttribute("data-dragging", "")
        }
        if (matchMedia("(prefers-reduced-motion: reduce)").matches) return
        event.currentTarget.style.transition = "none"
        const delta = Math.max(-180, Math.min(180, dx / current.width * 180))
        event.currentTarget.style.transform = `rotateY(${current.start + delta}deg)`
      }}
      onPointerUp={event => {
        const current = gesture.current
        if (current.id !== event.pointerId) return
        current.id = -1
        event.currentTarget.removeAttribute("data-dragging")
        if (current.dragged) {
          const dx = event.clientX - current.x
          settle(Math.abs(dx) >= current.width * .22 ? !flipped : flipped, dx < 0 ? -1 : 1)
        }
      }}
      onPointerCancel={cancel}
      onLostPointerCapture={event => {
        // Touch transfers its implicit capture from the hit button to the paper.
        if (event.target === event.currentTarget) cancel()
      }}>
      <div className="tpp-postcard-face" data-side="front" aria-hidden={flipped} inert={flipped}>
        {front}<button type="button" className="tpp-postcard-hit" aria-label="Turn postcard over" />
      </div>
      <div className="tpp-postcard-face tpp-back" data-side="back" aria-hidden={!flipped} inert={!flipped}>
        {back}<button type="button" className="tpp-postcard-hit" aria-label="Turn postcard to the front" />
      </div>
    </div>
    <span className="tpp-tape" aria-hidden="true" style={{ left: -18, top: 14, transform: "rotate(-38deg)", pointerEvents: "none" }} />
  </div>
}
