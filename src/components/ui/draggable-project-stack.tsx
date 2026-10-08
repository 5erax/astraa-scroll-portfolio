"use client"

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react"

export default function DraggableProjectStack({ label, style, onStep, children }: {
  label: string; style: CSSProperties; onStep: (delta: number) => void; children: ReactNode
}) {
  const gesture = useRef({ id: -1, x: 0, y: 0, width: 1, dragged: false, vertical: false,
    card: null as HTMLDivElement | null, start: "" })
  const reset = () => {
    const current = gesture.current
    current.id = -1
    if (current.card) {
      current.card.style.transition = ""
      current.card.style.transform = current.card.dataset.pose || ""
      current.card.parentElement?.removeAttribute("data-dragging")
    }
  }
  useEffect(() => { if (gesture.current.id !== -1) reset() }, [label])

  return <button type="button" className="tpp-project-stack relative block" aria-label={label} style={style}
    onClick={event => {
      if (event.detail > 0 && gesture.current.dragged) { event.preventDefault(); gesture.current.dragged = false }
      else onStep(1)
    }}
    onPointerDown={event => {
      if (!event.isPrimary || event.button !== 0) return
      const card = event.currentTarget.querySelector<HTMLDivElement>(".tpp-polaroid[aria-hidden=false]")
      if (!card) return
      gesture.current = { id: event.pointerId, x: event.clientX, y: event.clientY, width: event.currentTarget.offsetWidth,
        dragged: false, vertical: false, card, start: "" }
    }}
    onPointerMove={event => {
      const current = gesture.current
      if (current.id !== event.pointerId || current.vertical || !current.card) return
      const dx = event.clientX - current.x, dy = event.clientY - current.y
      if (!current.dragged) {
        if (event.pointerType !== "mouse" && Math.abs(dy) > 8 && Math.abs(dy) >= Math.abs(dx)) { current.vertical = true; return }
        if (Math.hypot(dx, dy) < 8) return
        current.dragged = true
        current.start = getComputedStyle(current.card).transform
        event.currentTarget.setPointerCapture(event.pointerId)
        event.currentTarget.setAttribute("data-dragging", "")
        current.card.style.transition = "none"
      }
      if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
        current.card.style.transform = `translate3d(${dx}px,${dy}px,0) ${current.start}`
      }
    }}
    onPointerUp={event => {
      const current = gesture.current
      if (current.id !== event.pointerId) return
      const dx = event.clientX - current.x
      reset()
      if (current.dragged && Math.abs(dx) >= Math.max(40, current.width * .22)) onStep(dx < 0 ? 1 : -1)
    }}
    onPointerCancel={reset}
    onLostPointerCapture={event => { if (event.target === event.currentTarget && gesture.current.id !== -1) reset() }}>
    {children}
  </button>
}
