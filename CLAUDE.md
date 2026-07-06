# Portfolio Subi — Android-device portfolio site

Personal portfolio of Subikesh P S (SE2 Android @ Intuit) that looks and behaves like a real
Android device. The audience is recruiters/engineers evaluating Android craft **through the UI
itself** — Material 3 fidelity is a feature, not decoration. Judge every change by "would this
feel right on a Pixel?"

## Commands

```
npm run dev        # Vite dev server (localhost:5173)
npm run build      # tsc --noEmit + vite build → dist/   (then delete dist/_phone.html before deploy)
npm run preview    # serve dist/ (localhost:4173)
node scripts/optimize-images.mjs   # re-export /images → public/images/*.webp (max 1280w, q82)
```

No test framework; verification is done by driving the app in a browser (see Verification below).

## Hard rules

- **`data.json` (repo root) is the source of truth for all content.** Never invent facts (names,
  dates, project claims, links). The app imports `src/data.json` — a copy whose image paths point
  at `.webp`. If root `data.json` changes, re-sync `src/data.json` (keep the `.webp` extensions).
- **`app-ads.txt` must ship at the site root unchanged** (AdMob requirement).
- **`NewsBuddy/privacy_policy.html` must stay reachable** at `/NewsBuddy/privacy_policy.html`
  (linked from the NewsBuddy project detail; the Play Store listing points at it).
- **`public/_phone.html` is a dev-only phone-viewport harness — it must not ship.** The build
  step deletes it from `dist/` manually; keep it that way until it's automated.
- `/images` (repo root) holds the original screenshots; treat as source material. The site serves
  the generated `public/images/*.webp` only.

## Architecture (src/)

- **Routing = Android back stack.** The URL hash is the stack: `#` home, `#projects` app,
  `#projects/newsbuddy-ai` in-app page, `#search` overlay. `SystemContext.navigate/goBack/goHome`
  stamp `history.state.d` (depth of entries *we* pushed) so browser-back == Android back even on
  deep links. Never push history entries any other way.
- `system/SystemContext.tsx` — global state: route, device (`phone` <840px or portrait, else
  `tablet`), theme prefs (persisted to localStorage keys `wallpaper`, `mode`), shade state, and
  `launchRects` (last-tapped icon rect per app id, the launch-animation origin).
- `system/AppHost.tsx` — mounts the open app; Android-12-style launch/close: clip-path reveal
  from the icon rect + splash layer (icon on primary-container) fading into content. Re-open
  during close is handled via an `openGen` counter — don't "simplify" it away.
- `apps/registry.ts` — the app list. To add an app: component in `apps/`, entry in `APPS`
  (id = hash segment), icon in `ui/Icon.tsx`. `LINK_APPS` open external URLs in a new tab.
- `theme/theme.ts` — full M3 scheme built from tonal palettes via `@material/material-color-utilities`
  (same algorithm as Android dynamic color), applied as `--md-*` CSS vars. Wallpapers each carry a
  seed color (`WALLPAPERS`); the wallpaper SVG uses a separate `--wp-*` palette with richer tones
  than UI surfaces — **don't color the wallpaper with surface tokens**, dark-mode icons vanish
  against it (learned the hard way).
- `ui/Icon.tsx` — hand-rolled Material Symbols paths (no icon font; keeps bundle small). Default
  viewBox 24×24; non-24px art (e.g. `newsbuddy` logo, 1024×1024) registers in `ICON_VIEWBOXES`.
- `ui/Pressable.tsx` — button with M3 ripple (`spawnRipple`) + hover state layer. All tappable
  surfaces go through this (or add `ripple-host state-layer` + `onPointerDown={spawnRipple}` to links).
- Styles are plain CSS in `src/styles/` (base = reset/type/ripple, shell = home/status/nav/shade,
  apps = scaffold + M3 components, appviews = per-app). Tablet overrides live under
  `.device[data-device='tablet']`. No CSS framework — match existing token/var usage.
- **Shade (`system/Shade.tsx`) visibility is pure CSS transitions on `.open`, mounted forever after
  first open.** It was originally WAAPI-with-unmount and a missed `onfinish` left an invisible
  scrim blocking all input. Keep overlays CSS-driven.

## M3 conventions

- Colors only via `--md-*` roles; motion via `--ease-emphasized*` + `--dur-*`; type via the
  `.title-large`/`.body-medium`/… classes. Scrollbars are hidden globally (it's a "device").
- Scroll containers inside flex columns need `min-height: 0` (the tablet Projects detail pane
  bug). `AppScreen` provides the medium-top-app-bar scaffold; two-pane layouts compose `TopBar`
  + own panes instead.

## Verification workflow

- Drive the real app: dev server + Chrome MCP tools. Phone viewport: `/_phone.html` (412px iframe).
- Chrome MCP gotchas (cost hours): the `zoom` action can corrupt a tab's screenshot pipeline
  (stale device-metrics override → cropped captures) — open a **new tab** to recover; synthetic
  wheel-scroll doesn't reach iframe scrollers; screenshots JPEG-crush dark UI. When pixels look
  wrong, audit geometry/computed styles via `javascript_tool` before touching code.
- The user tests live in their own browser during sessions and sends feedback — expect localStorage
  to hold non-default theme state, and don't fight concurrent window resizes.

## Known deferred work

Phone below-fold visual pass (project-detail buttons, Contact's embedded Google Form, Settings
easter egg), swipe gestures (shade pull-down, home swipe-up), automating `_phone.html` exclusion
from builds, hosting/deploy (user decision pending; hash routing needs no server config).
