# Contributing

Thanks for helping! Small, focused pull requests are easiest to review.

## Setup

```bash
npm install
npm run dev
```

Before opening a PR run `npm run typecheck && npm run lint && npm test`.

## Ground rules

- **Privacy first:** no analytics, no uploading of listening data, no new third-party requests without a clear opt-in.
- **Never commit streaming history** (or screenshots that show someone else's data).
- Keep it static: no server routes or server-side compute.
- Mobile first: no horizontal scroll at 390 px, respect safe areas and `prefers-reduced-motion`.
- New UI text goes into every language: `src/lib/i18n/dict.ts` (English, German), `es.ts` and `fr.ts`. TypeScript fails the build if a key is missing.
- Be kind, see the [Code of Conduct](CODE_OF_CONDUCT.md).

## Add artists or genres

Genres come from curated lists in `src/lib/theme/genres.ts` (`LISTS`, `SUBGENRES`). Names are matched after `normalize()` (lowercase, no accents or punctuation), separated by `;`. Add the artist to the best-fitting genre and keep a name in only one list where possible.

## Add a theme

A theme is a `[data-theme="name"]` block of CSS variables in `src/app/globals.css` plus entries in `src/lib/theme/themes.ts`. Check contrast: text 4.5:1, large text and UI parts 3:1.

## Add a language

Copy `src/lib/i18n/es.ts` to a new file, translate the values, register it in `dict.ts` (`Lang`, `LANGS`, `dicts`) and add a blurb per theme in `src/lib/theme/themes.ts`.

## Bugs

Please include browser/device, steps, and the page. Do not attach your export files.
