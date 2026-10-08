"use client"

// Torn Postcard Portfolio — a whole personal site told as a winter travel journal.
// Five full-screen chapters (cover, postcard, work, route, write) sit in one
// pinned stage. Scroll and the chapter you are on tears along a ragged paper
// seam: the top half lifts away, the bottom half drops, and the next chapter
// pops up out of the gap, its pieces landing one after another.
//
// Every picture is drawn in this file: layered mountains, an engraved snowy
// peak, pine forests, an eagle, a squirrel on a pine branch, postcard photos,
// stamps, tape and a topographic map are SVG built from seeded numbers. The
// type is the system stack, and nothing loads at runtime. Swap any picture for
// your own photo through props.
import * as React from "react"
import MusicPlayer from "./music-player"
import ProfileViews from "./profile-views"
import EntryBackground from "./entry-background"
import FlippablePostcard from "./flippable-postcard"
import DraggableProjectStack from "./draggable-project-stack"

export type SceneKind = "dawn" | "lake" | "sun" | "forest" | "peak" | "night" | "river"

export type PostcardProject = {
  name: string
  year?: string
  role?: string
  description?: string
  tags?: string[]
  url?: string
  /** Handwritten caption under the polaroid. */
  note?: string
  /** Generated photo for the polaroid. Ignored when `image` is set. */
  scene?: SceneKind
  /** Your own photo (any URL). */
  image?: string
}

export type PostcardStop = {
  year: string
  title: string
  place?: string
  text?: string
}

export type PostcardAbout = {
  title?: string
  subtitle?: string
  /** The handwritten message on the front of the card. */
  text?: string
  /** The big photo on the front. A generated dawn scene when omitted. */
  photo?: string
  /** The face in the stamp. A drawn figure in a red jacket when omitted. */
  portrait?: string
  /** Personal photographs in the small, click-through polaroid. */
  snapshots?: { src: string; alt: string }[]
  /** Rows on the back of the card. */
  facts?: { label: string; value: string }[]
  skills?: string[]
}

export type PostcardLink = { label: string; url: string; disabled?: boolean }

export type PostcardPalette = {
  /** Night-blue chapters. */
  navy?: string
  /** The darkest blue: forests, shadows, the stage behind everything. */
  deep?: string
  /** Fog-beige chapters. */
  fog?: string
  /** Postcards, notes and polaroids. */
  paper?: string
  /** Text on paper. */
  ink?: string
  /** Rust: the squirrel, links, the active stop. */
  accent?: string
  /** Washi tape. */
  tape?: string
}

export type TornPostcardPortfolioProps = {
  name?: string
  role?: string
  location?: string
  /** Year on the logo stamp. */
  since?: string
  /** The cover headline, one string per line. */
  headline?: string[]
  /** Under the headline. */
  intro?: string
  /** The torn note under the eagle. Defaults to "<n> projects worth a slow look". */
  note?: string
  about?: PostcardAbout
  projects?: PostcardProject[]
  route?: PostcardStop[]
  email?: string
  links?: PostcardLink[]
  /** Nav labels for the five chapters. */
  labels?: string[]
  workTitle?: string
  routeTitle?: string
  contactTitle?: string
  palette?: PostcardPalette
  /** Viewport-heights of scroll per chapter. */
  scrollPerChapter?: number
  /** Ease the tear toward the scroll position instead of following it 1:1. */
  smooth?: boolean
  /** When scrolling stops halfway through a tear, finish (or undo) it. */
  snap?: boolean
  /** Headline rises and the eagle glides in on first paint. */
  animateIn?: boolean
  /** Falling snow on the night-blue chapters. */
  snow?: boolean
  /** Height of the pinned stage. Always a definite length. */
  height?: string
  className?: string
}

// #region logic
type Pt = [number, number]

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))

