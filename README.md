# subikesh.github.io

Personal portfolio of **Subikesh P S** — Software Engineer 2 (Android) at Intuit.

The site is built to look and behave like a real **Android device**: hand-built Material 3
UI, dynamic color generated from the wallpaper, and a hash-router that acts as the Android
back stack. The audience is recruiters and engineers evaluating Android craft *through the
UI itself*.

## Tech stack

- [Vite](https://vitejs.dev/) + [React 19](https://react.dev/) + TypeScript
- Hand-built Material 3 (no UI library)
- [`@material/material-color-utilities`](https://www.npmjs.com/package/@material/material-color-utilities)
  for dynamic color schemes from wallpaper seeds

## Development

```bash
npm install
npm run dev        # Vite dev server (localhost:5173)
npm run build      # tsc --noEmit + vite build → dist/
npm run preview    # serve the production build (localhost:4173)
node scripts/optimize-images.mjs   # re-export /images → public/images/*.webp
```

Content is driven from the root `data.json` (the source of truth). See `CLAUDE.md` for the
full architecture and conventions.

## Deployment

Pushes to `master` trigger `.github/workflows/deploy.yml`, which builds the site and
publishes `dist/` to GitHub Pages (served at [subikesh.github.io](https://subikesh.github.io)).
The custom domain (`CNAME`) and the standalone sub-projects — `NewsBuddy`, `SurveyForm`,
`TributePage`, `favicon_io`, `app-ads.txt` — live under `public/` so they remain reachable
in the built output.

## Legacy

The previous static-HTML version of the site is preserved on the [`old_ui`](../../tree/old_ui)
branch.
