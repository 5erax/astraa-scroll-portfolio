# Torn Postcard Portfolio

A whole personal site told as a winter travel journal. Five full-screen
chapters sit in one pinned stage, and scrolling **tears the page open**: the
chapter you're on rips along a ragged paper seam, the top half lifts away, the
bottom half drops, and the next chapter pops up out of the gap with its pieces
landing one after another. Scroll back up and the paper mends.

1. **Cover**: a night-blue mountain range, a soaring eagle, a torn note and a big serif question.
2. **Postcard** (about): photo collage, a stamp with your face, a handwritten note on ruled lines. *Turn over* flips it to the facts and skills on the back.
3. **Work**: a stack of taped polaroids that shuffle as you page through, a note card per project, and a squirrel on a pine branch.
4. **Route** (experience): a dashed trail across a topographic map. Hover a year and the route draws itself up to that stop.
5. **Write**: a postcard you fill in and send. Pick a stamp, add your email, and it gets postmarked and opens a `mailto:`.

```tsx
import TornPostcardPortfolio from "@/components/ui/torn-postcard-portfolio"

<TornPostcardPortfolio
  name="Mira Sol"
  role="Photographer & art director"
  headline={["Where does the light", "go in winter?"]}
  email="mira@example.com"
  projects={[{ name: "Blue Hour", year: "2026", scene: "night", note: "forty minutes of blue", description: "…" }]}
  palette={{ navy: "#2a3c4f", accent: "#9a4f2e" }}
/>
```

**No dependencies beyond React.** Every mountain, tree, bird, stamp, photo and
map is SVG generated from seeded numbers, so it renders the same on the server
and the client. The paper grain is a 128px tile painted once on a canvas. No
fonts, images or stylesheets load. Pass `image`, `about.photo` or
`about.portrait` to use your own photos.

## Play with it

| Do this | And |
|---|---|
| Scroll | The chapter tears and the next one grows out of the gap. Stop halfway and it settles: scrolling down finishes the tear, scrolling up mends it |
| Nav links, the side dots, the logo stamp | Scroll to that chapter, tearing through the ones in between |
| *See the work* / the eagle's note | Jump to Work. *Write to me* jumps to the postcard |
| Move the mouse on the cover | The mountain ridges and the eagle drift in parallax |
| *Turn over ↻* | Flip the postcard |
| Click the polaroids, ← →, the pips, or arrow keys | Shuffle through projects |
| *Ask me about it →* | Prefill the contact postcard with that project and scroll there |
| Hover, focus or click a year on the map; arrow keys | Move along the route |
| Send an empty postcard | It shakes and focuses the message |

## Props

| Prop | Default | Description |
|---|---|---|
| `name` / `role` / `location` / `since` | Kedhareswer, … | Nav brand, logo stamp initials, postcard back, contact address. |
| `headline` | 2 lines | Cover headline, one string per line. |
| `intro` | one line | Under the headline. |
| `note` | `"<n> projects worth a slow look"` | The torn note under the eagle. |
| `about` | bio | `{ title, subtitle, text, photo?, portrait?, facts: {label,value}[], skills: string[] }`. Omitted fields fall back to the defaults. |
| `projects` | 5 projects | `{ name, year?, role?, description?, tags?, url?, note?, scene?, image? }[]`. `note` is the polaroid caption. `scene` is `"dawn" \| "lake" \| "sun" \| "forest" \| "peak" \| "night" \| "river"`. With `url` the card links out; without it, *Ask me about it*. |
| `route` | 5 stops | `{ year, title, place?, text? }[]`. Opens on the latest. |
| `email` | `"hello@example.com"` | Where the postcard goes. |
| `links` | GitHub, LinkedIn, Dribbble | `{ label, url }[]`, shown as luggage tags. |
| `labels` | Cover, About, Work, Route, Write | Nav labels for the five chapters. |
| `workTitle` / `routeTitle` / `contactTitle` | | Section headings. |
| `palette` | Altai winter | `{ navy, deep, fog, paper, ink, accent, tape }`. |
| `scrollPerChapter` | `1.4` | Stage heights of scroll per chapter. |
| `smooth` | `true` | Ease the tear toward the scroll position. |
| `snap` | `true` | Finish or mend a half-done tear when scrolling stops (never while a finger is down). |
| `animateIn` | `true` | Headline rises and the eagle glides in on load. |
| `snow` | `true` | Falling snow on the night chapters. |
| `height` | `"100svh"` | Height of the pinned stage. Always a definite length. |
| `className` | `""` | Extra classes on the root. |

## Notes

- **Placement.** The component is a full page: it pins a `height`-tall stage
  and adds the scroll it needs below it (about 7 × `height`). Give it a parent
  with a width and nothing else. It reads `window` scroll.
- **Small screens.** Under 760px wide (a container query on the stage), the
  postcard turns portrait, the work chapter stacks the polaroid over its card,
  the map trail zig-zags down the page, and the nav becomes a `02 / 05` counter.
- **Theming.** It's art-directed, so the palette is its own. The paper colours
  are mixed slightly toward `--color-background`, so in dark mode they sit a
  touch dimmer instead of glaring.
- **Accessibility.** Each chapter is a labelled region, and only the one on
  screen is focusable (the others are `inert`). Buttons are real buttons and
  the headline is a real `<h1>`.
- **`prefers-reduced-motion`.** No pinning, tearing or animation: the five
  chapters stack into an ordinary long page, with the torn seams left in place
  as decoration.
