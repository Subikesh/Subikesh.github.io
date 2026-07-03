# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Static personal portfolio (`subikesh.github.io`) deployed via GitHub Pages from the `master` branch. Custom domain is configured through `CNAME`. Stack: hand-written HTML + Sass-compiled CSS + vanilla JS. No frameworks, no jQuery, no Bootstrap.

There is no build pipeline, no tests, and no lint. Do not invent one.

## Commands

- **Local preview** — serve from the repo root so absolute asset paths (`/images/...`, `/Resume.pdf`) resolve. Opening `index.html` via `file://` will break image loads.
  ```
  python -m http.server 8000
  ```
  Then open `http://localhost:8000/`.

- **Recompile Sass** — only when editing `css/style.sass`. Sass is not declared in a `package.json`, so use `npx sass` or a globally installed `sass`:
  ```
  npx sass --no-source-map css/style.sass css/style.css
  # or during active work:
  npx sass --watch css/style.sass:css/style.css
  ```

- **Deploy** — push to `master`; GitHub Pages publishes automatically.

## Architecture

- `index.html` is the portfolio entry point and a slim skeleton: a single scrolling page framed as a rounded "sheet" inset on a colored background. Sections in order: `#hero`, `#about`, `#work` (projects), `#resume`, `#contact`, plus a sticky header nav, a Material-style FAB, and an Android-style toast region. Each content region is an empty container marked with a `data-render="…"` attribute that `script.js` populates.
- `data.json` is the **single source of truth** for personal content (`meta`, `about`, `projects`, `resume`). To change displayed text, edit `data.json` — do not re-hardcode content in `index.html`. Projects support additive presentation fields: `frame` (`"phone"` renders an Android phone frame, `"browser"` a window frame) and `featured` (renders as the full-width accent panel).
- **Theming**: all colors/spacing are CSS custom properties in `css/style.sass` under `:root` (light) and `[data-theme="dark"]`. An inline script in `<head>` (before the stylesheet link — do not move it) sets `data-theme` from `localStorage.theme` or the OS preference to prevent dark-mode FOUC. `initTheme()` in `script.js` handles the `#theme-toggle` button and persistence. To change the accent color, edit the `--accent*` tokens only.
- `js/script.js` drives:
  - Fetch + render of `data.json` on `DOMContentLoaded` (meta, about, projects, resume, social links into nav/contact/footer).
  - `initTheme` (dark-mode toggle), `initNav` (mobile menu, header shrink on scroll, active-link highlight), `initReveals` (IntersectionObserver scroll reveals; reveals everything immediately under `prefers-reduced-motion`), `initFab` (FAB shows when hero scrolls away, scrolls to contact), `toast()` (Android-style pill notifications), `initCopyEmail` (clipboard + toast; email derived from the `mailto:` entry in `meta.social`).
  - **Sync contract**: the section ids `hero/about/work/resume/contact` are referenced by the header nav links in `index.html`, and by `SECTION_IDS`/`initFab` in `script.js`. Renaming a section requires updating all of them.
- **Renderer security note**: `script.js` HTML-escapes strings, except string entries in `resume.Skills.list[].ul[]`, which are written via `innerHTML` because they may intentionally contain inline `<i class="fab fa-…">` icon markup. Do **not** put untrusted input into those strings.
- The `<title>`, hero `<h1>` name/designation, and `<meta name="description">`/og/twitter tags are also hardcoded in `index.html` as SEO fallbacks for crawlers that don't run JS; the JS write is a no-op when values match `data.json`. Keep them in sync.
- Contact section embeds a Google Forms iframe (URL from `meta.contactFormUrl`) — there is no backend. The form cannot be themed, so `.form-card` deliberately stays light in both themes.
- Icons come from the Font Awesome kit script; `meta.social[].icon` classes in `data.json` depend on it — don't swap it for a plain FA CDN without checking those classes still resolve.
- `package-lock.json` exists with no `package.json`. Its deps (`chokidar`, etc.) are historical artifacts of a local Sass watcher setup. Treat it as inert unless you reintroduce a `package.json`.

## Subprojects

The repo also hosts three independent standalone pages under their own folders. They are **not** linked from `index.html` and each has its own `css/` (and sometimes `js/`) — they do not share styles with the root portfolio.

- `SurveyForm/index.html` — served at `/SurveyForm/`.
- `TributePage/index.html` — served at `/TributePage/`.
- `NewsBuddy/privacy_policy.html` — served at `/NewsBuddy/privacy_policy.html` (privacy policy host for an external Android app — `app-ads.txt` at the repo root is also for that app).

When editing one of these, scope changes to that folder; do not pull root `css/style.sass` into them.