/** Seeded PRNG, so every drawing is identical on server and client. */
const rng = (seed: number) => {
  let a = seed >>> 0 || 1
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const ease = (x: number) => {
  const t = clamp(x, 0, 1)
  return t * t * (3 - 2 * t)
}

const fmt = (n: number) => String(Math.round(n * 100) / 100)

/** A tear: n + 1 vertical offsets (px) at evenly spaced x. Long waves plus ragged fibres. */
const tornEdge = (seed: number, n: number, amp: number): number[] => {
  const r = rng(seed)
  const a = r() * 6.283
  const b = r() * 6.283
  const out: number[] = []
  for (let i = 0; i <= n; i++) {
    const x = i / n
    let y = Math.sin(x * 6.283 * 1.15 + a) * amp * 0.55 + Math.sin(x * 6.283 * 3.4 + b) * amp * 0.28 + (r() - 0.5) * amp * 0.6
    if (r() < 0.07) y += (r() - 0.5) * amp * 1.5
    out.push(Math.round(y * 10) / 10)
  }
  return out
}

/** How far the white paper core shows past the tear, per point. */
const fiberDepth = (seed: number, n: number, min: number, max: number): number[] => {
  const r = rng(seed)
  const a = r() * 6.283
  const out: number[] = []
  for (let i = 0; i <= n; i++) {
    const wave = 0.5 + 0.5 * Math.sin((i / n) * 6.283 * 2.3 + a)
    out.push(Math.round((min + (max - min) * (wave * 0.7 + r() * 0.3)) * 10) / 10)
  }
  return out
}

/** Sheets overscan the stage by PAD px top and bottom so a tilt never shows an edge. */
const PAD = 40

const edgeY = (seam: number, off: number) =>
  "calc(" + PAD + "px + (100% - " + PAD * 2 + "px) * " + fmt(seam) + (off < 0 ? " - " + fmt(-off) : " + " + fmt(off)) + "px)"

/** clip-path for the piece above the tear (optionally pushed down by a fibre band). */
const upperClip = (edge: number[], seam: number, depth?: number[]) => {
  const n = edge.length - 1
  const pts = ["0 0", "100% 0"]
  for (let i = n; i >= 0; i--) pts.push(fmt((i / n) * 100) + "% " + edgeY(seam, edge[i] + (depth ? depth[i] : 0)))
  return "polygon(" + pts.join(",") + ")"
}

/** clip-path for the piece below the tear (optionally pulled up by a fibre band). */
const lowerClip = (edge: number[], seam: number, depth?: number[]) => {
  const n = edge.length - 1
  const pts: string[] = []
  for (let i = 0; i <= n; i++) pts.push(fmt((i / n) * 100) + "% " + edgeY(seam, edge[i] - (depth ? depth[i] : 0)))
  pts.push("100% 100%", "0 100%")
  return "polygon(" + pts.join(",") + ")"
}

/**
 * Scroll position (in chapters) → what every chapter is doing. Chapter k rests
 * for the first `hold` of its slice, then tears open; k + 1 grows out of the gap.
 */
const frame = (s: number, n: number, hold: number) => {
  const pos = clamp(s, 0, n - 1)
  const k = Math.min(Math.floor(pos), n - 1)
  const split = k < n - 1 ? ease((pos - k - hold) / (1 - hold)) : 0
  const chapters: { s: number; p: number; on: boolean }[] = []
  for (let i = 0; i < n; i++) {
    chapters.push({
      s: i === k ? split : 0,
      p: i === k ? 1 : i === k + 1 ? split : 0,
      on: i === k || (i === k + 1 && split > 0),
    })
  }
  return { k, split, active: split > 0.55 ? k + 1 : k, chapters }
}

/** Where to settle when scrolling stops halfway through a tear, or null to stay. */
const snapTarget = (s: number, n: number, hold: number, dir: number): number | null => {
  const pos = clamp(s, 0, n - 1)
  const k = Math.floor(pos)
  if (k >= n - 1) return null
  const split = ease((pos - k - hold) / (1 - hold))
  if (split <= 0.002 || split >= 0.998) return null
  const forward = dir > 0 ? split > 0.12 : split > 0.88
  return forward ? k + 1 : k + hold
}

const wrap = (i: number, n: number) => ((i % n) + n) % n

const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("") || "·"

const mailtoHref = (email: string, subject: string, body: string) => {
  const q: string[] = []
  if (subject) q.push("subject=" + encodeURIComponent(subject))
  if (body) q.push("body=" + encodeURIComponent(body))
  return "mailto:" + email + (q.length ? "?" + q.join("&") : "")
}

/** Midpoint-displacement mountain ridge from x0 to x1 around `base`. */
const ridge = (seed: number, x0: number, x1: number, base: number, amp: number, rough = 0.52, depth = 7): Pt[] => {
  const r = rng(seed)
  const n = Math.pow(2, depth)
  const ys: number[] = []
  for (let i = 0; i <= n; i++) ys.push(0)
  ys[0] = (r() - 0.5) * amp
  ys[n] = (r() - 0.5) * amp
  let step = n
  let a = amp
  while (step > 1) {
    const half = step / 2
    for (let i = half; i < n; i += step) ys[i] = (ys[i - half] + ys[i + half]) / 2 + (r() - 0.5) * a
    a *= rough
    step = half
  }
  return ys.map((y, i) => [x0 + ((x1 - x0) * i) / n, base + y] as Pt)
}

/** Catmull-Rom through points → cubic Bézier path. */
const curveThrough = (p: Pt[]) => {
  if (p.length < 2) return ""
  let d = "M" + fmt(p[0][0]) + " " + fmt(p[0][1])
  for (let i = 0; i < p.length - 1; i++) {
    const a = p[Math.max(0, i - 1)]
    const b = p[i]
    const c = p[i + 1]
    const e = p[Math.min(p.length - 1, i + 2)]
    d += " C" + fmt(b[0] + (c[0] - a[0]) / 6) + " " + fmt(b[1] + (c[1] - a[1]) / 6) + " " + fmt(c[0] - (e[0] - b[0]) / 6) + " " + fmt(c[1] - (e[1] - b[1]) / 6) + " " + fmt(c[0]) + " " + fmt(c[1])
  }
  return d
}

/** How far along curveThrough(p) each point sits (0 → 1), and the curve's length. */
const measureCurve = (p: Pt[]): { fr: number[]; total: number } => {
  if (p.length < 2) return { fr: p.map(() => 0), total: 0 }
  const lens = [0]
  let total = 0
  for (let i = 0; i < p.length - 1; i++) {
    const a = p[Math.max(0, i - 1)]
    const b = p[i]
    const c = p[i + 1]
    const e = p[Math.min(p.length - 1, i + 2)]
    const c1: Pt = [b[0] + (c[0] - a[0]) / 6, b[1] + (c[1] - a[1]) / 6]
    const c2: Pt = [c[0] - (e[0] - b[0]) / 6, c[1] - (e[1] - b[1]) / 6]
    let prev = b
    for (let k = 1; k <= 24; k++) {
      const t = k / 24
      const u = 1 - t
      const q: Pt = [
        u * u * u * b[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * c[0],
        u * u * u * b[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * c[1],
      ]
      total += Math.hypot(q[0] - prev[0], q[1] - prev[1])
      prev = q
    }
    lens.push(total)
  }
  return { fr: lens.map((l) => (total ? l / total : 0)), total }
}

const pathFractions = (p: Pt[]) => measureCurve(p).fr
// #endregion logic

/* ------------------------------------------------------------------ */
/* defaults                                                           */
/* ------------------------------------------------------------------ */

const DEFAULT_PROJECTS: PostcardProject[] = [
  {
    name: "Hearth",
    year: "2026",
    role: "Product design & build",
    description: "A booking app for mountain lodges that feels like walking into a warm kitchen. Rooms, sauna slots and the bus timetable on one calm screen.",
    tags: ["React Native", "Design"],
    note: "4.9 on the store, no ads",
    scene: "dawn",
  },
  {
    name: "Frostline",
    year: "2025",
    role: "Data visualisation",
    description: "An avalanche and weather dashboard for ski patrols, readable at a glance and usable with gloves on.",
    tags: ["D3", "React"],
    note: "used by 12 patrol teams",
    scene: "peak",
  },
  {
    name: "Swan Count",
    year: "2025",
    role: "Design + iOS",
    description: "Citizen science for a lake that never freezes. Over a thousand whooper swans winter there, and volunteers count every one.",
    tags: ["SwiftUI", "Research"],
    note: "1,500 swans every winter",
    scene: "lake",
  },
  {
    name: "Ember",
    year: "2024",
    role: "Product design",
    description: "The companion app for a warm-light lamp: sunrise alarms, slow evenings and nothing that glows blue after nine.",
    tags: ["Figma", "Motion"],
    note: "the sunrise alarm",
    scene: "sun",
  },
  {
    name: "Trailhead",
    year: "2023",
    role: "Front-end",
    description: "Open-source trail maps that keep working offline, deep in the woods where the signal gives up.",
    tags: ["Maps", "PWA"],
    url: "https://example.com",
    note: "40 MB of forest, offline",
    scene: "forest",
  },
]

const DEFAULT_ROUTE: PostcardStop[] = [
  { year: "2019", title: "Went freelance", place: "Hyderabad", text: "Two cafés and a yoga studio. Learned to listen before drawing anything." },
  { year: "2020", title: "Designer at Nordlys", place: "Remote", text: "Design systems for a travel company. Shipped a booking flow that halved support tickets." },
  { year: "2022", title: "Lead designer, Frostline", place: "Bengaluru", text: "Built the data-viz team from one to five. Charts that work in a blizzard." },
  { year: "2024", title: "Design engineer, Hearth", place: "Remote", text: "Prototype in code, ship in code. Owned the app from first sketch to store." },
  { year: "2026", title: "Independent studio", place: "Anywhere with a view", text: "Taking on a few careful projects a year. Maybe yours." },
]

const DEFAULT_ABOUT: PostcardAbout = {
  title: "Postcard",
  subtitle: "How I slow down, recover and keep making good things",
  text: "If you need to reset, rebuild your focus and get your energy back, the best way is to make something with care, in good company. I design and build calm, useful products, and I like trading the noise for the view and shipping with the people who will use it.",
  facts: [
    { label: "Based in", value: "Hyderabad, India" },
    { label: "Doing", value: "Product design + front-end" },
    { label: "Experience", value: "7 years, 40+ launches" },
    { label: "Currently", value: "Open for new projects" },
  ],
  skills: ["Figma", "React", "TypeScript", "Motion", "Design systems", "Research"],
}

const DEFAULT_LINKS: PostcardLink[] = [
  { label: "GitHub", url: "https://github.com" },
  { label: "LinkedIn", url: "https://linkedin.com" },
  { label: "Dribbble", url: "https://dribbble.com" },
]

const N = 5
const HOLD = 0.32
/** Is the paper under the nav dark or light, per chapter. */
const TONES = ["dark", "light", "dark", "light", "dark"]

/* ------------------------------------------------------------------ */
/* styles                                                             */
/* ------------------------------------------------------------------ */

const TPP_CSS = `
.tpp-root{position:relative;width:100%;color:var(--tpp-ink);font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;-webkit-font-smoothing:antialiased;--tpp-serif:"Cormorant Garamond","Cormorant","Playfair Display","Didot","Bodoni 72",Georgia,"Times New Roman",serif;--tpp-hand:"Caveat","Segoe Print","Bradley Hand","Marker Felt","Comic Sans MS",cursive}
.tpp-root *,.tpp-root *::before,.tpp-root *::after{box-sizing:border-box}
.tpp-root :where(button){font:inherit;color:inherit;background:none;border:0;padding:0;margin:0;cursor:pointer;text-align:inherit}
.tpp-root :where(button,a,textarea,input):focus-visible{outline:2px dashed currentColor;outline-offset:3px}
.tpp-root :where(.tpp-tag,.tpp-luggage):focus-visible{outline-offset:-5px}
.tpp-root :where(button,a){touch-action:manipulation}
.tpp-root :where(.tpp-label:is(button,a),.tpp-brand,.tpp-link){min-height:44px;display:inline-flex;align-items:center}
.tpp-svg{display:block;max-width:none}
.tpp-fill{position:absolute;inset:0;width:100%;height:100%}
.tpp-track{position:relative;width:100%}
.tpp-root:not([data-entry=entered]){height:100svh;overflow:clip}
.tpp-root[data-entry=sealed] .tpp-track{visibility:hidden}
.tpp-root:not([data-entry=entered]) .tpp-track *{animation-play-state:paused!important}
.tpp-entry{position:fixed;inset:0;z-index:100;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:48px;padding:28px 20px;background:var(--tpp-deep);color:var(--tpp-paper);overflow:clip;isolation:isolate}
.tpp-entry-media{position:absolute;inset:0;z-index:-2;pointer-events:none}
.tpp-entry-media img,.tpp-entry-media video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.tpp-entry-media::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,#08122699,#08122699 50%,#081226dd)}
.tpp-entry::before{content:"";position:absolute;inset:18px;border:1px solid rgba(242,237,226,.14);pointer-events:none}
.tpp-entry::after{content:"";position:absolute;inset:0;background-image:var(--tpp-gd);background-size:192px;pointer-events:none;z-index:-1}
.tpp-entry-heading{text-align:center;margin:0}
.tpp-entry-heading span{display:block;font-size:11px;letter-spacing:.28em;text-transform:uppercase;margin-bottom:16px;opacity:.9}
.tpp-entry-heading strong{font-family:var(--tpp-serif);font-size:clamp(28px,5vw,42px);font-weight:400;line-height:1.2}
.tpp-root .tpp-entry-button{position:relative;width:min(420px,78vw);aspect-ratio:1.6;perspective:1200px;isolation:isolate;outline-offset:16px;flex-shrink:0}
.tpp-entry-envelope{position:absolute;inset:0;background:#d6cbb8;border:1px solid #d7cbb6;border-radius:3px;box-shadow:0 24px 52px -20px rgba(0,0,0,.7);transform-style:preserve-3d;transition:transform .25s cubic-bezier(.23,1,.32,1)}
.tpp-entry-envelope::after{content:"";position:absolute;inset:0;z-index:12;pointer-events:none;background-image:var(--tpp-gl);background-size:128px;opacity:.3;border-radius:3px}
.tpp-entry-route{position:absolute;inset:-18% -22%;width:144%;height:136%;pointer-events:none;opacity:.18;transition:opacity .2s ease}
.tpp-entry-plane{transform-box:fill-box;transform-origin:center;transition:transform .25s cubic-bezier(.23,1,.32,1)}
.tpp-entry-shadow{position:absolute;inset:20px 10px -18px;background:radial-gradient(ellipse,rgba(0,0,0,.32),transparent 70%);transform:translateY(10px) scale(.95);transition:transform .25s cubic-bezier(.23,1,.32,1),opacity .2s ease;pointer-events:none}
.tpp-entry-letter{position:absolute;inset:10% 6% 4%;z-index:3;background:#fcf9f1;border:1px solid #d7cbb6;display:flex;flex-direction:column;align-items:center;justify-content:center;color:var(--tpp-ink);gap:12px;text-align:center;transition:transform .25s cubic-bezier(.23,1,.32,1)}
.tpp-entry-letter::before{content:"";position:absolute;inset:12px;border:1px solid #b4673d33;pointer-events:none}
.tpp-entry-letter span{font-family:var(--tpp-serif);font-size:clamp(26px,5vw,40px)}
.tpp-entry-letter small{font-size:9px;letter-spacing:.22em;text-transform:uppercase}
.tpp-entry-pocket{position:absolute;inset:0;z-index:5;clip-path:polygon(0 0,50% 50%,100% 0,100% 100%,0 100%);background:linear-gradient(33deg,#e7ddcc 49.7%,#c5b69e 50%,#eee5d6 50.3%);border-radius:3px}
.tpp-entry-fold{position:absolute;inset:0;z-index:6;clip-path:polygon(0 100%,50% 42%,100% 100%);background:linear-gradient(180deg,#e0d5c1,#efe7d8);border-radius:3px}
.tpp-entry-flap{position:absolute;left:0;right:0;top:0;height:58%;z-index:8;transform-origin:50% 0;transform-style:preserve-3d;clip-path:polygon(0 0,100% 0,50% 100%);background:linear-gradient(#f4ede0,#dbcfba);border-top:1px solid rgba(255,255,255,.7);transition:transform .25s cubic-bezier(.23,1,.32,1),z-index 0s .2s}
.tpp-entry-flap::before{content:"";position:absolute;inset:6px 7px auto;height:2px;background:repeating-linear-gradient(135deg,#637f9d 0 8px,transparent 8px 16px,#b4673d 16px 24px,transparent 24px 32px);opacity:.6;pointer-events:none}
.tpp-entry-seal{position:absolute;left:50%;top:48%;z-index:9;display:grid;place-items:center;width:56px;height:56px;transform:translate(-50%,-50%) rotate(-8deg);border-radius:48% 52% 46% 54%;background:radial-gradient(circle at 35% 25%,#c2845b,#8b472d);color:#f2dfc4;border:3px double #d0996d;box-shadow:0 3px 4px rgba(67,32,22,.3),inset 0 1px 3px #efbf8877,inset 0 -2px 4px #4f201e77;font-family:var(--tpp-serif);font-size:26px;text-shadow:0 1px 1px #572913;overflow:clip;transition:transform .25s cubic-bezier(.23,1,.32,1)}
.tpp-entry-seal::after{content:"";position:absolute;inset:-20px;background:linear-gradient(110deg,transparent 35%,#fff4cc55 48%,transparent 61%);transform:translateX(-100%);transition:transform .5s cubic-bezier(.23,1,.32,1);pointer-events:none}
.tpp-entry-airmail{position:absolute;inset:7px;z-index:10;border:2px solid transparent;border-top:0;border-image:repeating-linear-gradient(135deg,#637f9d 0 8px,transparent 8px 16px,#b4673d 16px 24px,transparent 24px 32px) 2;opacity:.6;pointer-events:none}
.tpp-entry-stamp{position:absolute;right:6%;top:8%;z-index:9;width:48px;height:62px;background:#f9f5ea;padding:5px;transform:rotate(5deg);box-shadow:0 2px 3px #2c201e33;clip-path:polygon(0 0,10% 3%,20% 0,30% 3%,40% 0,50% 3%,60% 0,70% 3%,80% 0,90% 3%,100% 0,97% 10%,100% 20%,97% 30%,100% 40%,97% 50%,100% 60%,97% 70%,100% 80%,97% 90%,100% 100%,90% 97%,80% 100%,70% 97%,60% 100%,50% 97%,40% 100%,30% 97%,20% 100%,10% 97%,0 100%,3% 90%,0 80%,3% 70%,0 60%,3% 50%,0 40%,3% 30%,0 20%,3% 10%);transition:transform .25s cubic-bezier(.23,1,.32,1)}
.tpp-entry-stamp img{display:block;width:100%;height:39px;object-fit:cover}
.tpp-entry-stamp small{display:block;text-align:center;font-size:6px;letter-spacing:.12em;color:var(--tpp-ink);margin-top:3px}
.tpp-entry-cancel{position:absolute;right:10%;top:19%;z-index:10;width:96px;height:40px;transform:rotate(-15deg);color:var(--tpp-ink);opacity:.42;pointer-events:none}
.tpp-entry-address{position:absolute;left:7%;bottom:10%;z-index:7;color:var(--tpp-ink);font-size:10px;line-height:1.8;letter-spacing:.12em;text-transform:uppercase}
.tpp-entry-postmark{position:absolute;right:7%;bottom:10%;z-index:7;color:var(--tpp-accent);border:1px solid currentColor;border-radius:50%;width:54px;height:54px;display:grid;place-items:center;font-size:8px;letter-spacing:.05em;text-align:center;line-height:1.4;transform:rotate(-14deg)}
.tpp-entry-caption{text-align:center;line-height:1.7;margin:0;font-size:12px;letter-spacing:.12em}
.tpp-entry-caption small{display:block;font-size:10px;letter-spacing:.06em;opacity:.8}
.tpp-entry-caption-arrow{display:inline-block;margin-left:6px;transition:transform .2s cubic-bezier(.23,1,.32,1)}
.tpp-entry-footer{position:absolute;bottom:36px;font-size:9px;letter-spacing:.2em;text-transform:uppercase;opacity:.75}
.tpp-entry[data-opening]{animation:tpp-entry-exit .9s ease-out both;pointer-events:none}
.tpp-entry[data-opening] :is(.tpp-entry-heading,.tpp-entry-caption,.tpp-entry-footer){opacity:0;transition:opacity .15s ease-out}
.tpp-entry[data-opening] .tpp-entry-flap{transform:rotateX(-180deg);z-index:2;transition-duration:.4s,0s}
.tpp-entry[data-opening] .tpp-entry-flap::before{opacity:0;transition:opacity .15s ease-out}
.tpp-entry[data-opening] .tpp-entry-seal{transition:opacity .15s ease-out;opacity:0}
.tpp-entry[data-opening] .tpp-entry-letter{transform:translateY(-50%) rotate(-2deg);transition-duration:.5s;transition-delay:.16s}
@keyframes tpp-entry-exit{0%,70%{opacity:1;transform:none}100%{opacity:0;transform:translateY(-12px)}}
@media(max-height:600px){.tpp-entry{gap:24px}.tpp-root .tpp-entry-button{width:min(340px,65vw)}.tpp-entry-footer{bottom:24px}}
@media(hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference){
 .tpp-entry:not([data-opening]) .tpp-entry-button:hover .tpp-entry-envelope{transform:rotateX(6deg) rotateY(-7deg) rotateZ(-1deg)}
 .tpp-entry:not([data-opening]) .tpp-entry-button:hover .tpp-entry-flap{transform:rotateX(-24deg)}
 .tpp-entry:not([data-opening]) .tpp-entry-button:hover .tpp-entry-letter{transform:translateY(-15%) rotate(-1deg)}
 .tpp-entry:not([data-opening]) .tpp-entry-button:hover .tpp-entry-seal{transform:translate(-50%,-50%) rotate(-14deg) scale(.96)}
 .tpp-entry-button:hover .tpp-entry-seal::after{transform:translateX(100%)}
 .tpp-entry-button:hover .tpp-entry-stamp{transform:rotate(1deg) translateY(-2px)}
 .tpp-entry-button:hover .tpp-entry-shadow{transform:translateY(18px) scale(.88);opacity:.7}
 .tpp-entry-button:hover .tpp-entry-route{opacity:.35}
 .tpp-entry-button:hover .tpp-entry-plane{transform:translate(10px,-6px) rotate(-8deg)}
 .tpp-entry-button:hover~.tpp-entry-caption .tpp-entry-caption-arrow{transform:translate(3px,-3px)}
 .tpp-root :is(.tpp-note,.tpp-envelope,.tpp-project-stack,.tpp-snapshot,.tpp-logo-button){transition:translate .2s ease,rotate .2s ease}
 .tpp-note:hover,.tpp-envelope:hover,.tpp-project-stack:hover,.tpp-snapshot:hover{translate:0 -3px}
 .tpp-snapshot:hover,.tpp-logo-button:hover{rotate:1deg}
 .tpp-envelope:hover .tpp-letter{transform:translateY(-10px)}
}
.tpp-stage{position:sticky;top:0;width:100%;overflow:clip;container-type:size;container-name:tpp;background:var(--tpp-deep)}
.tpp-ch{position:absolute;inset:0;visibility:hidden;contain:layout paint style}
.tpp-ch[data-on]{visibility:visible}
.tpp-ch[data-on] .tpp-pop{will-change:transform,opacity}
.tpp-in{position:absolute;inset:0;transform-origin:50% 55%;perspective:1800px}
.tpp-ch:not([data-on]) *{animation-play-state:paused !important}
.tpp-root[data-scrolling] :is(.tpp-flake,.tpp-twinkle,.tpp-wing,.tpp-glide,.tpp-aurora,.tpp-dash,.tpp-walker){animation-play-state:paused !important}
.tpp-up,.tpp-lo{position:absolute;left:0;right:0;top:-40px;bottom:-40px;will-change:transform}
.tpp-up{z-index:2;transform-origin:50% calc(var(--seam) * 100%)}
.tpp-lo{z-index:1;transform-origin:50% calc(var(--seam) * 100%)}
.tpp-light{position:absolute;inset:0;pointer-events:none;opacity:0;will-change:opacity;background:linear-gradient(180deg,transparent 30%,rgba(255,249,224,.35) 70%,rgba(8,14,26,.5))}
.tpp-lo .tpp-light{background:linear-gradient(0deg,transparent 10%,rgba(8,14,26,.35) 80%,rgba(255,249,224,.3))}
.tpp-sh,.tpp-fib,.tpp-shade{position:absolute;inset:0}
.tpp-fib{background:var(--tpp-fiber)}
.tpp-shade{background:rgba(8,14,26,.3)}
.tpp-lo .tpp-shade{background:rgba(8,14,26,.18)}
.tpp-grain{position:absolute;inset:0;background-image:var(--tpp-gd);background-size:192px 192px;pointer-events:none}
.tpp-grain[data-light]{background-image:var(--tpp-gl)}
.tpp-box{position:absolute;left:0;right:0;top:40px;bottom:40px;overflow:clip}
.tpp-ub{position:absolute;left:0;right:0;top:0;height:calc(var(--seam) * 100%)}
.tpp-lb{position:absolute;left:0;right:0;bottom:0;top:calc(var(--seam) * 100% + 16px)}
.tpp-par{will-change:transform;transition:transform .25s ease-out}
.tpp-root[data-mode=stack] .tpp-stage{position:relative;container-type:normal;background:none}
.tpp-root[data-mode=stack] .tpp-ch{position:relative;inset:auto;visibility:visible;height:max(var(--tpp-h),760px);container-type:size;container-name:tpp;overflow:clip;content-visibility:auto}

.tpp-serif{font-family:var(--tpp-serif)}
.tpp-hand{font-family:var(--tpp-hand)}
.tpp-h{font-family:var(--tpp-serif);font-weight:300;text-transform:uppercase;letter-spacing:.06em;line-height:1.08;margin:0}
.tpp-hero-h{font-size:clamp(28px,min(4.8cqw,7.4cqh),70px);color:#f3eee4;text-shadow:0 2px 24px rgba(10,18,32,.45)}
.tpp-sec-h{font-size:clamp(24px,min(4cqw,6cqh),56px)}
.tpp-label{font-size:11px;letter-spacing:.24em;text-transform:uppercase}

.tpp-nav{position:absolute;left:0;right:0;top:0;z-index:40;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:16px clamp(16px,4cqw,44px);color:var(--tpp-navc,#f3eee4);transition:color .5s;pointer-events:none}
.tpp-nav>*{pointer-events:auto}
.tpp-stage[data-tone=light] .tpp-nav,.tpp-stage[data-tone=light] .tpp-rail{--tpp-navc:var(--tpp-ink)}
.tpp-brand{font-size:12px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;white-space:nowrap}
.tpp-brand-group{display:flex;flex-direction:column;align-items:flex-start}
.tpp-profile-views{display:inline-flex;align-items:center;gap:5px;font-size:10px;line-height:12px;letter-spacing:.08em;font-variant-numeric:tabular-nums;opacity:.7}
.tpp-links{display:flex;gap:clamp(12px,2.2cqw,28px)}
.tpp-link{position:relative;font-size:11px;letter-spacing:.2em;text-transform:uppercase;opacity:.7;transition:opacity .3s}
.tpp-link:hover,.tpp-link[aria-current=true]{opacity:1}
.tpp-link::after{content:"";position:absolute;left:0;right:0;bottom:-6px;height:1px;background:currentColor;transform:scaleX(0);transition:transform .4s cubic-bezier(.2,.8,.2,1)}
.tpp-link[aria-current=true]::after{transform:scaleX(1)}
.tpp-count{display:none;font-size:11px;letter-spacing:.12em;min-height:44px;padding:0 8px;border:1px solid currentColor;border-radius:3px}
.tpp-index{inset:80px 16px auto auto;margin:0;width:min(320px,calc(100vw - 32px));padding:18px;background:var(--tpp-paper);color:var(--tpp-ink);border:1px solid rgba(38,54,79,.3);box-shadow:0 18px 60px rgba(8,14,26,.3);border-radius:3px}
.tpp-index::backdrop{background:rgba(8,14,26,.28)}
.tpp-index button{display:flex;width:100%;align-items:center;justify-content:space-between;min-height:52px;border-top:1px solid rgba(38,54,79,.18);font-family:var(--tpp-serif);font-size:24px}
.tpp-index button[aria-current=true]{color:var(--tpp-accent)}
.tpp-root[data-mode=stack] .tpp-nav{position:fixed;background:var(--tpp-paper);color:var(--tpp-ink);padding-top:8px;padding-bottom:8px}
.tpp-rail{position:absolute;right:0;top:50%;z-index:40;display:flex;flex-direction:column;transform:translateY(-50%);color:var(--tpp-navc,#f3eee4)}
.tpp-dot{display:grid;place-items:center;width:44px;height:44px;opacity:.65;transition:opacity .2s}
.tpp-dot::after{content:"";width:9px;height:9px;border:1px solid currentColor;border-radius:99px;transition:transform .2s,background .2s}
.tpp-dot[aria-current=true]{opacity:1}
.tpp-dot[aria-current=true]::after{background:currentColor;transform:scale(1.25)}

.tpp-tag{display:inline-flex;align-items:center;gap:8px;padding:10px 18px;font-size:11px;font-weight:600;letter-spacing:.2em;text-transform:uppercase;background:var(--tpp-paper);color:var(--tpp-ink);clip-path:polygon(0 8%,4% 0,30% 6%,58% 0,84% 5%,100% 0,98% 46%,100% 100%,70% 94%,40% 100%,12% 95%,0 100%,2% 52%);transition:transform .35s cubic-bezier(.2,.8,.2,1),background .3s}
.tpp-tag:hover{transform:translateY(-3px) rotate(-1.5deg)}
.tpp-tag[data-ghost]{background:transparent;color:inherit;box-shadow:inset 0 0 0 1px currentColor;clip-path:none;border-radius:2px}

.tpp-paper{background:var(--tpp-paper);color:var(--tpp-ink);box-shadow:0 1px 0 rgba(255,255,255,.6) inset,0 18px 40px -18px rgba(8,14,26,.55),0 3px 8px rgba(8,14,26,.18)}
.tpp-tape{position:absolute;width:76px;height:22px;background:var(--tpp-tape);opacity:.82;clip-path:polygon(0 10%,6% 0,12% 12%,20% 0,100% 0,96% 30%,100% 55%,95% 80%,100% 100%,0 100%,4% 70%,0 45%);mix-blend-mode:multiply;z-index:3;pointer-events:none}
.tpp-note{position:absolute;padding:14px 18px 16px;font-family:var(--tpp-hand);font-size:clamp(14px,1.35cqw,19px);line-height:1.15;text-align:center;clip-path:polygon(2% 6%,10% 0,22% 5%,40% 1%,60% 6%,78% 0,96% 4%,100% 22%,97% 48%,100% 76%,96% 100%,74% 95%,52% 100%,30% 94%,8% 100%,0 78%,3% 50%,0 24%);transition:transform .45s cubic-bezier(.2,.8,.2,1)}

.tpp-eagle .tpp-wing{transform-box:view-box;transform-origin:124px 98px;animation:tpp-flap 3.6s ease-in-out infinite}
.tpp-eagle .tpp-wing-b{transform-origin:142px 96px;animation-delay:-.15s}
.tpp-glide{animation:tpp-glide 9s ease-in-out infinite}
@keyframes tpp-flap{0%,100%{transform:rotate(0)}45%{transform:rotate(-7deg)}60%{transform:rotate(3deg)}}
@keyframes tpp-glide{0%,100%{transform:translate(0,0) rotate(0)}50%{transform:translate(-14px,10px) rotate(-2deg)}}
.tpp-flake{position:absolute;top:-10px;width:var(--fs);height:var(--fs);border-radius:99px;background:#fff;opacity:.75;animation:tpp-fall var(--fd) linear infinite;animation-delay:var(--fl);pointer-events:none}
@keyframes tpp-fall{from{transform:translate(0,-20px)}to{transform:translate(var(--fx),calc(100cqh + 40px))}}
.tpp-hint{display:inline-block;animation:tpp-bob 1.8s ease-in-out infinite}
@keyframes tpp-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(5px)}}

.tpp-rise{animation:tpp-rise 1.1s cubic-bezier(.2,.8,.2,1) both;animation-delay:var(--rd,0s)}
@keyframes tpp-rise{from{opacity:0;transform:translateY(26px);filter:blur(6px)}to{opacity:1;transform:none;filter:none}}
.tpp-flyin{animation:tpp-flyin 1.8s cubic-bezier(.2,.8,.2,1) both .3s}
@keyframes tpp-flyin{from{opacity:0;transform:translate(160px,-90px) scale(.7) rotate(8deg)}to{opacity:1;transform:none}}

.tpp-card3d{display:grid;perspective:1600px}
.tpp-card3d>*{grid-area:1/1}
.tpp-flip{display:grid;transition:transform .3s cubic-bezier(.23,1,.32,1);transform-style:preserve-3d;touch-action:pan-y pinch-zoom}
.tpp-flip>*{grid-area:1/1;backface-visibility:hidden;-webkit-backface-visibility:hidden}
.tpp-flip[data-back]{transform:rotateY(180deg)}
.tpp-postcard-face{position:relative;min-height:0;isolation:isolate}
.tpp-root .tpp-postcard-hit{position:absolute;inset:0;width:100%;height:100%;z-index:1;cursor:grab;border-radius:3px}
.tpp-flip[data-dragging] .tpp-postcard-hit{cursor:grabbing}
.tpp-postcard-face :is(a,button):not(.tpp-postcard-hit){position:relative;z-index:2}
.tpp-postcard-face .tpp-snapshot{z-index:2}
.tpp-back{transform:rotateY(180deg)}
.tpp-postcard{width:min(800px,88cqw,calc((var(--seam) * 100cqh - 150px) * 1.66));aspect-ratio:1.62/1}
.tpp-pc-grid{display:grid;grid-template-columns:1fr 1px 1fr;gap:clamp(12px,2cqw,26px);height:100%;padding:clamp(14px,2.2cqw,26px)}
.tpp-rule{background:repeating-linear-gradient(to bottom,transparent 0,transparent calc(1.5em - 1px),rgba(38,54,79,.22) calc(1.5em - 1px),rgba(38,54,79,.22) 1.5em)}
.tpp-hw{font-family:var(--tpp-hand);font-size:clamp(13px,1.45cqw,19px);line-height:1.5em;color:#2f4a76}
.tpp-about-copy{font-size:clamp(14px,min(1.4cqw,2.3cqh),18px)}
.tpp-mini-gallery{display:flex;flex-direction:column;position:relative;width:100%;height:100%;cursor:pointer;color:var(--tpp-ink);text-align:left}
.tpp-gallery-image{display:block;position:relative;flex:1;min-height:0;background:#e4dfd5;overflow:clip}
.tpp-gallery-image img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;opacity:0}
.tpp-mini-gallery[data-animate] .tpp-gallery-image img{transition:opacity .2s cubic-bezier(.23,1,.32,1)}
.tpp-gallery-image img[data-current]{opacity:1}
.tpp-gallery-caption{display:flex;align-items:center;justify-content:space-between;gap:4px;font-size:8px;line-height:20px;letter-spacing:.06em;white-space:nowrap}
.tpp-envelope{transition:transform .5s cubic-bezier(.2,.8,.2,1)}
.tpp-envelope .tpp-letter{transition:transform .5s cubic-bezier(.2,.8,.2,1)}

.tpp-project-stack{touch-action:pan-y pinch-zoom;perspective:1000px;cursor:grab;user-select:none}
.tpp-project-stack[data-dragging]{cursor:grabbing}
.tpp-polaroid{position:absolute;inset:0;padding:10px 10px 0;background:#f7f4ee;box-shadow:0 22px 40px -18px rgba(0,0,0,.6),0 2px 6px rgba(0,0,0,.25);transition:transform .3s cubic-bezier(.23,1,.32,1),opacity .25s}
.tpp-project-info{display:grid}
.tpp-project-details{grid-area:1/1;display:flex;flex-direction:column}
.tpp-ncard{position:relative;background:#f4f1ea;color:var(--tpp-ink);border-radius:8px;padding:clamp(14px,1.8cqw,22px);box-shadow:0 20px 40px -20px rgba(0,0,0,.65)}
.tpp-ncard::before{content:"";position:absolute;inset:5px;border:1px solid rgba(38,54,79,.35);border-radius:5px;pointer-events:none}
.tpp-chip{display:inline-block;padding:3px 9px;font-size:10px;letter-spacing:.12em;text-transform:uppercase;border:1px solid rgba(38,54,79,.35);border-radius:99px}
.tpp-round{display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:99px;border:1px solid currentColor;transition:background .2s,color .2s,transform .2s}
.tpp-round:hover{background:#f3eee4;color:var(--tpp-deep);transform:scale(1.06)}
.tpp-pip{display:grid;place-items:center;width:30px;height:44px;opacity:.4;transition:opacity .2s}
.tpp-pip::after{content:"";width:16px;height:4px;border-radius:2px;background:currentColor;transition:transform .2s}
.tpp-pip[aria-current=true]{opacity:1}
.tpp-pip[aria-current=true]::after{transform:scaleX(1.5)}
.tpp-project-controls{flex-wrap:wrap}
.tpp-dash{stroke-dasharray:7 9;animation:tpp-march 1.6s linear infinite}
@keyframes tpp-march{to{stroke-dashoffset:-32}}
.tpp-tail{transform-box:view-box;transform-origin:140px 150px;transition:transform .6s cubic-bezier(.3,1.6,.4,1)}
.tpp-squirrel:hover .tpp-tail{transform:rotate(-9deg)}
.tpp-squirrel .tpp-sq-head{transform-box:view-box;transform-origin:112px 96px;transition:transform .5s}
.tpp-squirrel:hover .tpp-sq-head{transform:rotate(-8deg)}

.tpp-pin{position:absolute;width:44px;height:44px;transform:translate(-50%,-50%);display:grid;place-items:center;color:var(--tpp-ink)}
.tpp-pin-dot{width:12px;height:12px;border-radius:99px;background:var(--tpp-paper);border:2px solid var(--tpp-ink);transition:background .3s,transform .3s}
.tpp-pin[aria-pressed=true] .tpp-pin-dot{background:var(--tpp-accent);border-color:var(--tpp-accent);transform:scale(1.3)}
.tpp-pin-y{position:absolute;left:50%;bottom:calc(50% + 16px);transform:translateX(-50%);white-space:nowrap;line-height:1.2;font-family:var(--tpp-serif);font-size:15px;font-weight:600;letter-spacing:.06em}
.tpp-walker{position:absolute;width:26px;height:26px;margin:-13px 0 0 -13px;border-radius:99px;border:1.5px dashed var(--tpp-accent);transition:left .9s cubic-bezier(.4,.1,.2,1),top .9s cubic-bezier(.4,.1,.2,1);pointer-events:none;animation:tpp-spin 6s linear infinite}
@keyframes tpp-spin{to{rotate:360deg}}
.tpp-progress{transition:stroke-dashoffset .9s cubic-bezier(.4,.1,.2,1)}
.tpp-stop{position:relative;width:min(520px,100%);margin-inline:auto;flex-shrink:0}
.tpp-route-map{min-height:160px}

.tpp-stamp-btn{position:relative;transition:transform .3s;opacity:.55}
.tpp-stamp-btn[aria-pressed=true]{opacity:1;transform:rotate(-4deg) scale(1.08)}
.tpp-stamp-btn:hover{opacity:1}
.tpp-input{width:100%;background:transparent;border:0;border-bottom:1px solid rgba(38,54,79,.3);padding:4px 0;font-family:var(--tpp-hand);font-size:clamp(16px,1.5cqw,20px);color:#2f4a76;outline:none}
.tpp-input::placeholder{color:rgba(47,74,118,.45)}
.tpp-msg{width:100%;height:100%;resize:none;background:transparent;border:0;outline:none;padding:0;font-family:var(--tpp-hand);font-size:clamp(16px,1.5cqw,20px);line-height:1.5em;color:#2f4a76}
.tpp-input:focus-visible,.tpp-msg:focus-visible{outline:2px solid #3a5d96;outline-offset:4px}
.tpp-msg::placeholder{color:rgba(47,74,118,.45)}
.tpp-shake{animation:tpp-shake .45s}
.tpp-shake2{animation:tpp-shake2 .45s}
@keyframes tpp-shake{20%,60%{transform:translateX(-6px)}40%,80%{transform:translateX(6px)}}
@keyframes tpp-shake2{20%,60%{transform:translateX(-6px)}40%,80%{transform:translateX(6px)}}
.tpp-postmark{position:absolute;pointer-events:none;animation:tpp-stampin .5s cubic-bezier(.2,1.6,.4,1) both}
@keyframes tpp-stampin{from{opacity:0;transform:scale(1.8) rotate(-30deg)}to{opacity:.85;transform:scale(1) rotate(-12deg)}}
.tpp-luggage{position:relative;display:inline-flex;align-items:center;gap:8px;padding:8px 16px 8px 26px;font-size:11px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;background:var(--tpp-paper);color:var(--tpp-ink);clip-path:polygon(12px 0,100% 0,100% 100%,12px 100%,0 50%);transition:transform .35s cubic-bezier(.2,.8,.2,1)}
.tpp-luggage::before{content:"";position:absolute;left:12px;top:50%;width:6px;height:6px;margin-top:-3px;border-radius:99px;background:var(--tpp-deep)}
.tpp-luggage:hover{transform:rotate(-3deg) translateY(-2px)}
.tpp-luggage:disabled{opacity:.5;cursor:default;transform:none}
.tpp-aurora{animation:tpp-aurora 14s ease-in-out infinite alternate;transform-box:view-box;transform-origin:50% 30%}
@keyframes tpp-aurora{from{transform:translateX(-30px) scaleY(.9);opacity:.55}to{transform:translateX(30px) scaleY(1.1);opacity:.85}}
.tpp-twinkle{animation:tpp-tw 3s ease-in-out infinite alternate}
@keyframes tpp-tw{from{opacity:.25}to{opacity:1}}

.tpp-wide{display:block}
.tpp-wide-i{display:inline}
.tpp-narrow{display:none}
@media (max-width:760px){
.tpp-links{display:none}
.tpp-count{display:block}
}
@media (hover:none){
.tpp-tag:hover,.tpp-note:hover,.tpp-envelope:hover,.tpp-luggage:hover{transform:none}
.tpp-envelope:hover .tpp-letter{transform:none}
.tpp-round:hover{transform:none;background:transparent;color:inherit}
}
@container tpp (max-width:760px){
.tpp-links{display:none}
.tpp-count{display:block}
.tpp-wide,.tpp-wide-i{display:none}
.tpp-narrow{display:block}
.tpp-postcard{width:min(440px,90cqw);aspect-ratio:auto;height:min(calc(var(--seam) * 100cqh - 120px),620px)}
.tpp-pc-grid{grid-template-columns:1fr;grid-template-rows:auto 1px 1fr;gap:12px}
.tpp-hw{font-size:clamp(13px,3.7cqw,17px)}
.tpp-stop{width:100%}
.tpp-note{font-size:14px}
.tpp-rail{display:none}
.tpp-hero-copy{top:42% !important}
.tpp-hero-eagle{top:9% !important;width:120px !important}
.tpp-hero-note{top:calc(9% + 84px) !important;width:150px !important}
.tpp-squirrel-wrap{top:16% !important;width:84px !important}
}
@container tpp (max-height:560px){
.tpp-hero-h{font-size:clamp(22px,min(4.4cqw,8cqh),60px)}
}
@media (prefers-reduced-motion:reduce){
.tpp-root *,.tpp-root *::before,.tpp-root *::after{animation:none !important;transition:none !important}
.tpp-flake{display:none}
}
`

/* ------------------------------------------------------------------ */
/* drawing helpers                                                    */
/* ------------------------------------------------------------------ */

const ridgeD = (pts: Pt[], bottom: number) =>
  "M" + fmt(pts[0][0]) + " " + bottom + " " + pts.map((p) => "L" + fmt(p[0]) + " " + fmt(p[1])).join(" ") + " L" + fmt(pts[pts.length - 1][0]) + " " + bottom + " Z"

const lineD = (pts: Pt[]) => pts.map((p, i) => (i ? "L" : "M") + fmt(p[0]) + " " + fmt(p[1])).join(" ")

/** A row of fir trees as one path. */
const treesD = (seed: number, x0: number, x1: number, base: number, hMin: number, hMax: number, gap: number) => {
  const r = rng(seed)
  let d = ""
  for (let x = x0; x < x1; x += gap * (0.55 + r() * 0.9)) {
    const h = hMin + r() * (hMax - hMin)
    const w = h * (0.26 + r() * 0.08)
    const tiers = 5 + Math.floor(r() * 3)
    const right: Pt[] = []
    for (let j = 1; j <= tiers; j++) {
      const ty = base - h + (h * 0.9 * j) / tiers
      const tw = w * (0.25 + (0.75 * j) / tiers) * (0.85 + r() * 0.3)
      right.push([x + tw, ty])
      if (j < tiers) right.push([x + tw * 0.38, ty - h * 0.03])
    }
    const pts: Pt[] = [[x, base - h], ...right, [x + w * 0.07, base - h * 0.1], [x + w * 0.07, base + 4], [x - w * 0.07, base + 4], [x - w * 0.07, base - h * 0.1]]
    for (let j = right.length - 1; j >= 0; j--) pts.push([2 * x - right[j][0], right[j][1]])
    d += "M" + pts.map((p) => fmt(p[0]) + " " + fmt(p[1])).join(" L") + " Z "
  }
  return d + "M" + fmt(x0) + " " + fmt(base - 4) + " H" + fmt(x1 + gap) + " V" + fmt(base + 60) + " H" + fmt(x0) + " Z"
}

const sid = (s: string) => s.replace(/[^a-zA-Z0-9_-]/g, "")

/** Paper grain: a tiny noise tile, painted once in the browser and repeated. */
function Grain({ light = false, opacity = 0.35 }: { uid?: string; light?: boolean; opacity?: number }) {
  return <div className="tpp-grain" data-light={light ? "" : undefined} aria-hidden="true" style={{ opacity }} />
}

function Snow({ seed, count = 26 }: { seed: number; count?: number }) {
  const flakes = React.useMemo(() => {
    const r = rng(seed)
    return Array.from({ length: count }, () => ({
      left: r() * 100,
      fs: 1.5 + r() * 3,
      fd: 9 + r() * 12,
      fl: -r() * 20,
      fx: (r() - 0.5) * 120,
    }))
  }, [seed, count])
  return (
    <div className="tpp-fill" aria-hidden="true" style={{ pointerEvents: "none", overflow: "clip" }}>
      {flakes.map((f, i) => (
        <span
          key={i}
          className="tpp-flake"
          style={{ left: f.left + "%", "--fs": f.fs + "px", "--fd": f.fd + "s", "--fl": f.fl + "s", "--fx": f.fx + "px" } as React.CSSProperties}
        />
      ))}
    </div>
  )
}

/* ---------- the night-blue range on the cover ---------- */

const HERO_LAYERS = [
  { seed: 11, base: 290, amp: 380, top: "#a7afbe", bot: "#7f8ca2", dp: 3, snow: 0.6, streaks: 0 },
  { seed: 23, base: 380, amp: 360, top: "#98806e", bot: "#5a6981", dp: 6, snow: 0.4, streaks: 40 },
  { seed: 37, base: 480, amp: 320, top: "#8a614a", bot: "#3d4d69", dp: 9, snow: 0.2, streaks: 70 },
  { seed: 41, base: 590, amp: 280, top: "#734e3a", bot: "#2b3b57", dp: 13, snow: 0, streaks: 80 },
  { seed: 59, base: 720, amp: 210, top: "#463f45", bot: "#1d2a43", dp: 18, snow: 0, streaks: 50 },
  { seed: 67, base: 870, amp: 140, top: "#222b3d", bot: "#111a2c", dp: 24, snow: 0, streaks: 0 },
]

const HeroMountains = React.memo(function HeroMountains({ uid }: { uid: string }) {
  const id = uid + "-hm"
  const layers = React.useMemo(
    () =>
      HERO_LAYERS.map((L) => {
        const pts = ridge(L.seed, -120, 1720, L.base, L.amp, 0.58, 7)
        const r = rng(L.seed * 7)
        const streaks: string[] = []
        for (let i = 0; i < L.streaks; i++) {
          const p = pts[Math.floor(r() * pts.length)]
          const len = 14 + r() * 70
          const dx = (r() - 0.5) * 40
          streaks.push("M" + fmt(p[0]) + " " + fmt(p[1] + 3) + " Q" + fmt(p[0] + dx * 0.3) + " " + fmt(p[1] + len * 0.5) + " " + fmt(p[0] + dx) + " " + fmt(p[1] + len))
        }
        return { ...L, d: ridgeD(pts, 1000), line: lineD(pts), streaks: streaks.join(" ") }
      }),
    [],
  )
  return (
    <div className="tpp-fill" aria-hidden="true">
      <svg className="tpp-svg tpp-fill" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id={id + "-sky"} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#4b5d7a" />
            <stop offset=".45" stopColor="#8e98a9" />
            <stop offset="1" stopColor="#b4b7bd" />
          </linearGradient>
        </defs>
        <rect width="1600" height="1000" fill={"url(#" + id + "-sky)"} />
      </svg>
      {layers.map((L, i) => (
        <div key={i} className="tpp-par tpp-fill" data-dp={L.dp}>
          <svg className="tpp-svg tpp-fill" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" style={{ overflow: "visible" }}>
            <defs>
              <linearGradient id={id + "-g" + i} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={L.top} />
                <stop offset=".55" stopColor={L.bot} />
              </linearGradient>
              <linearGradient id={id + "-m" + i} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#dfe3ea" stopOpacity="0" />
                <stop offset=".5" stopColor="#dfe3ea" stopOpacity=".28" />
                <stop offset="1" stopColor="#dfe3ea" stopOpacity="0" />
              </linearGradient>
              <clipPath id={id + "-c" + i}>
                <path d={L.d} />
              </clipPath>
            </defs>
            <path d={L.d} fill={"url(#" + id + "-g" + i + ")"} />
            {L.streaks ? <path d={L.streaks} clipPath={"url(#" + id + "-c" + i + ")"} fill="none" stroke="#1a2436" strokeOpacity=".2" strokeWidth="1.3" strokeLinecap="round" /> : null}
            {L.snow > 0 && <path d={L.line} fill="none" stroke="#f4f6f8" strokeOpacity={L.snow} strokeWidth="2.2" transform="translate(0 2)" />}
            {i < layers.length - 1 && <rect x="-200" y={L.base + 20} width="2000" height="160" fill={"url(#" + id + "-m" + i + ")"} />}
          </svg>
        </div>
      ))}
    </div>
  )
})

/* ---------- the engraved snowy peak on fog paper ---------- */

function EngravedPeak({ uid, x = 1120, y = 140, flip = false }: { uid: string; x?: number; y?: number; flip?: boolean }) {
  const id = uid + "-ep"
  const art = React.useMemo(() => {
    const r = rng(Math.round(x * 3 + y))
    const left: Pt[] = []
    const steps = 46
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      const px = 500 + (x - 500) * t
      const py = 1000 - (1000 - y) * Math.pow(t, 1.35) + (i && i < steps ? (r() - 0.5) * 26 : 0)
      left.push([px, py])
    }
    const right: Pt[] = []
    for (let i = 1; i <= steps; i++) {
      const t = i / steps
      const px = x + (1760 - x) * t
      const py = y + (560 - y) * Math.pow(t, 0.75) + (i < steps ? (r() - 0.5) * 30 : 0) - Math.sin(t * Math.PI) * 60
      right.push([px, py])
    }
    const spine: Pt[] = []
    for (let i = 0; i <= 20; i++) {
      const t = i / 20
      spine.push([x + 60 * t + Math.sin(t * 9) * 26 + (r() - 0.5) * 18, y + (1000 - y) * t])
    }
    const shape = "M500 1000 " + left.map((p) => "L" + fmt(p[0]) + " " + fmt(p[1])).join(" ") + " " + right.map((p) => "L" + fmt(p[0]) + " " + fmt(p[1])).join(" ") + " L1760 1000 Z"
    const shade = "M" + fmt(x) + " " + fmt(y) + " " + right.map((p) => "L" + fmt(p[0]) + " " + fmt(p[1])).join(" ") + " L1760 1000 " + spine.slice().reverse().map((p) => "L" + fmt(p[0]) + " " + fmt(p[1])).join(" ") + " Z"
    const rocks: { d: string; w: number; o: number }[] = []
    const all = [...left, ...right]
    for (let i = 0; i < 170; i++) {
      const onRight = r() < 0.62
      const src = onRight ? right : left
      const p = src[Math.floor(r() * src.length)]
      const len = 40 + r() * 220
      const dir = onRight ? 0.35 + r() * 0.5 : -0.35 - r() * 0.5
      const x2 = p[0] + dir * len * 0.45
      const y2 = p[1] + len
      const cx = p[0] + dir * len * 0.1 + (r() - 0.5) * 30
      rocks.push({ d: "M" + fmt(p[0]) + " " + fmt(p[1] + 6) + " Q" + fmt(cx) + " " + fmt(p[1] + len * 0.5) + " " + fmt(x2) + " " + fmt(y2), w: 1 + r() * (onRight ? 3.4 : 2), o: 0.35 + r() * 0.5 })
    }
    let hatch = ""
    for (let k = -400; k < 1400; k += 9) hatch += "M" + (x - 100) + " " + (y + k) + " l900 -330 "
    return { shape, shade, rocks, hatch, ridge: lineD(all) }
  }, [x, y])
  return (
    <svg className="tpp-svg tpp-fill" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true" style={flip ? { transform: "scaleX(-1)" } : undefined}>
      <defs>
        <clipPath id={id + "-sc"}>
          <path d={art.shade} />
        </clipPath>
        <clipPath id={id + "-mc"}>
          <path d={art.shape} />
        </clipPath>
        <linearGradient id={id + "-fog"} x1="0" y1="0" x2="0" y2="1">
          <stop offset=".55" stopColor="var(--tpp-fog)" stopOpacity="0" />
          <stop offset="1" stopColor="var(--tpp-fog)" stopOpacity=".95" />
        </linearGradient>
      </defs>
      <g>
        <path d={art.shape} fill="#f3f1ec" />
        <path d={art.shade} fill="#a7a9ad" fillOpacity=".55" />
        <path d={art.hatch} clipPath={"url(#" + id + "-sc)"} stroke="#3a414e" strokeOpacity=".22" strokeWidth=".9" />
        <g clipPath={"url(#" + id + "-mc)"}>
          {art.rocks.map((k, i) => (
            <path key={i} d={k.d} fill="none" stroke="#2c323c" strokeOpacity={k.o} strokeWidth={k.w} strokeLinecap="round" />
          ))}
        </g>
        <path d={art.ridge} fill="none" stroke="#2c323c" strokeOpacity=".55" strokeWidth="1.4" />
        <rect y="0" width="1600" height="1000" fill={"url(#" + id + "-fog)"} />
      </g>
    </svg>
  )
}

const FogPaper = React.memo(function FogPaper({ uid, peak = true, forest = false, seed = 5 }: { uid: string; peak?: boolean; forest?: boolean; seed?: number }) {
  const id = uid + "-fp" + seed
  const far = React.useMemo(
    () => [
      ridgeD(ridge(seed * 13, -100, 1700, 520, 160, 0.5, 6), 1000),
      ridgeD(ridge(seed * 17, -100, 1700, 640, 140, 0.5, 6), 1000),
      treesD(seed * 19, -40, 620, 1010, 120, 300, 30),
      treesD(seed * 23, 1180, 1640, 1010, 90, 220, 34),
    ],
    [seed],
  )
  return (
    <div className="tpp-fill" aria-hidden="true" style={{ background: "linear-gradient(180deg, color-mix(in oklab, var(--tpp-fog) 82%, #fff) 0%, var(--tpp-fog) 70%)" }}>
      <svg className="tpp-svg tpp-fill" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#9d9a92" stopOpacity=".55" />
            <stop offset=".6" stopColor="#9d9a92" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g>
          <path d={far[0]} fill={"url(#" + id + ")"} />
          <path d={far[1]} fill={"url(#" + id + ")"} opacity=".8" />
          {forest && <path d={far[2]} fill="#8d8a84" opacity=".35" />}
          {forest && <path d={far[3]} fill="#8d8a84" opacity=".28" />}
        </g>
      </svg>
      {peak && <EngravedPeak uid={uid + seed} />}
      <Grain uid={uid} opacity={0.5} />
    </div>
  )
})

const NightPaper = React.memo(function NightPaper({ uid, seed = 3, trees = true, flakes = true }: { uid: string; seed?: number; trees?: boolean; flakes?: boolean }) {
  const id = uid + "-np" + seed
  const rows = React.useMemo(
    () => [treesD(seed * 31, -40, 1640, 1000, 120, 260, 34), treesD(seed * 37, -40, 1640, 1010, 180, 380, 40)],
    [seed],
  )
  return (
    <div className="tpp-fill" aria-hidden="true" style={{ background: "radial-gradient(120% 80% at 50% 0%, color-mix(in oklab, var(--tpp-navy) 85%, #fff) 0%, var(--tpp-navy) 45%, var(--tpp-deep) 100%)" }}>
      {trees && (
        <svg className="tpp-svg tpp-fill" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMax slice">
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--tpp-navy)" stopOpacity="0" />
              <stop offset="1" stopColor="var(--tpp-deep)" stopOpacity=".9" />
            </linearGradient>
          </defs>
          <g>
            <path d={rows[0]} fill="color-mix(in oklab, var(--tpp-navy) 70%, #000)" opacity=".55" />
          </g>
          <rect y="700" width="1600" height="300" fill={"url(#" + id + ")"} />
          <g>
            <path d={rows[1]} fill="var(--tpp-deep)" />
          </g>
        </svg>
      )}
      <Grain uid={uid} light opacity={0.22} />
      {flakes && <Snow seed={seed * 101} />}
    </div>
  )
})

/* ---------- creatures and props ---------- */

function Eagle({ uid }: { uid: string }) {
  const id = uid + "-eg"
  return (
    <svg className="tpp-svg tpp-eagle" viewBox="0 0 260 200" width="100%" height="100%" aria-hidden="true">
      <defs>
        <linearGradient id={id + "-w"} x1="0" y1="1" x2=".3" y2="0">
          <stop offset="0" stopColor="#6e4c33" />
          <stop offset=".6" stopColor="#3d2a1d" />
          <stop offset="1" stopColor="#21160f" />
        </linearGradient>
        <linearGradient id={id + "-b"} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5a3d29" />
          <stop offset="1" stopColor="#2c1e14" />
        </linearGradient>
      </defs>
      <g className="tpp-wing tpp-wing-b">
        <path d="M142 96 C152 66 170 36 204 10 L214 6 L209 17 L222 12 L213 25 L228 22 L215 35 L230 37 L214 46 L226 52 L208 56 C192 70 176 86 160 102 Z" fill="#2a1c13" />
        <path d="M150 92 C162 70 178 50 200 32 M156 96 C170 80 186 64 206 50" stroke="#7a5a40" strokeOpacity=".5" fill="none" strokeWidth="1.2" />
      </g>
      <path d="M166 110 L214 112 L222 120 L216 128 L222 134 L210 138 L168 128 Z" fill="#efe9dc" />
      <path d="M180 116 L214 118 M178 124 L212 132" stroke="#b9b0a0" strokeWidth="1" />
      <path d="M96 96 C112 84 152 88 174 106 C180 118 170 128 150 130 C126 132 104 122 94 108 Z" fill={"url(#" + id + "-b)"} />
      <path d="M138 126 L144 146 L152 144 L147 126 Z M126 124 L128 142 L135 142 L134 124 Z" fill="#d9a441" />
      <path d="M142 146 l-4 4 M146 146 l0 5 M150 145 l4 4 M128 142 l-4 4 M132 142 l0 5" stroke="#3b2a16" strokeWidth="1.6" strokeLinecap="round" />
      <g className="tpp-wing">
        <path d="M124 98 C110 62 86 32 50 10 L40 6 L46 18 L32 15 L42 27 L27 28 L41 37 L28 42 L44 48 L34 56 L54 56 C76 70 96 88 114 106 Z" fill={"url(#" + id + "-w)"} />
        <path d="M116 92 C100 70 82 52 58 34 M110 98 C92 82 74 70 52 58 M120 86 C108 64 92 44 72 26" stroke="#9a7756" strokeOpacity=".45" fill="none" strokeWidth="1.2" />
      </g>
      <path d="M100 98 C92 86 78 82 68 88 C60 92 62 102 72 104 C82 108 94 106 102 104 Z" fill="#f2ede2" />
      <path d="M86 102 C92 104 98 104 102 102" stroke="#cfc6b4" fill="none" />
      <path d="M68 88 C58 88 52 96 56 104 C58 99 62 97 67 99 Z" fill="#e0a83c" />
      <circle cx="76" cy="92" r="1.8" fill="#1a120c" />
    </svg>
  )
}

function Squirrel({ uid }: { uid: string }) {
  const id = uid + "-sq"
  const needles = React.useMemo(() => {
    const r = rng(77)
    let d = ""
    for (let i = 0; i < 46; i++) {
      const t = i / 46
      const x = 150 + t * 70
      const y = 152 - t * 10
      const a = (r() < 0.5 ? -1 : 1) * (0.5 + r() * 0.7) - 0.3
      const l = 16 + r() * 16
      d += "M" + fmt(x) + " " + fmt(y) + " l" + fmt(Math.cos(a) * l) + " " + fmt(Math.sin(a) * l) + " "
    }
    return d
  }, [])
  return (
    <svg className="tpp-svg tpp-squirrel" viewBox="0 0 220 200" width="100%" height="100%" aria-hidden="true" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={id + "-t"} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#c47a48" />
          <stop offset="1" stopColor="#7c3f1f" />
        </linearGradient>
      </defs>
      <path d="M-30 170 C40 160 110 168 230 146" stroke="#4a3426" strokeWidth="9" strokeLinecap="round" fill="none" />
      <path d="M60 165 C70 186 66 196 58 210" stroke="#4a3426" strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d={needles} stroke="#35523f" strokeWidth="2.2" strokeLinecap="round" />
      <path className="tpp-tail" d="M140 152 C196 146 214 96 198 58 C186 30 154 22 140 42 C128 60 146 72 158 62 C172 52 178 76 168 96 C156 120 132 126 126 148 Z" fill={"url(#" + id + "-t)"} />
      <path className="tpp-tail" d="M150 136 C176 120 190 92 182 66 M160 140 C184 128 198 104 194 76" stroke="#e2b98f" strokeOpacity=".5" fill="none" strokeWidth="1.5" />
      <path d="M96 156 C84 124 96 94 118 88 C142 82 156 106 152 132 C150 148 140 158 122 160 C108 162 98 160 96 156 Z" fill="#a95f37" />
      <path d="M102 146 C98 124 106 108 118 106 C122 122 118 142 110 152 Z" fill="#ead6b6" />
      <ellipse cx="95" cy="116" rx="7" ry="8" fill="#6b4022" />
      <path d="M92 110 C94 106 100 106 101 110" stroke="#3a2412" fill="none" strokeWidth="1.5" />
      <path d="M100 120 C104 116 110 118 108 124" stroke="#a95f37" strokeWidth="5" strokeLinecap="round" fill="none" />
      <g className="tpp-sq-head">
        <path d="M90 94 C82 76 94 60 112 62 C126 64 132 78 126 92 C120 102 100 106 90 94 Z" fill="#a95f37" />
        <path d="M110 64 L116 40 L124 64 Z" fill="#8b4a27" />
        <path d="M116 40 l-3 -8 M116 40 l3 -9 M116 40 l0 -10" stroke="#5a2f17" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="104" cy="78" r="3.4" fill="#1a110a" />
        <circle cx="105.2" cy="76.8" r="1" fill="#fff" />
        <circle cx="88" cy="88" r="2.2" fill="#2a1a10" />
        <path d="M92 94 C96 98 102 98 106 96" stroke="#ead6b6" fill="none" strokeWidth="1.5" />
      </g>
      <path d="M110 160 C112 166 122 166 126 160" fill="#7c3f1f" />
    </svg>
  )
}

function PineBranch({ seed = 9 }: { seed?: number }) {
  const art = React.useMemo(() => {
    const r = rng(seed)
    const twigs: [Pt, Pt, Pt, Pt][] = [
      [[-10, 30], [80, 50], [160, 70], [310, 150]],
      [[120, 62], [150, 40], [180, 30], [215, 22]],
      [[200, 108], [222, 126], [238, 150], [248, 188]],
      [[60, 45], [70, 80], [62, 110], [48, 140]],
    ]
    const colors = ["#2c4637", "#37583f", "#22382c", "#466a52", "#2f4c3a"]
    const needles: { d: string; c: string }[] = colors.map((c) => ({ d: "", c }))
    for (const [a, b, c, e] of twigs) {
      for (let k = 0; k <= 34; k++) {
        const t = k / 34
        const u = 1 - t
        const x = u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * e[0]
        const y = u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * e[1]
        const tx = 3 * u * u * (b[0] - a[0]) + 6 * u * t * (c[0] - b[0]) + 3 * t * t * (e[0] - c[0])
        const ty = 3 * u * u * (b[1] - a[1]) + 6 * u * t * (c[1] - b[1]) + 3 * t * t * (e[1] - c[1])
        const base = Math.atan2(ty, tx)
        for (const side of [-1, 1]) {
          for (let m = 0; m < 2; m++) {
            const ang = base + side * (0.55 + r() * 0.6)
            const l = 18 + r() * 18
            const bucket = needles[Math.floor(r() * needles.length)]
            bucket.d += "M" + fmt(x) + " " + fmt(y) + " l" + fmt(Math.cos(ang) * l) + " " + fmt(Math.sin(ang) * l) + " "
          }
        }
      }
    }
    return { twigs: twigs.map(([a, b, c, e]) => "M" + a.join(" ") + " C" + b.join(" ") + " " + c.join(" ") + " " + e.join(" ")), needles }
  }, [seed])
  const cone = (cx: number, cy: number, rot: number) => (
    <g transform={"translate(" + cx + " " + cy + ") rotate(" + rot + ")"}>
      <ellipse rx="13" ry="22" fill="#8a5a34" />
      {[-14, -6, 2, 10].map((y) => (
        <path key={y} d={"M-12 " + y + " Q0 " + (y + 7) + " 12 " + y} stroke="#5b3a1f" strokeWidth="1.6" fill="none" />
      ))}
      <path d="M0 -22 L0 22" stroke="#5b3a1f" strokeWidth="1" opacity=".6" />
    </g>
  )
  return (
    <svg className="tpp-svg" viewBox="-20 0 340 230" width="100%" height="100%" aria-hidden="true" style={{ overflow: "visible" }}>
      {art.twigs.map((d, i) => (
        <path key={i} d={d} stroke="#4a3426" strokeWidth={i ? 3.5 : 6} strokeLinecap="round" fill="none" />
      ))}
      {art.needles.map((n, i) => (
        <path key={i} d={n.d} stroke={n.c} strokeWidth="2.3" strokeLinecap="round" />
      ))}
      {cone(214, 128, -18)}
      {cone(240, 150, 12)}
      {cone(96, 92, 8)}
    </svg>
  )
}

/* ---------- photographs (generated) ---------- */

function Scene({ kind = "dawn", seed = 1 }: { kind?: SceneKind; seed?: number }) {
  const id = sid(React.useId()) + "-sc"
  const art = React.useMemo(() => {
    const W = 400
    const r1 = ridgeD(ridge(seed * 11 + 1, -20, 420, 150, 90, 0.55, 6), 300)
    const r2 = ridgeD(ridge(seed * 11 + 2, -20, 420, 190, 80, 0.55, 6), 300)
    const r3 = ridgeD(ridge(seed * 11 + 3, -20, 420, 230, 60, 0.5, 6), 300)
    const t1 = treesD(seed * 5 + 1, -10, W + 10, 300, 50, 120, 20)
    const t2 = treesD(seed * 5 + 2, -10, W + 10, 230, 26, 56, 14)
    const r = rng(seed * 3)
    const stars = Array.from({ length: 40 }, () => [r() * 400, r() * 150, 0.4 + r() * 1.1])
    return { r1, r2, r3, t1, t2, stars }
  }, [seed])
  const g = (n: string) => "url(#" + id + n + ")"
  const sky = (stops: [number, string][]) => (
    <linearGradient id={id + "s"} x1="0" y1="0" x2="0" y2="1">
      {stops.map(([o, c]) => (
        <stop key={o} offset={o} stopColor={c} />
      ))}
    </linearGradient>
  )
  let body: React.ReactNode = null
  let defs: React.ReactNode = null
  if (kind === "dawn") {
    defs = sky([[0, "#7d86a8"], [0.45, "#e9b7a6"], [0.75, "#f4d6b8"]])
    body = (
      <>
        <path d={art.r1} fill="#8e7f9c" />
        <path d={art.r2} fill="#5f6488" />
        <rect y="200" width="400" height="40" fill="#f3e2d0" opacity=".35" />
        <path d={art.r3} fill="#3c4466" />
        <path d={art.t1} fill="#262c45" />
      </>
    )
  } else if (kind === "lake") {
    defs = sky([[0, "#b8cbe0"], [0.6, "#e9eef3"], [1, "#ffffff"]])
    body = (
      <>
        <path d={art.r1} fill="#c9d3df" />
        <path d={art.t2} fill="#4a5a6e" />
        <rect y="228" width="400" height="80" fill="#f4f7fa" />
        <ellipse cx="200" cy="262" rx="230" ry="26" fill="#a9c5dc" />
        <path d="M60 262 l40 -6 l30 10 M220 255 l50 8 l40 -5 M150 270 l30 -4" stroke="#e8f1f8" strokeWidth="1.5" fill="none" />
        {[120, 160, 200, 250, 290].map((x, i) => (
          <g key={x} transform={"translate(" + x + " " + (258 + (i % 2) * 6) + ")"}>
            <ellipse rx="7" ry="3.2" fill="#fff" />
            <path d="M4 -1 q3 -8 6 -9" stroke="#fff" strokeWidth="2" fill="none" />
          </g>
        ))}
      </>
    )
  } else if (kind === "sun") {
    defs = (
      <>
        {sky([[0, "#c8a77a"], [0.5, "#f1d39c"], [1, "#e9c58c"]])}
        <radialGradient id={id + "sun"}>
          <stop offset="0" stopColor="#fff8e2" />
          <stop offset=".25" stopColor="#ffe9b0" stopOpacity=".9" />
          <stop offset="1" stopColor="#ffe9b0" stopOpacity="0" />
        </radialGradient>
      </>
    )
    body = (
      <>
        <circle cx="210" cy="150" r="120" fill={g("sun")} />
        <path d={art.t2} fill="#9c7a55" opacity=".55" />
        <rect y="228" width="400" height="80" fill="#e4c38f" />
        <ellipse cx="210" cy="250" rx="60" ry="8" fill="#fff4d6" opacity=".7" />
        <path d={art.t1} fill="#6b5137" opacity=".7" />
      </>
    )
  } else if (kind === "forest") {
    defs = sky([[0, "#c5ccd6"], [1, "#eef1f4"]])
    body = (
      <>
        <path d={art.t2} fill="#8d99a8" />
        <path d={art.t1} fill="#33433f" />
        <path d={art.t1} fill="none" stroke="#fff" strokeOpacity=".75" strokeWidth="1.4" strokeDasharray="3 9" />
        <rect y="290" width="400" height="10" fill="#f5f7f9" />
      </>
    )
  } else if (kind === "peak") {
    defs = sky([[0, "#4f7fb8"], [1, "#b8d0ea"]])
    body = (
      <>
        <path d="M60 300 L200 60 L250 120 L280 95 L380 300 Z" fill="#f6f8fb" />
        <path d="M200 60 L215 300 L380 300 L280 95 L250 120 Z" fill="#b6c3d4" />
        <path d="M200 60 L188 120 M200 60 L230 150 M250 120 L262 190 M280 95 L300 170" stroke="#57667a" strokeWidth="2.4" strokeLinecap="round" opacity=".6" />
        <path d={art.r3} fill="#e9eef4" />
        <path d={art.t1} fill="#2e3e52" opacity=".9" />
      </>
    )
  } else if (kind === "river") {
    defs = sky([[0, "#a7b6c6"], [1, "#e2d6c2"]])
    body = (
      <>
        <path d={art.r1} fill="#8c7a6a" />
        <path d={art.r2} fill="#a0623c" />
        <path d={art.r3} fill="#6c4a34" />
        <path d="M150 300 C190 270 170 250 210 232 C240 220 230 210 260 204" stroke="#c9dbe8" strokeWidth="10" fill="none" strokeLinecap="round" />
      </>
    )
  } else {
    defs = (
      <>
        {sky([[0, "#0f1830"], [1, "#2a3b5c"]])}
        <linearGradient id={id + "au"} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7cf0c4" stopOpacity="0" />
          <stop offset=".6" stopColor="#7cf0c4" stopOpacity=".55" />
          <stop offset="1" stopColor="#7cf0c4" stopOpacity="0" />
        </linearGradient>
      </>
    )
    body = (
      <>
        {art.stars.map(([x, y, s], i) => (
          <circle key={i} cx={x} cy={y} r={s} fill="#fff" opacity=".8" />
        ))}
        <path d="M-20 120 C80 40 180 140 260 70 C320 20 380 80 420 50 L420 150 C360 170 300 120 240 160 C160 210 80 120 -20 190 Z" fill={g("au")} />
        <path d={art.r2} fill="#1d2a45" />
        <path d={art.t1} fill="#0c1426" />
      </>
    )
  }
  return (
    <svg className="tpp-svg tpp-fill" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>{defs}</defs>
      <rect width="400" height="300" fill={g("s")} />
      {body}
    </svg>
  )
}

function Photo({ src, kind, seed, alt }: { src?: string; kind?: SceneKind; seed?: number; alt?: string }) {
  return (
    <div className="relative overflow-clip" style={{ position: "absolute", inset: 0 }}>
      {src ? (
        <img src={src} alt={alt || ""} className="tpp-fill" style={{ objectFit: "cover", maxWidth: "none" }} draggable={false} />
      ) : (
        <Scene kind={kind} seed={seed} />
      )}
    </div>
  )
}

function SnapshotGallery({ photos, active }: { photos: NonNullable<PostcardAbout["snapshots"]>; active: boolean }) {
  const [index, setIndex] = React.useState(0)
  const [animate, setAnimate] = React.useState(false)
  const [automatic, setAutomatic] = React.useState(false)
  const gallery = React.useRef<HTMLButtonElement>(null)
  const description = React.useId()
  const current = wrap(index, photos.length)
  React.useEffect(() => {
    if (!active || photos.length < 2) return
    const timer = window.setInterval(() => {
      const button = gallery.current
      if (!button || document.hidden || button.closest("[inert]") || button.matches(":focus-within") || (matchMedia("(hover:hover)").matches && button.matches(":hover"))) return
      setAutomatic(true)
      setAnimate(true)
      setIndex(i => wrap(i + 1, photos.length))
    }, 3000)
    return () => window.clearInterval(timer)
  }, [active, index, photos.length])
  return (
    <button ref={gallery} type="button" className="tpp-mini-gallery" data-animate={animate ? "" : undefined} aria-label="Next personal photo" aria-describedby={description}
      onClick={event => { setAutomatic(false); setAnimate(event.detail > 0); setIndex(i => wrap(i + 1, photos.length)) }}
      onKeyDown={event => {
        if (event.altKey || event.ctrlKey || event.metaKey || (event.key !== "ArrowLeft" && event.key !== "ArrowRight")) return
        event.preventDefault()
        setAutomatic(false)
        setAnimate(false)
        setIndex(i => wrap(i + (event.key === "ArrowRight" ? 1 : -1), photos.length))
      }}>
      <span className="tpp-gallery-image">
        {photos.map((photo, i) => <img key={photo.src} src={photo.src} alt={i === current ? photo.alt : ""} aria-hidden={i !== current} data-current={i === current ? "" : undefined} draggable={false} />)}
      </span>
      <span className="tpp-gallery-caption" aria-hidden="true"><span>{current + 1} / {photos.length}</span><span>Next photo ↗</span></span>
      <span id={description} className="sr-only" aria-live={automatic ? "off" : "polite"}>{photos[current].alt}. Photo {current + 1} of {photos.length}.</span>
    </button>
  )
}

function Avatar() {
  return (
    <svg className="tpp-svg tpp-fill" viewBox="0 0 80 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="80" height="100" fill="#cfdceb" />
      <path d="M0 70 C20 62 50 66 80 60 L80 100 L0 100 Z" fill="#f5f8fb" />
      <path d="M0 58 l10 -18 l8 12 l10 -22 l12 20 l8 -10 l10 16 l10 -12 l12 18 L80 70 L0 70 Z" fill="#7b8ba0" opacity=".6" />
      <path d="M22 100 C22 78 30 66 40 66 C50 66 58 78 58 100 Z" fill="#c2392f" />
      <path d="M40 66 L40 100" stroke="#8f2219" strokeWidth="1.2" />
      <path d="M56 80 C62 72 64 62 62 54" stroke="#c2392f" strokeWidth="7" strokeLinecap="round" fill="none" />
      <circle cx="62" cy="52" r="3.5" fill="#e8c1a0" />
      <circle cx="40" cy="54" r="10" fill="#e8c1a0" />
      <path d="M30 52 C30 40 50 40 50 52 C46 47 34 47 30 52 Z" fill="#2e3e5c" />
      <circle cx="40" cy="40" r="3" fill="#f2efe7" />
      <path d="M31 54 C30 64 34 70 36 72 M49 54 C50 64 46 70 44 72" stroke="#6a4630" strokeWidth="2.5" fill="none" />
      <circle cx="36.5" cy="55" r="1" fill="#2a1d14" />
      <circle cx="43.5" cy="55" r="1" fill="#2a1d14" />
      <path d="M37 59 Q40 61 43 59" stroke="#a5523e" strokeWidth="1" fill="none" />
    </svg>
  )
}

/** A perforated stamp. */
function Stamp({ children, w = 70, h = 86, color = "#f7f3ea", label }: { children: React.ReactNode; w?: number; h?: number; color?: string; label?: string }) {
  const m = sid(React.useId())
  const holes: React.ReactNode[] = []
  const step = 7
  for (let x = step / 2; x < w; x += step) holes.push(<circle key={"t" + x} cx={x} cy={0} r={2.4} />, <circle key={"b" + x} cx={x} cy={h} r={2.4} />)
  for (let y = step / 2; y < h; y += step) holes.push(<circle key={"l" + y} cx={0} cy={y} r={2.4} />, <circle key={"r" + y} cx={w} cy={y} r={2.4} />)
  return (
    <div style={{ position: "relative", width: w, height: h, filter: "drop-shadow(0 2px 3px rgba(0,0,0,.25))" }}>
      <svg className="tpp-svg" width={w} height={h} viewBox={"0 0 " + w + " " + h} style={{ position: "absolute", inset: 0 }} aria-hidden="true">
        <defs>
          <mask id={m}>
            <rect width={w} height={h} fill="#fff" />
            <g fill="#000">{holes}</g>
          </mask>
        </defs>
        <rect width={w} height={h} fill={color} mask={"url(#" + m + ")"} />
      </svg>
      <div style={{ position: "absolute", inset: 6, overflow: "clip" }}>{children}</div>
      {label && (
        <span className="tpp-serif" style={{ position: "absolute", left: 8, bottom: 7, fontSize: 9, fontWeight: 700, letterSpacing: ".1em", color: "#fff", textShadow: "0 1px 2px rgba(0,0,0,.4)" }}>
          {label}
        </span>
      )}
    </div>
  )
}

function Logo({ mark, since }: { mark: string; since: string }) {
  return (
    <svg className="tpp-svg" width="46" height="54" viewBox="0 0 46 54" aria-hidden="true">
      <rect x="1" y="1" width="44" height="52" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <rect x="4" y="4" width="38" height="30" fill="none" stroke="currentColor" strokeWidth=".7" />
      <path d="M7 31 L16 17 L21 24 L27 13 L39 31 Z" fill="currentColor" opacity=".85" />
      <path d="M27 13 L24 18 L27 17 L30 19 Z M16 17 L14 21 L17 20 Z" fill="#fff" opacity=".9" />
      <text x="23" y="44" textAnchor="middle" fontSize="8" fontWeight="700" letterSpacing="1.5" fill="currentColor" fontFamily="Georgia,serif">
        {mark}
      </text>
      <text x="23" y="50.5" textAnchor="middle" fontSize="4.2" letterSpacing=".8" fill="currentColor" fontFamily="Georgia,serif">
        {"EST. " + since}
      </text>
    </svg>
  )
}

function Postmark({ text, date }: { text: string; date: string }) {
  const m = sid(React.useId())
  return (
    <svg className="tpp-svg" width="120" height="78" viewBox="0 0 120 78" aria-hidden="true" style={{ color: "#3b4f7a" }}>
      <defs>
        <path id={m} d="M14 39 a25 25 0 1 1 50 0 a25 25 0 1 1 -50 0" />
      </defs>
      <circle cx="39" cy="39" r="31" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="39" cy="39" r="20" fill="none" stroke="currentColor" strokeWidth="1" />
      <text fontSize="7.5" letterSpacing="2" fill="currentColor" fontFamily="Georgia,serif" fontWeight="700">
        <textPath href={"#" + m}>{text}</textPath>
      </text>
      <text x="39" y="42" textAnchor="middle" fontSize="7" fill="currentColor" fontFamily="Georgia,serif" fontWeight="700">
        {date}
      </text>
      {[30, 39, 48].map((y) => (
        <path key={y} d={"M72 " + y + " q8 -5 16 0 t16 0 t16 0"} fill="none" stroke="currentColor" strokeWidth="1.4" />
      ))}
    </svg>
  )
}

function Compass() {
  return (
    <svg className="tpp-svg" width="64" height="64" viewBox="-32 -32 64 64" aria-hidden="true">
      <circle r="27" fill="none" stroke="currentColor" strokeWidth=".8" />
      <circle r="22" fill="none" stroke="currentColor" strokeWidth=".5" strokeDasharray="1 3" />
      <path d="M0 -26 L5 0 L0 26 L-5 0 Z" fill="currentColor" opacity=".25" />
      <path d="M0 -26 L5 0 L-5 0 Z" fill="currentColor" />
      <path d="M-26 0 L0 4 L26 0 L0 -4 Z" fill="currentColor" opacity=".35" />
      <text y="-29" textAnchor="middle" fontSize="7" fontFamily="Georgia,serif" fill="currentColor" style={{ fontWeight: 700 }}>
        N
      </text>
    </svg>
  )
}

function Contours({ seed = 4 }: { seed?: number }) {
  const art = React.useMemo(() => {
    const r = rng(seed)
    const centers: Pt[] = [
      [260, 300],
      [1180, 220],
      [820, 760],
    ]
    const lines: { d: string; major: boolean }[] = []
    for (const [cx, cy] of centers) {
      const ph = [r() * 6.28, r() * 6.28, r() * 6.28]
      for (let k = 1; k <= 11; k++) {
        const rad = k * 34
        const pts: Pt[] = []
        for (let a = 0; a < 64; a++) {
          const t = (a / 64) * Math.PI * 2
          const wob = 1 + 0.16 * Math.sin(t * 2 + ph[0]) + 0.08 * Math.sin(t * 3 + ph[1] + k * 0.2) + 0.05 * Math.sin(t * 5 + ph[2])
          pts.push([cx + Math.cos(t) * rad * wob * 1.25, cy + Math.sin(t) * rad * wob])
        }
        lines.push({ d: lineD(pts) + " Z", major: k % 4 === 0 })
      }
    }
    return lines
  }, [seed])
  return (
    <svg className="tpp-svg tpp-fill" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {Array.from({ length: 9 }, (_, i) => (
        <path key={"g" + i} d={"M" + (i + 1) * 160 + " 0 V1000 M0 " + (i + 1) * 110 + " H1600"} stroke="var(--tpp-ink)" strokeOpacity=".07" />
      ))}
      {art.map((l, i) => (
        <path key={i} d={l.d} fill="none" stroke="#7a6a52" strokeOpacity={l.major ? 0.38 : 0.18} strokeWidth={l.major ? 1.6 : 1} />
      ))}
      <path d="M-20 640 C200 600 300 700 520 660 C700 630 760 520 980 560 C1180 600 1300 470 1640 520" fill="none" stroke="#8fb0c9" strokeWidth="5" strokeOpacity=".55" strokeLinecap="round" />
      <path d="M1320 760 C1380 700 1500 720 1520 780 C1540 850 1420 880 1360 850 C1310 826 1290 800 1320 760 Z" fill="#a9c5dc" fillOpacity=".45" stroke="#8fb0c9" />
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* the tearing chapter                                                */
/* ------------------------------------------------------------------ */

type ChapterProps = {
  index: number
  seam: number
  seed: number
  label: string
  last?: boolean
  setRef: (i: number, el: HTMLDivElement | null) => void
  uid: string
  upperBg: React.ReactNode
  upper: React.ReactNode
  lowerBg?: React.ReactNode
  lower?: React.ReactNode
}

function Chapter({ index, seam, seed, label, last, setRef, uid, upperBg, upper, lowerBg, lower }: ChapterProps) {
  const clips = React.useMemo(() => {
    const n = 84
    const edge = tornEdge(seed, n, 16)
    const up = fiberDepth(seed + 1, n, 6, 22)
    const lo = fiberDepth(seed + 2, n, 4, 16)
    return {
      upper: upperClip(edge, seam),
      upperFib: upperClip(edge, seam, up),
      upperShade: upperClip(edge, seam, up.map((v) => v + 7)),
      lower: lowerClip(edge, seam),
      lowerFib: lowerClip(edge, seam, lo),
      lowerShade: lowerClip(edge, seam, lo.map((v) => v + 5)),
    }
  }, [seed, seam])
  return (
    <div
      ref={(el) => setRef(index, el)}
      className="tpp-ch"
      data-on={index === 0 ? "" : undefined}
      data-seam={last ? 1 : seam}
      role="region"
      aria-label={label}
      style={{ "--seam": last ? 1 : seam, zIndex: 10 - index } as React.CSSProperties}
    >
      <div className="tpp-in">
        {!last && (
          <div className="tpp-lo">
            <div className="tpp-shade" style={{ clipPath: clips.lowerShade }} />
            <div className="tpp-fib" style={{ clipPath: clips.lowerFib }}>
              <Grain uid={uid} opacity={0.4} />
            </div>
            <div className="tpp-sh" style={{ clipPath: clips.lower }}>
              <div className="tpp-box">
                {lowerBg}
                <div className="tpp-lb">{lower}</div>
              </div>
              <div className="tpp-light" />
            </div>
          </div>
        )}
        <div className="tpp-up">
          {!last && <div className="tpp-shade" style={{ clipPath: clips.upperShade }} />}
          {!last && (
            <div className="tpp-fib" style={{ clipPath: clips.upperFib }}>
              <Grain uid={uid} opacity={0.4} />
            </div>
          )}
          <div className="tpp-sh" style={last ? undefined : { clipPath: clips.upper }}>
            <div className="tpp-box">
              {upperBg}
              <div className="tpp-ub">{upper}</div>
            </div>
            {!last && <div className="tpp-light" />}
          </div>
        </div>
      </div>
    </div>
  )
}

/** Pops in (staggered by `d`) as its chapter grows out of the tear. */
function Pop({ d = 0, r = 0, className = "", style, children }: { d?: number; r?: number; className?: string; style?: React.CSSProperties; children: React.ReactNode }) {
  return (
    <div className={"tpp-pop " + className} data-d={d} data-r={r} style={style}>
      {children}
    </div>
  )
}

/**
 * Writes one chapter's tear straight onto its layers: the top sheet lifts by
 * `s`, the bottom one drops, and with `p` < 1 the chapter is still growing out
 * of the gap with its pieces landing in turn. Cache the layers once and avoid
 * touching pieces that have already landed; no layout reads in the frame loop.
 */
function createPainter(el: HTMLElement) {
  const seam = Number(el.dataset.seam) || 1
  const inn = el.firstElementChild as HTMLElement | null
  if (!inn) return () => undefined
  const lo = inn.querySelector(":scope > .tpp-lo") as HTMLElement | null
  const up = inn.querySelector(":scope > .tpp-up") as HTMLElement | null
  const lights = Array.from(inn.querySelectorAll<HTMLElement>(".tpp-light"))
  const pops = Array.from(el.querySelectorAll<HTMLElement>(".tpp-pop"), pop => ({ pop, d: Number(pop.dataset.d) || 0, r: Number(pop.dataset.r) || 0, q: -1 }))
  let lastS = -1
  let lastP = -1
  let lastH = -1
  return (s: number, p: number, H: number) => {
    if (s !== lastS || H !== lastH) {
      lastS = s
      lastH = H
      const bend = Math.sin(s * Math.PI)
      if (up) up.style.transform = s > 0 ? `translate3d(0,${fmt(-s * (seam * (H + 80) + 70))}px,${fmt(bend * 24)}px) rotateX(${fmt(-bend * 12)}deg) rotate(${-1.4 * s}deg)` : ""
      if (lo) lo.style.transform = s > 0 ? `translate3d(0,${fmt(s * ((1 - seam) * (H + 80) + 80))}px,${fmt(bend * 12)}px) rotateX(${fmt(bend * 9)}deg) rotate(${s}deg)` : ""
      lights.forEach(light => { light.style.opacity = (bend * .65).toFixed(3) })
    }
    if (p === lastP) return
    lastP = p
    inn.style.transform = p < 1 ? "translateY(" + fmt((1 - p) * 3) + "%)" : ""
    pops.forEach(piece => {
      const { pop, d, r } = piece
      const q = clamp((p - d) * 2.6, 0, 1)
      if (q === piece.q) return
      piece.q = q
      if (q >= 1) {
        pop.style.opacity = ""
        pop.style.transform = ""
      } else {
        pop.style.opacity = q.toFixed(3)
        pop.style.transform = "translateY(" + fmt((1 - q) * 46) + "px) rotate(" + fmt((1 - q) * r) + "deg) scale(" + (0.94 + 0.06 * q).toFixed(3) + ")"
      }
    })
  }
}

/* ------------------------------------------------------------------ */
/* the template                                                       */
/* ------------------------------------------------------------------ */

export default function TornPostcardPortfolio({
  name = "Kedhareswer",
  role = "Product designer & front-end developer",
  location = "Hyderabad, India",
  since = "2019",
  headline = ["How to build things", "that feel like home?"],
  intro = "Calm, careful products for people who would rather be outside.",
  note,
  about = DEFAULT_ABOUT,
  projects = DEFAULT_PROJECTS,
  route = DEFAULT_ROUTE,
  email = "hello@example.com",
  links = DEFAULT_LINKS,
  labels = ["Cover", "About", "Work", "Route", "Write"],
  workTitle = "Work — field notes",
  routeTitle = "The route so far",
  contactTitle = "Write me a postcard",
  palette,
  scrollPerChapter = 1.4,
  smooth = true,
  snap = true,
  animateIn = true,
  snow = true,
  height = "100svh",
  className = "",
}: TornPostcardPortfolioProps) {
  const uid = sid(React.useId())
  const pal = {
    navy: "#24375a",
    deep: "#14213a",
    fog: "#d5d0c3",
    paper: "#f2ede2",
    ink: "#26364f",
    accent: "#b4673d",
    tape: "#a9c1d6",
    ...palette,
  }
  const ab = { ...DEFAULT_ABOUT, ...about }
  const list = projects.length ? projects : DEFAULT_PROJECTS
  const stops = route.length ? route : DEFAULT_ROUTE
  const mark = initials(name)

  const rootRef = React.useRef(null as HTMLDivElement | null)
  const musicRef = React.useRef<{ start: () => void }>(null)
  const [entry, setEntry] = React.useState<"sealed" | "opening" | "entered">("sealed")
  const trackRef = React.useRef(null as HTMLDivElement | null)
  const stageRef = React.useRef(null as HTMLDivElement | null)
  const chRefs = React.useRef([] as (HTMLDivElement | null)[])
  const setRef = React.useCallback((i: number, el: HTMLDivElement | null) => {
    chRefs.current[i] = el
  }, [])

  const [active, setActive] = React.useState(0)
  const [reduced, setReduced] = React.useState(false)
  const [compact, setCompact] = React.useState(false)
  const stack = reduced || compact
  React.useEffect(() => {
    if (entry === "opening") {
      if (reduced) { setEntry("entered"); return }
      // Also finish if the browser interrupts the CSS animation.
      const timer = window.setTimeout(() => setEntry("entered"), 1000)
      return () => window.clearTimeout(timer)
    }
  }, [entry, reduced])
  React.useEffect(() => {
    if (entry === "entered") rootRef.current?.querySelector<HTMLButtonElement>(".tpp-brand")?.focus({ preventScroll: true })
  }, [entry])
  const activeRef = React.useRef(0)
  const modeRef = React.useRef(stack)

  const go = React.useCallback(
    (i: number) => {
      if (stack) {
        chRefs.current[i]?.scrollIntoView({ behavior: "instant", block: "start" })
        return
      }
      const t = trackRef.current
      const st = stageRef.current
      if (!t || !st) return
      const top = t.getBoundingClientRect().top + window.scrollY + i * st.offsetHeight * scrollPerChapter
      window.scrollTo({ top: Math.ceil(top) + 1, behavior: modeRef.current !== stack ? "instant" : "smooth" })
    },
    [stack, scrollPerChapter],
  )

  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const on = () => setReduced(mq.matches)
    on()
    mq.addEventListener("change", on)
    return () => mq.removeEventListener("change", on)
  }, [])
  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 760px) and (max-height: 700px), (max-height: 560px)")
    const on = () => setCompact(mq.matches)
    on()
    mq.addEventListener("change", on)
    return () => mq.removeEventListener("change", on)
  }, [])

  /* ---- scroll → tear ---- */
  React.useEffect(() => {
    const els = chRefs.current
    const painters = els.map(el => el ? createPainter(el) : null)
    const root = rootRef.current
    if (modeRef.current !== stack) {
      go(activeRef.current)
      modeRef.current = stack
    }
    if (stack) {
      stageRef.current?.setAttribute("data-tone", "dark")
      els.forEach((el, i) => {
        if (!el) return
        painters[i]?.(0, 1, 0)
        el.setAttribute("data-on", "")
        el.inert = false
        el.removeAttribute("aria-hidden")
      })
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            activeRef.current = els.indexOf(entry.target as HTMLDivElement)
            setActive(activeRef.current)
          }
        })
      }, { rootMargin: "-20% 0px -60% 0px" })
      els.forEach(el => { if (el) observer.observe(el) })
      return () => observer.disconnect()
    }
    let target = 0
    let cur = 0
    let raf = 0
    let last = performance.now()
    let shown = -1
    let toneAt = -1
    let lastY = window.scrollY
    let dir = 1
    let touching = false
    let timer = 0
    let H = stageRef.current?.offsetHeight || window.innerHeight
    let trackTop = (trackRef.current?.getBoundingClientRect().top || 0) + window.scrollY

    const unit = () => H * scrollPerChapter
    const measure = () => {
      const t = trackRef.current
      if (!t) return
      target = clamp((window.scrollY - trackTop) / unit(), 0, N - 1)
    }
    const prev: { s: number; p: number }[] = els.map(() => ({ s: -1, p: -1 }))
    const apply = (s: number) => {
      const f = frame(s, N, HOLD)
      f.chapters.forEach((c, i) => {
        const el = els[i]
        if (!el) return
        if (c.on !== el.hasAttribute("data-on")) el.toggleAttribute("data-on", c.on)
        if (!c.on && prev[i].s === 0 && prev[i].p === 0) return
        const sv = c.on ? c.s : 0
        const pv = c.on ? c.p : 0
        if (prev[i].s === sv && prev[i].p === pv) return
        prev[i] = { s: sv, p: pv }
        painters[i]?.(sv, pv, H)
      })
      const under = f.split > 0.82 ? f.k + 1 : f.k
      if (under !== toneAt && stageRef.current) {
        toneAt = under
        stageRef.current.setAttribute("data-tone", TONES[under] || "dark")
      }
      if (f.active !== shown) {
        shown = f.active
        activeRef.current = shown
        els.forEach((el, i) => {
          if (!el) return
          const hidden = i !== shown
          if (el.inert !== hidden) el.inert = hidden
          if (hidden && el.getAttribute("aria-hidden") !== "true") el.setAttribute("aria-hidden", "true")
          else if (!hidden && el.hasAttribute("aria-hidden")) el.removeAttribute("aria-hidden")
        })
        setActive(shown)
      }
    }
    const tick = (now: number) => {
      const dt = Math.min(64, now - last)
      last = now
      cur = smooth ? cur + (target - cur) * (1 - Math.exp(-dt / 110)) : target
      if (Math.abs(target - cur) < 0.0004) cur = target
      apply(cur)
      raf = cur !== target ? requestAnimationFrame(tick) : 0
    }
    const kick = () => {
      measure()
      if (!raf) {
        last = performance.now()
        raf = requestAnimationFrame(tick)
      }
    }
    const settle = () => {
      if (touching) return
      // Give the paper priority until its easing has caught up with native scroll.
      if (raf) { timer = window.setTimeout(settle, 50); return }
      root?.removeAttribute("data-scrolling")
      if (!snap) return
      const t = trackRef.current
      if (!t) return
      const goal = snapTarget(target, N, HOLD, dir)
      if (goal === null) return
      const top = trackTop + goal * unit()
      window.scrollTo({ top: Math.ceil(top) + 1, behavior: "smooth" })
    }
    const onScroll = () => {
      const y = window.scrollY
      if (y !== lastY) dir = y > lastY ? 1 : -1
      lastY = y
      if (root && !root.hasAttribute("data-scrolling")) root.setAttribute("data-scrolling", "")
      kick()
      window.clearTimeout(timer)
      timer = window.setTimeout(settle, 350)
    }
    const onScrollEnd = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(settle, 220)
    }
    const onInput = () => {
      window.clearTimeout(timer)
      if (root?.hasAttribute("data-scrolling")) timer = window.setTimeout(settle, 350)
    }
    const onTouchStart = () => {
      touching = true
      onInput()
    }
    const onTouchEnd = () => {
      touching = false
      window.clearTimeout(timer)
      timer = window.setTimeout(settle, 350)
    }

    measure()
    cur = target
    apply(cur)
    const ro = new ResizeObserver(() => {
      H = stageRef.current?.offsetHeight || window.innerHeight
      trackTop = (trackRef.current?.getBoundingClientRect().top || 0) + window.scrollY
      prev.forEach(p => { p.s = -1; p.p = -1 })
      kick()
    })
    if (stageRef.current) ro.observe(stageRef.current)
    addEventListener("scroll", onScroll, { passive: true })
    document.addEventListener("scrollend", onScrollEnd)
    addEventListener("wheel", onInput, { passive: true })
    addEventListener("keydown", onInput)
    addEventListener("touchstart", onTouchStart, { passive: true })
    addEventListener("touchend", onTouchEnd, { passive: true })
    addEventListener("touchcancel", onTouchEnd, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(timer)
      root?.removeAttribute("data-scrolling")
      ro.disconnect()
      removeEventListener("scroll", onScroll)
      document.removeEventListener("scrollend", onScrollEnd)
      removeEventListener("wheel", onInput)
      removeEventListener("keydown", onInput)
      removeEventListener("touchstart", onTouchStart)
      removeEventListener("touchend", onTouchEnd)
      removeEventListener("touchcancel", onTouchEnd)
    }
  }, [stack, smooth, snap, scrollPerChapter, go])

  /* ---- paper grain, painted once ---- */
  React.useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const tile = (rgb: number[], max: number, seed: number) => {
      const c = document.createElement("canvas")
      c.width = c.height = 128
      const g = c.getContext("2d")
      if (!g) return "none"
      const img = g.createImageData(128, 128)
      const r = rng(seed)
      for (let i = 0; i < img.data.length; i += 4) {
        const v = r()
        img.data[i] = rgb[0]
        img.data[i + 1] = rgb[1]
        img.data[i + 2] = rgb[2]
        img.data[i + 3] = Math.round(v * v * v * max)
      }
      g.putImageData(img, 0, 0)
      return "url(" + c.toDataURL() + ")"
    }
    root.style.setProperty("--tpp-gd", tile([40, 32, 24], 46, 1))
    root.style.setProperty("--tpp-gl", tile([255, 255, 255], 44, 2))
  }, [])

  /* ---- pointer parallax ---- */
  React.useEffect(() => {
    const root = rootRef.current
    if (!root || stack || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return
    const layers = root.querySelectorAll<HTMLElement>(".tpp-par")
    let raf = 0
    let mx = 0
    let my = 0
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return
      mx = (e.clientX / window.innerWidth) * 2 - 1
      my = (e.clientY / window.innerHeight) * 2 - 1
      if (!raf)
        raf = requestAnimationFrame(() => {
          raf = 0
          layers.forEach((el) => {
            if (!el.closest(".tpp-ch[data-on]")) return
            const dp = Number(el.dataset.dp) || 0
            el.style.transform = "translate3d(" + fmt(mx * dp) + "px," + fmt(my * dp * 0.5) + "px,0)"
          })
        })
    }
    const reset = () => {
      cancelAnimationFrame(raf)
      raf = 0
      layers.forEach(el => { el.style.transform = "" })
    }
    root.addEventListener("pointermove", onMove)
    root.addEventListener("pointerleave", reset)
    return () => {
      root.removeEventListener("pointermove", onMove)
      root.removeEventListener("pointerleave", reset)
      reset()
    }
  }, [stack])

  /* ---- chapter state ---- */
  const [pi, setPi] = React.useState(0)
  const [stop, setStop] = React.useState(stops.length - 1)
  const [message, setMessage] = React.useState("")
  const [from, setFrom] = React.useState("")
  const [stampKind, setStampKind] = React.useState(0)
  const [sent, setSent] = React.useState(false)
  const [shake, setShake] = React.useState(0)
  const [copied, setCopied] = React.useState(false)
  const [copyError, setCopyError] = React.useState(false)
  const [messageError, setMessageError] = React.useState(false)
  const msgRef = React.useRef(null as HTMLTextAreaElement | null)
  const focusContact = React.useRef(false)

  React.useEffect(() => {
    if (active === 4 && focusContact.current) {
      focusContact.current = false
      msgRef.current?.focus({ preventScroll: true })
    }
  }, [active])

  const step = (delta: number) => {
    const n = list.length
    const next = wrap(pi + delta, n)
    setPi(next)
  }

  const ask = (p: PostcardProject) => {
    setMessage("Hi " + name.split(" ")[0] + ",\n\nI'd love to hear more about " + p.name + ". ")
    setSent(false)
    go(4)
  }

  const send = () => {
    if (!message.trim()) {
      setMessageError(true)
      setShake((s) => s + 1)
      msgRef.current?.focus({ preventScroll: true })
      return
    }
    const body = message.trim() + (from.trim() ? "\n\n— " + from.trim() : "")
    setSent(true)
    window.location.href = mailtoHref(email, "A postcard for " + name, body)
  }

  const copy = () => {
    setCopyError(false)
    setMessageError(false)
    if (!navigator.clipboard) { setCopyError(true); return }
    navigator.clipboard.writeText(email).then(
      () => {
        setCopied(true)
        window.setTimeout(() => setCopied(false), 1600)
      },
      () => setCopyError(true),
    )
  }

  /* ---- route map geometry ---- */
  const [narrow, setNarrow] = React.useState(false)
  const [mapAr, setMapAr] = React.useState(1.8)
  const [mapH, setMapH] = React.useState(500)
  const mapRef = React.useRef(null as HTMLDivElement | null)
  React.useEffect(() => {
    const st = stageRef.current
    const mp = mapRef.current
    if (!st) return
    const ro = new ResizeObserver(() => {
      setNarrow(st.offsetWidth <= 760)
      if (mp && mp.offsetHeight) {
        setMapAr(mp.offsetWidth / mp.offsetHeight)
        setMapH(mp.offsetHeight)
      }
    })
    ro.observe(st)
    if (mp) ro.observe(mp)
    return () => ro.disconnect()
  }, [])
  const pts = React.useMemo(() => {
    const n = stops.length
    return stops.map((_, i) => {
      const t = n > 1 ? i / (n - 1) : 0.5
      return narrow ? ([i % 2 ? 72 : 26, 18 + t * 65] as Pt) : ([8 + t * 84, 62 - Math.sin(t * Math.PI * 2.2 + 0.4) * 26] as Pt)
    })
  }, [stops, narrow])
  const trail = React.useMemo(() => {
    const scaled = pts.map((p) => [p[0] * mapAr, p[1]] as Pt)
    const m = measureCurve(scaled)
    return { d: curveThrough(scaled), fr: m.fr, total: m.total, w: 100 * mapAr }
  }, [pts, mapAr])

  const projectsCount = list.length
  const year = new Date().getFullYear()
  const today = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase()
  const cur = list[pi] || list[0]
  const stamps = ["mountain", "eagle", "pine"]

  const rootStyle = {
    "--tpp-navy": pal.navy,
    "--tpp-deep": pal.deep,
    "--tpp-fog": "color-mix(in oklab, " + pal.fog + " 92%, var(--color-background, #fff))",
    "--tpp-paper": "color-mix(in oklab, " + pal.paper + " 94%, var(--color-background, #fff))",
    "--tpp-fiber": "color-mix(in oklab, #f7f4ee 94%, var(--color-background, #fff))",
    "--tpp-ink": pal.ink,
    "--tpp-accent": pal.accent,
    "--tpp-tape": pal.tape,
    "--tpp-h": height,
  } as React.CSSProperties

  const stampArt = (k: number) =>
    k === 0 ? (
      <Scene kind="peak" seed={3} />
    ) : k === 1 ? (
      <div className="tpp-fill" style={{ background: "#d9cdb4" }}>
        <div style={{ position: "absolute", inset: "8% 4%" }}>
          <Eagle uid={uid + "s"} />
        </div>
      </div>
    ) : (
      <div className="tpp-fill" style={{ background: "#e6ebe4" }}>
        <div style={{ position: "absolute", inset: "10% -10% 0 -20%" }}>
          <PineBranch seed={4} />
        </div>
      </div>
    )

  /* ================= chapters ================= */

  const hero = (
    <Chapter
      index={0}
      seam={0.72}
      seed={101}
      label={labels[0]}
      setRef={setRef}
      uid={uid}
      upperBg={
        <div className="tpp-fill" aria-hidden="true">
          <HeroMountains uid={uid} />
          <Grain uid={uid} light opacity={0.18} />
          <Grain uid={uid} opacity={0.3} />
          {snow && <Snow seed={7} count={20} />}
        </div>
      }
      upper={
        <div className="tpp-fill">
          <div className="tpp-hero-copy absolute inset-x-0 flex flex-col items-center px-5 text-center" style={{ top: "34%" }}>
            <Pop d={0}>
              <h1 className="tpp-h tpp-hero-h">
                {headline.map((l, i) => (
                  <span key={i} className={"block " + (animateIn ? "tpp-rise" : "")} style={{ "--rd": 0.15 + i * 0.18 + "s" } as React.CSSProperties}>
                    {l}
                  </span>
                ))}
              </h1>
            </Pop>
            <Pop d={0.15}>
              <p className={"mt-5 max-w-[34ch] text-[13px] leading-relaxed sm:text-[15px] " + (animateIn ? "tpp-rise" : "")} style={{ color: "#e4e2dc", "--rd": ".55s" } as React.CSSProperties}>
                {intro}
              </p>
            </Pop>
            <Pop d={0.25} className={"mt-7 flex flex-wrap justify-center gap-3 " + (animateIn ? "tpp-rise" : "")} style={{ "--rd": ".75s" } as React.CSSProperties}>
              <button type="button" className="tpp-tag" onClick={() => go(2)}>
                See the work
              </button>
              <button type="button" className="tpp-tag" data-ghost="" style={{ color: "#f3eee4" }} onClick={() => go(4)}>
                Write to me
              </button>
            </Pop>
          </div>
          <div className="tpp-par tpp-hero-eagle absolute" data-dp={-14} style={{ right: "7%", top: "13%", width: "clamp(120px, 17cqw, 250px)", aspectRatio: "1.3" }}>
            <div className={animateIn ? "tpp-flyin" : ""} style={{ width: "100%", height: "100%" }}>
              <div className="tpp-glide" style={{ width: "100%", height: "100%" }}>
                <Eagle uid={uid} />
              </div>
            </div>
          </div>
          <button
            type="button"
            className="tpp-note tpp-paper tpp-hero-note"
            onClick={() => go(2)}
            style={{ right: "4%", top: "calc(13% + clamp(96px, 14cqw, 200px))", width: "clamp(140px, 14cqw, 200px)", transform: "rotate(-4deg)" }}
          >
            <span style={{ display: "block", color: "#2f4a76" }}>{note || projectsCount + " projects worth a slow look"}</span>
            <span className="tpp-label" style={{ display: "block", marginTop: 6, fontFamily: "inherit", fontSize: 9, opacity: 0.6 }}>
              from the studio
            </span>
          </button>
        </div>
      }
      lowerBg={<FogPaper uid={uid} seed={2} peak={false} forest />}
      lower={
        <div className="flex h-full items-start justify-between px-[clamp(16px,4cqw,44px)] pt-[clamp(10px,3cqh,30px)]" style={{ color: pal.ink }}>
          <button type="button" className="tpp-label flex items-center gap-3" onClick={() => go(1)}>
            <span className="tpp-hint" aria-hidden="true">
              ↓
            </span>
            <span>
              Keep scrolling<span className="tpp-wide-i"> — the page tears open</span>
            </span>
          </button>
          <span className="tpp-label tpp-wide" style={{ opacity: 0.65 }}>
            {role} · {location}
          </span>
        </div>
      }
    />
  )

  const postcardFront = (
    <div className="tpp-paper relative h-full overflow-clip" style={{ borderRadius: 3 }}>
      <Grain uid={uid} opacity={0.35} />
      <div className="tpp-pc-grid relative">
        <div className="relative min-h-0" style={{ minHeight: narrow ? "24cqh" : undefined }}>
          <div className="absolute overflow-clip" style={{ left: 0, top: 0, right: narrow ? "38%" : "6%", bottom: narrow ? "8%" : "22%", border: "5px solid " + pal.navy, boxShadow: "0 6px 14px rgba(0,0,0,.25)" }}>
            <Photo src={ab.photo} kind="dawn" seed={4} alt={name + " — portrait"} />
          </div>
          <div className="tpp-snapshot absolute" style={{ left: narrow ? "48%" : "6%", bottom: 0, width: narrow ? "52%" : "58%", aspectRatio: "1.2", transform: "rotate(-4deg)", background: "#fbfaf6", padding: 6, boxShadow: "0 8px 16px rgba(0,0,0,.3)" }}>
            {ab.snapshots?.length ? <SnapshotGallery photos={ab.snapshots} active={active === 1 && entry === "entered"} /> : <div className="relative h-full w-full overflow-clip">
              <Photo src={list[0].image} kind="lake" seed={6} alt={list[0].name + " — current work"} />
            </div>}
            <span className="tpp-tape" aria-hidden="true" style={{ right: narrow ? -6 : -26, top: -6, transform: "rotate(36deg)", pointerEvents: "none" }} />
          </div>
          <svg className="tpp-svg tpp-wide absolute" viewBox="0 0 200 40" style={{ right: "6%", bottom: 0, width: "44%" }} aria-hidden="true">
            <path d="M0 38 L40 12 L58 24 L84 4 L120 34 L140 22 L170 38" fill="none" stroke={pal.ink} strokeOpacity=".5" strokeWidth="1.2" />
            <path d="M84 4 L80 18 M40 12 L44 24" stroke={pal.ink} strokeOpacity=".35" />
          </svg>
        </div>
        <div className="relative" style={{ background: "rgba(38,54,79,.25)" }}>
          <span className="tpp-label tpp-wide absolute left-1/2 top-1/2 whitespace-nowrap" style={{ transform: "translate(-50%,-50%) rotate(-90deg)", fontSize: 8, background: "var(--tpp-paper)", padding: "0 6px", color: pal.ink, opacity: 0.8 }}>
            par avion · by air mail
          </span>
        </div>
        <div className="relative flex min-h-0 flex-col">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="tpp-h" style={{ fontSize: "clamp(22px, min(3cqw, 5cqh), 40px)", color: "#3a5d96", fontWeight: 400 }}>
                {ab.title}
              </h2>
              <p className="mt-1 text-[12px] leading-snug sm:text-[13px]" style={{ color: pal.ink, maxWidth: "24ch" }}>
                {ab.subtitle}
              </p>
            </div>
            <div className="shrink-0" style={{ transform: "rotate(3deg)" }}>
              <Stamp w={narrow ? 52 : 64} h={narrow ? 64 : 78} label={mark}>
                {ab.portrait ? <img src={ab.portrait} alt="" className="tpp-fill" style={{ objectFit: "cover", maxWidth: "none" }} /> : <Avatar />}
              </Stamp>
            </div>
          </div>
          <div className="tpp-about-copy tpp-rule tpp-hw mt-3 flex-1" style={{ textIndent: "2.5em" }}>
            {ab.text}
          </div>
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="tpp-hand" style={{ color: "#2f4a76", fontSize: 18 }}>
              — {name}
            </span>
            <button type="button" data-flip-control className="tpp-label flex items-center gap-2" style={{ fontSize: 10, color: pal.accent }}>
              Click for more ↻
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const postcardBack = (
    <div className="tpp-paper relative h-full overflow-clip" style={{ borderRadius: 3 }}>
      <Grain uid={uid} opacity={0.35} />
      <div className="relative flex h-full flex-col p-[clamp(16px,2.4cqw,30px)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="tpp-label" style={{ color: pal.accent, fontSize: 10 }}>
              From the desk of
            </p>
            <h3 className="tpp-h mt-1" style={{ fontSize: "clamp(22px, min(3cqw, 5cqh), 38px)", fontWeight: 400 }}>
              {name}
            </h3>
            <p className="mt-1 text-[13px]" style={{ opacity: 0.75 }}>
              {role}
            </p>
          </div>
          <div style={{ transform: "rotate(-10deg)", flexShrink: 0 }} className="tpp-wide">
            <Postmark text={"· " + location.toUpperCase() + " · " + since + " "} date={since} />
          </div>
        </div>
        <dl className="mt-4 grid min-h-0 flex-1 content-center gap-x-6 gap-y-3" style={{ gridTemplateColumns: narrow ? "1fr" : "1fr 1fr" }}>
          {(ab.facts || []).map((f) => (
            <div key={f.label} className="tpp-rule" style={{ borderBottom: "1px solid rgba(38,54,79,.18)", paddingBottom: 4 }}>
              <dt className="tpp-label" style={{ fontSize: 9, opacity: 0.6 }}>
                {f.label}
              </dt>
              <dd className="tpp-hand m-0" style={{ fontSize: "clamp(16px,1.7cqw,22px)", color: "#2f4a76" }}>
                {f.value}
              </dd>
            </div>
          ))}
        </dl>
        <div className="mt-3 flex flex-wrap gap-2">
          {(ab.skills || []).map((s) => (
            <span key={s} className="tpp-chip">
              {s}
            </span>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <a href={"mailto:" + email} className="tpp-label" style={{ fontSize: 10, color: pal.accent }}>
            {email}
          </a>
          <button type="button" data-flip-control className="tpp-label" style={{ fontSize: 10, color: pal.accent }}>
            ↺ Front
          </button>
        </div>
      </div>
    </div>
  )

  const aboutCh = (
    <Chapter
      index={1}
      seam={0.86}
      seed={202}
      label={labels[1]}
      setRef={setRef}
      uid={uid}
      upperBg={<FogPaper uid={uid} seed={2} />}
      upper={
        <div className="tpp-fill flex items-center justify-center" style={{ paddingTop: 56 }}>
          <Pop d={0.05} r={-4} className="tpp-wide absolute" style={{ right: "7%", top: "15%", width: "clamp(80px,9cqw,130px)" }}>
            <button type="button" className="tpp-envelope relative w-full" style={{ aspectRatio: "1.45", transform: "rotate(8deg)" }} aria-label="Write Astraa a letter"
              onClick={() => { focusContact.current = true; go(4) }}>
              <div className="tpp-letter absolute" style={{ left: "10%", right: "10%", top: "-10%", height: "80%", background: "#fbfaf6", boxShadow: "0 2px 4px rgba(0,0,0,.15)" }}>
                <div className="tpp-rule absolute" style={{ inset: "18% 12%", fontSize: 6 }} />
              </div>
              <svg className="tpp-svg tpp-fill" viewBox="0 0 145 100" preserveAspectRatio="none" aria-hidden="true">
                <rect y="20" width="145" height="80" fill="#efe7d6" />
                <path d="M0 20 L72 66 L145 20 L145 100 L0 100 Z" fill="#e6dcc6" />
                <path d="M0 100 L60 58 M145 100 L85 58" stroke="#cdbf9f" />
                <rect x="104" y="72" width="30" height="22" fill="#9fb6cf" />
              </svg>
            </button>
          </Pop>
          <Pop d={0.12} r={-3}>
            <FlippablePostcard front={postcardFront} back={postcardBack} />
          </Pop>
        </div>
      }
      lowerBg={<NightPaper uid={uid} seed={5} trees={false} flakes={false} />}
      lower={
        <div className="relative h-full">
          <div className="absolute" style={{ left: "-2%", top: -30, width: "clamp(160px,20cqw,300px)", aspectRatio: "1.5" }}>
            <PineBranch seed={9} />
          </div>
          <span className="tpp-label absolute" style={{ right: "clamp(16px,4cqw,44px)", top: "clamp(10px,3cqh,26px)", color: "#e8e4da" }}>
            Next — {workTitle}
          </span>
        </div>
      }
    />
  )

  const polaroids = list.map((p, j) => {
    const n = list.length
    const depth = wrap(j - pi, n)
    const tr =
      depth === 0
        ? "rotate(-3deg)"
        : depth === 1
          ? "translate(7%, 3%) rotate(5deg) scale(.95)"
          : depth === 2
            ? "translate(-7%, 5%) rotate(-8deg) scale(.9)"
            : "translate(0, 6%) rotate(2deg) scale(.86)"
    return (
      <div
        key={j}
        className="tpp-polaroid"
        data-pose={tr}
        aria-hidden={depth !== 0}
        style={{ transform: tr, zIndex: 20 - depth, opacity: depth > 2 ? 0 : 1 }}
      >
        <div className="relative w-full overflow-clip" style={{ aspectRatio: "1", background: "#ccc" }}>
          <Photo src={p.image} kind={p.scene || (["dawn", "peak", "lake", "sun", "forest", "river", "night"] as SceneKind[])[j % 7]} seed={j + 2} alt={p.name} />
        </div>
        <p className="tpp-hand m-0 px-1 pt-3 text-center" style={{ color: "#2f3d55", fontSize: "clamp(14px,1.6cqw,21px)", lineHeight: 1.1 }}>
          {p.note || p.name}
        </p>
      </div>
    )
  })

  const workCh = (
    <Chapter
      index={2}
      seam={0.9}
      seed={303}
      label={labels[2]}
      setRef={setRef}
      uid={uid}
      upperBg={<NightPaper uid={uid} seed={3} flakes={snow} />}
      upper={
        <div className="tpp-fill flex flex-col" style={{ paddingTop: "clamp(64px, 10cqh, 96px)", color: "#f3eee4" }}>
          <div className="absolute" style={{ left: "-3%", top: "-4%", width: "clamp(150px,18cqw,280px)", aspectRatio: "1.5", transform: "rotate(10deg)" }}>
            <PineBranch seed={13} />
          </div>
          <Pop d={0.05} className="tpp-squirrel-wrap absolute" style={{ right: "-1%", top: "4%", width: "clamp(110px,15cqw,220px)", aspectRatio: "1.1" }}>
            <Squirrel uid={uid} />
          </Pop>
          <Pop d={0} className="text-center">
            <h2 className="tpp-h tpp-sec-h" style={{ color: "#f3eee4" }}>
              {workTitle}
            </h2>
            <p className="tpp-label mt-3" style={{ opacity: 0.6 }}>
              {String(pi + 1).padStart(2, "0")} / {String(list.length).padStart(2, "0")}
            </p>
          </Pop>
          <div
            className="relative mx-auto flex w-full min-h-0 flex-1 items-center justify-center gap-[clamp(20px,5cqw,80px)] px-[clamp(16px,5cqw,64px)]"
            style={{ flexDirection: narrow ? "column" : "row", maxWidth: 1100, paddingBottom: narrow ? 8 : "6cqh", gap: narrow ? 14 : undefined }}
            onKeyDown={(e) => {
              if (!e.altKey && !e.ctrlKey && !e.metaKey && (e.key === "ArrowRight" || e.key === "ArrowLeft")) {
                e.preventDefault()
                step(e.key === "ArrowRight" ? 1 : -1)
              }
            }}
          >
            <svg className="tpp-svg tpp-wide pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <path className="tpp-dash" d="M30 72 C42 92 50 40 62 46" fill="none" stroke="#f3eee4" strokeOpacity=".55" strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
            </svg>
            <Pop d={0.1} r={-6}>
              <DraggableProjectStack
                label={"Next project (showing " + cur.name + ")"}
                onStep={step}
                style={{ width: narrow ? "min(50cqw, calc(34cqh * .88))" : "min(28cqw, calc(54cqh * .88), 360px)", aspectRatio: "0.86" }}
              >
                {polaroids}
                <span className="tpp-tape" style={{ left: "50%", top: -10, marginLeft: -38, transform: "rotate(-4deg)", zIndex: 40 }} />
              </DraggableProjectStack>
            </Pop>
            <Pop d={0.22} r={3} style={{ width: narrow ? "100%" : "min(420px, 40cqw)", maxWidth: 460 }}>
              <div className="tpp-ncard tpp-project-info" aria-live="polite">
                {list.map((project, index) => <div key={project.name} className="tpp-project-details" data-current={index === pi ? "" : undefined} aria-hidden={index !== pi} inert={index !== pi} style={{ visibility: index === pi ? "visible" : "hidden" }}>
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="tpp-h" style={{ fontSize: "clamp(22px,2.6cqw,34px)", fontWeight: 400, letterSpacing: ".04em" }}>
                    {project.name}
                  </h3>
                  <span className="tpp-serif shrink-0" style={{ fontSize: 15, opacity: 0.7 }}>
                    {project.year}
                  </span>
                </div>
                {project.role && (
                  <p className="tpp-label mt-1" style={{ fontSize: 9.5, color: pal.accent }}>
                    {project.role}
                  </p>
                )}
                {project.description && (
                  <p className="mt-3 flex-1 text-[13px] leading-relaxed sm:text-[14px]" style={{ display: "-webkit-box", WebkitLineClamp: narrow ? 3 : 5, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {project.description}
                  </p>
                )}
                {project.tags && project.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {project.tags.map((t) => (
                      <span key={t} className="tpp-chip">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-4">
                  {project.url ? (
                    <a href={project.url} target="_blank" rel="noreferrer" className="tpp-label" style={{ fontSize: 10, color: pal.accent, borderBottom: "1px solid currentColor", paddingBottom: 2 }}>
                      View project ↗
                    </a>
                  ) : (
                    <button type="button" className="tpp-label" style={{ fontSize: 10, color: pal.accent, borderBottom: "1px solid currentColor", paddingBottom: 2 }} onClick={() => ask(project)}>
                      Ask me about it →
                    </button>
                  )}
                </div>
                </div>)}
              </div>
              <div className="tpp-project-controls mt-3 flex items-center justify-between gap-3" style={{ color: "#f3eee4" }}>
                <div className="flex items-center gap-2">
                  <button type="button" className="tpp-round" aria-label="Previous project" onClick={() => step(-1)}>
                    ←
                  </button>
                  <button type="button" className="tpp-round" aria-label="Next project" onClick={() => step(1)}>
                    →
                  </button>
                </div>
                <div className="flex items-center gap-1" role="group" aria-label="Projects">
                  {list.map((p, j) => (
                    <button
                      key={j}
                      type="button"
                      className="tpp-pip"
                      aria-label={p.name}
                      aria-current={j === pi}
                      onClick={() => j !== pi && step(j - pi)}
                    />
                  ))}
                </div>
              </div>
            </Pop>
          </div>
        </div>
      }
      lowerBg={<NightPaper uid={uid} seed={4} trees={false} flakes={false} />}
      lower={
        <div className="relative h-full">
          <span className="tpp-label absolute" style={{ left: "clamp(16px,4cqw,44px)", top: "clamp(8px,2cqh,22px)", color: "#e8e4da", opacity: 0.8 }}>
            Next — {routeTitle}
          </span>
        </div>
      }
    />
  )

  const px = 100 / Math.max(1, mapH)
  const st = stops[stop] || stops[0]
  const sp = pts[stop] || [50, 50]

  const routeCh = (
    <Chapter
      index={3}
      seam={0.88}
      seed={404}
      label={labels[3]}
      setRef={setRef}
      uid={uid}
      upperBg={
        <div className="tpp-fill" aria-hidden="true" style={{ background: "var(--tpp-paper)" }}>
          <Contours />
          <Grain uid={uid} opacity={0.45} />
        </div>
      }
      upper={
        <div className="tpp-fill flex flex-col" style={{ paddingTop: "clamp(64px, 10cqh, 96px)", color: pal.ink }}>
          <Pop d={0} className="flex items-end justify-between gap-4 px-[clamp(16px,5cqw,64px)]">
            <div>
              <p className="tpp-label" style={{ color: pal.accent }}>
                Sheet 07 · scale 1 : 50 000
              </p>
              <h2 className="tpp-h tpp-sec-h mt-2">{routeTitle}</h2>
            </div>
            <div className="tpp-wide" style={{ color: pal.ink, opacity: 0.7 }}>
              <Compass />
            </div>
          </Pop>
          <div className="mx-[clamp(16px,5cqw,64px)] mb-[3cqh] mt-[2cqh] min-h-0 flex flex-1 flex-col gap-4">
          <div
            ref={mapRef}
            className="tpp-route-map relative min-h-0 flex-1"
            onKeyDown={(e) => {
              if (!e.altKey && !e.ctrlKey && !e.metaKey && ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].includes(e.key)) {
                e.preventDefault()
                const next = clamp(stop + (e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1), 0, stops.length - 1)
                e.currentTarget.querySelectorAll<HTMLButtonElement>(".tpp-pin")[next]?.focus({ preventScroll: true })
              }
            }}
          >
            <svg className="tpp-svg tpp-fill" viewBox={"0 0 " + fmt(trail.w) + " 100"} preserveAspectRatio="none" aria-hidden="true" style={{ overflow: "visible" }}>
              <path d={trail.d} fill="none" stroke={pal.ink} strokeOpacity=".5" strokeWidth={1.6 * px} strokeDasharray={fmt(2 * px) + " " + fmt(8 * px)} strokeLinecap="round" />
              <path
                className="tpp-progress"
                d={trail.d}
                fill="none"
                stroke={pal.accent}
                strokeWidth={2.6 * px}
                strokeLinecap="round"
                strokeDasharray={fmt(trail.total + 1) + " " + fmt(trail.total + 1)}
                strokeDashoffset={fmt(trail.total * (1 - (trail.fr[stop] || 0)))}
              />
            </svg>
            <span className="tpp-walker" style={{ left: sp[0] + "%", top: sp[1] + "%" }} aria-hidden="true" />
            {stops.map((s, i) => (
              <Pop key={i} d={0.08 + i * 0.05} style={{ position: "absolute", left: pts[i][0] + "%", top: pts[i][1] + "%" }}>
                <button
                  type="button"
                  className="tpp-pin"
                  aria-pressed={i === stop}
                  aria-label={s.year + " — " + s.title}
                  onClick={() => setStop(i)}
                  onMouseEnter={() => setStop(i)}
                  onFocus={() => setStop(i)}
                  style={{ left: 0, top: 0 }}
                >
                  <span className="tpp-pin-y">{s.year}</span>
                  <span className="tpp-pin-dot" />
                </button>
              </Pop>
            ))}
          </div>
            <Pop
              d={0.3}
              className="tpp-stop"
            >
              <div className="tpp-ncard" aria-live="polite" style={{ transform: "rotate(-1deg)" }}>
                <p className="tpp-label" style={{ fontSize: 9.5, color: pal.accent }}>
                  {st.year}
                  {st.place ? " · " + st.place : ""}
                </p>
                <h3 className="tpp-serif mt-1" style={{ fontSize: "clamp(19px,1.9cqw,25px)", margin: "4px 0 0", fontWeight: 600, lineHeight: 1.15 }}>
                  {st.title}
                </h3>
                {st.text && <p className="mt-2 text-[13px] leading-relaxed">{st.text}</p>}
              </div>
            </Pop>
          </div>
        </div>
      }
      lowerBg={<NightPaper uid={uid} seed={6} trees={false} flakes={false} />}
      lower={
        <div className="relative h-full">
          <span className="tpp-label absolute" style={{ right: "clamp(16px,4cqw,44px)", top: "clamp(8px,2cqh,22px)", color: "#e8e4da", opacity: 0.8 }}>
            Last stop — {contactTitle}
          </span>
        </div>
      }
    />
  )

  const night = (
    <div className="tpp-fill" aria-hidden="true" style={{ background: "linear-gradient(180deg, #0c1528 0%, var(--tpp-deep) 45%, var(--tpp-navy) 100%)" }}>
      <svg className="tpp-svg tpp-fill" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id={uid + "-moon"}>
            <stop offset="0" stopColor="#fdf6e3" stopOpacity=".55" />
            <stop offset="1" stopColor="#fdf6e3" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={uid + "-au"} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#6ee7c0" stopOpacity="0" />
            <stop offset=".55" stopColor="#6ee7c0" stopOpacity=".32" />
            <stop offset="1" stopColor="#6ee7c0" stopOpacity="0" />
          </linearGradient>
        </defs>
        <NightSky />
        <g className="tpp-aurora">
          <path d="M-100 300 C200 120 420 340 700 200 C950 80 1150 260 1400 140 C1550 70 1650 120 1700 100 L1700 330 C1500 360 1300 260 1100 360 C850 470 650 300 420 400 C200 490 60 380 -100 460 Z" fill={"url(#" + uid + "-au)"} />
        </g>
        <circle cx="1280" cy="170" r="120" fill={"url(#" + uid + "-moon)"} />
        <circle cx="1280" cy="170" r="34" fill="#f6efdc" />
        <circle cx="1268" cy="162" r="6" fill="#e3d9bf" />
        <circle cx="1292" cy="180" r="4" fill="#e3d9bf" />
        <g>
          <path d={ridgeD(ridge(808, -120, 1720, 720, 260, 0.55, 7), 1000)} fill="#1b2944" />
        </g>
        <g>
          <path d={treesD(919, -40, 1640, 1010, 150, 320, 40)} fill="#0b1324" />
        </g>
      </svg>
      <Grain uid={uid} light opacity={0.18} />
      {snow && <Snow seed={23} count={22} />}
    </div>
  )

  const contactCh = (
    <Chapter
      index={4}
      seam={1}
      seed={505}
      label={labels[4]}
      last
      setRef={setRef}
      uid={uid}
      upperBg={night}
      upper={
        <div className="tpp-fill flex flex-col items-center" style={{ paddingTop: "clamp(64px, 10cqh, 96px)", color: "#f3eee4" }}>
          <Pop d={0} className="px-5 text-center">
            <h2 className="tpp-h tpp-sec-h">{contactTitle}</h2>
            <p className="tpp-label mt-3" style={{ opacity: 0.6 }}>
              Opens an email draft to {email}
            </p>
          </Pop>
          <Pop d={0.12} r={-2} className="mt-[3cqh] w-full px-4" style={{ maxWidth: 760 }}>
            <form
              className={"tpp-paper relative overflow-clip " + (shake ? (shake % 2 ? "tpp-shake" : "tpp-shake2") : "")}
              style={{ borderRadius: 3, transform: "rotate(-.6deg)" }}
              onSubmit={(e) => {
                e.preventDefault()
                send()
              }}
            >
              <Grain uid={uid} opacity={0.35} />
              <div className="relative grid gap-[clamp(12px,2.4cqw,28px)] p-[clamp(14px,2.4cqw,28px)]" style={{ gridTemplateColumns: narrow ? "1fr" : "1.25fr 1px 1fr" }}>
                <label className="relative block">
                  <span className="sr-only">Your message</span>
                  <div className="tpp-rule" style={{ height: narrow ? "6em" : "clamp(7.5em, 26cqh, 10.5em)", fontSize: "clamp(15px,1.5cqw,20px)" }}>
                    <textarea
                      ref={msgRef}
                      className="tpp-msg"
                      value={message}
                      aria-invalid={messageError}
                      aria-describedby={uid + "-contact-status"}
                      maxLength={3000}
                      onChange={(e) => {
                        setMessage(e.target.value)
                        setSent(false)
                        setMessageError(false)
                      }}
                      placeholder={"Dear " + name.split(" ")[0] + ", I have a project in mind…"}
                    />
                  </div>
                </label>
                {!narrow && <div style={{ background: "rgba(38,54,79,.22)" }} />}
                <div className="flex min-w-0 flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div role="group" aria-label="Choose a stamp" className="flex gap-2">
                      {stamps.map((s, k) => (
                        <button key={s} type="button" className="tpp-stamp-btn" aria-pressed={k === stampKind} aria-label={s + " stamp"} onClick={() => setStampKind(k)}>
                          <Stamp w={narrow ? 34 : 40} h={narrow ? 42 : 50}>
                            {stampArt(k)}
                          </Stamp>
                        </button>
                      ))}
                    </div>
                    <div style={{ transform: "rotate(4deg)" }}>
                      <Stamp w={narrow ? 52 : 62} h={narrow ? 64 : 76} label="POST">
                        {stampArt(stampKind)}
                      </Stamp>
                    </div>
                  </div>
                  <div className="tpp-hw" style={{ lineHeight: 1.7 }}>
                    <div style={{ borderBottom: "1px solid rgba(38,54,79,.3)" }}>To: {name}</div>
                    <div className="tpp-wide" style={{ borderBottom: "1px solid rgba(38,54,79,.3)" }}>
                      {location}
                    </div>
                  </div>
                  <label className="block">
                    <span className="tpp-label" style={{ fontSize: 9, opacity: 0.6 }}>
                      From
                    </span>
                    <input className="tpp-input" type="email" value={from} onChange={(e) => setFrom(e.target.value)} placeholder="you@studio.com" autoComplete="email" />
                  </label>
                  <div className="mt-auto flex items-center justify-between gap-3">
                    <button type="button" className="tpp-label" style={{ fontSize: 9.5, opacity: 0.9 }} onClick={copy}>
                      {copied ? "Copied ✓" : "Copy email"}
                    </button>
                    <button type="submit" className="tpp-tag" style={{ background: pal.ink, color: "#f3eee4" }}>
                      {sent ? "Draft ready ↗" : "Open email draft ↗"}
                    </button>
                  </div>
                </div>
              </div>
              {sent && (
                <div className="tpp-postmark" style={{ right: narrow ? 0 : 6, top: narrow ? 8 : 14 }}>
                  <Postmark text={"· A NOTE FOR " + name.toUpperCase() + " · "} date={today} />
                </div>
              )}
            </form>
            <p id={uid + "-contact-status"} className="tpp-hand mt-2 text-center" style={{ color: "#e8e4da", fontSize: 16, minHeight: "1.2em" }} role="status">
              {messageError ? "Write a short message first." : copyError ? "Copy unavailable — you can select the email address above." : copied ? "Email address copied." : sent ? "Finish sending in your email app." : ""}
            </p>
          </Pop>
          <Pop d={0.25} className="mt-[1.5cqh] flex flex-wrap justify-center gap-3 px-4">
            {links.map((l) => (
              l.disabled ? <button key={l.url} type="button" disabled className="tpp-luggage" title="Temporarily unavailable" aria-label={l.label + " — temporarily unavailable"}>{l.label}</button> : <a key={l.url} href={l.url} target="_blank" rel="noreferrer" className="tpp-luggage">
                {l.label}
              </a>
            ))}
          </Pop>
          <div className="mt-auto flex w-full items-center justify-between gap-3 px-[clamp(16px,4cqw,44px)] pb-4 text-[11px]" style={{ color: "#d6d3ca" }}>
            <span>
              © {year} {name} · made with paper, snow & patience
            </span>
            <button type="button" className="tpp-label" style={{ fontSize: 10 }} onClick={() => go(0)}>
              Back to the top ↑
            </button>
          </div>
        </div>
      }
    />
  )


  return (
    <div
      ref={rootRef}
      className={"tpp-root " + className}
      data-mode={stack ? "stack" : "pin"}
      data-entry={entry}
      style={rootStyle}
    >
      <style>{TPP_CSS}</style>
      {entry !== "entered" && (
        <section className="tpp-entry" aria-label={"A letter from " + name} data-opening={entry === "opening" ? "" : undefined}
          onAnimationEnd={event => { if (event.target === event.currentTarget) setEntry("entered") }}>
          <EntryBackground />
          <h2 className="tpp-entry-heading"><span>{name} · Field journal</span><strong>A little letter, just for you.</strong></h2>
          <button type="button" className="tpp-entry-button" aria-label="Open letter" aria-describedby={uid + "-entry-caption"} aria-disabled={entry === "opening"}
            onClick={event => {
              if (entry !== "sealed") return
              // Call play inside this click, before any animation or asynchronous work.
              musicRef.current?.start()
              window.scrollTo({ top: 0, behavior: "instant" })
              setEntry(reduced || event.detail === 0 ? "entered" : "opening")
            }}>
            <svg className="tpp-entry-route" viewBox="-100 -70 620 420" fill="none" aria-hidden="true">
              <path d="M-70 285 C-90 165 5 80 150 55 S475 18 500 140 S410 360 350 340 C240 302 355 165 480 278" stroke="currentColor" strokeDasharray="3 7" />
              <g className="tpp-entry-plane" stroke="currentColor" strokeWidth="1.2"><path d="m480 278 24-14-8 24-5-9-11-1Zm24-14-13 15" /></g>
              <path d="M-58 64h12m-6-6v12M486 332h12m-6-6v12" stroke="currentColor" />
            </svg>
            <span className="tpp-entry-shadow" aria-hidden="true" />
            <span className="tpp-entry-envelope" aria-hidden="true">
              <span className="tpp-entry-letter"><small>Inside this letter</small><span>{name}</span><small>Work · Ideas · A little music</small></span>
              <span className="tpp-entry-pocket" /><span className="tpp-entry-fold" /><span className="tpp-entry-flap" />
              <span className="tpp-entry-airmail" />
              {ab.portrait && <span className="tpp-entry-stamp"><img src={ab.portrait} alt="" draggable="false" /><small>{name}</small></span>}
              <svg className="tpp-entry-cancel" viewBox="0 0 96 40" fill="none" aria-hidden="true"><circle cx="22" cy="20" r="17" stroke="currentColor" /><path d="M37 9c10-8 13 8 25 0s14 8 26 0M39 20c10-8 13 8 25 0s14 8 26 0M37 31c10-8 13 8 25 0s14 8 26 0" stroke="currentColor" /><text x="22" y="23" textAnchor="middle" fill="currentColor" fontSize="7">BY AIR</text></svg>
              <span className="tpp-entry-seal">{mark}</span>
              <span className="tpp-entry-address">To: You<br />From: {name}</span>
              <span className="tpp-entry-postmark">By air<br />Vietnam</span>
            </span>
          </button>
          <p className="tpp-entry-caption" id={uid + "-entry-caption"}>Click to open the letter<span className="tpp-entry-caption-arrow" aria-hidden="true">↗</span><small>Enter the portfolio</small></p>
          <span className="tpp-entry-footer">{location} · {since}</span>
        </section>
      )}
      <div ref={trackRef} className="tpp-track" inert={entry !== "entered"} aria-hidden={entry !== "entered"} style={{ height: stack ? "auto" : "calc(" + height + " * " + fmt(1 + (N - 1) * scrollPerChapter + 0.35) + ")" }}>
        <div ref={stageRef} className="tpp-stage" data-tone="dark" style={{ height: stack ? "auto" : height }}>
          {hero}
          {aboutCh}
          {workCh}
          {routeCh}
          {contactCh}

          <nav className="tpp-nav" aria-label="Chapters">
            <div className="tpp-brand-group">
              <button type="button" className="tpp-brand" onClick={() => go(0)}>
                {name}
              </button>
              <ProfileViews opened={entry !== "sealed"} />
            </div>
            <div className="tpp-links">
              {labels.map((l, i) => (
                <button key={l} type="button" className="tpp-link" aria-current={i === active} onClick={() => go(i)}>
                  {l}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <MusicPlayer ref={musicRef} />
              <button type="button" className="tpp-count" aria-label="Choose chapter" popoverTarget={uid + "-index"}>
                {String(active + 1).padStart(2, "0")} / 05 ≡
              </button>
              <button type="button" className="tpp-logo-button" aria-label={name + " — back to the cover"} onClick={() => go(0)}>
                <Logo mark={mark} since={since} />
              </button>
            </div>
            <div id={uid + "-index"} className="tpp-index" popover="auto" role="navigation" aria-label="Chapter index">
              <p className="tpp-label mb-3">Field journal · {name}</p>
              {labels.map((l, i) => (
                <button key={l} type="button" aria-current={i === active} popoverTarget={uid + "-index"} popoverTargetAction="hide" onClick={() => go(i)}>
                  <span>{l}</span><span className="tpp-label">{String(i + 1).padStart(2, "0")} ↗</span>
                </button>
              ))}
            </div>
          </nav>
          {!stack && (
            <div className="tpp-rail" role="group" aria-label="Chapter progress">
              {labels.map((l, i) => (
                <button key={l} type="button" className="tpp-dot" aria-label={l} aria-current={i === active} onClick={() => go(i)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function NightSky() {
  const stars = React.useMemo(() => {
    const r = rng(42)
    return Array.from({ length: 110 }, () => ({ x: r() * 1600, y: r() * 620, s: 0.5 + r() * 1.6, d: r() * 3 }))
  }, [])
  return (
    <g>
      {stars.map((s, i) => (
        <circle key={i} className={i % 4 ? undefined : "tpp-twinkle"} cx={s.x} cy={s.y} r={s.s} fill="#fff" opacity=".75" style={{ animationDelay: -s.d + "s" }} />
      ))}
    </g>
  )
}
