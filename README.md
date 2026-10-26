<div align="center">

<img src="public/icon-192.png" alt="Statify" width="96" height="96" />

# Statify

**Your Spotify listening history, drawn in the style of your music.**

[statify.njo.quest](https://statify.njo.quest) · [Report a bug](https://github.com/njocodes/statify/issues) · MIT licensed

</div>

Upload the **Extended streaming history** you can request from Spotify and explore it: top lists, listening patterns, skips and repeats, discovery, trends, genres, a year-in-review story and more. The whole app is a static site. **Your files are processed in your browser and never uploaded.**

## Features

- **Overview, patterns, behavior, discovery, podcasts** with a global period filter
- **Trends** (what is rising, falling, coming back), **phases** and **milestones**, "on this day", period comparison
- **Genres** with sub-genres, detected from a curated artist list; optional lookup of unknown artists on [MusicBrainz](https://musicbrainz.org)
- **Restrained designs per genre** (6 themes: Classic, Clean, Paper, Noir, Mono, Poster; automatic or manual) with a mascot that reacts to your taste, and an accent colour from your album covers or your own, text size and reduced motion
- **Wrapped**: a full-screen story per year or all time, exportable as an image
- **Habits**: skip rates, most-skipped tracks, repeats, albums you listen to start to finish
- **Backup**: save everything as one file (Settings) and load it on another device
- Installable **PWA** that works offline, English, German, Spanish and French, comfortable or compact density, keyboard friendly, respects reduced motion

## Privacy

- Parsing and statistics run in a Web Worker; plays are stored in your browser (IndexedDB). IP addresses in the export are dropped while parsing and never stored.
- There is no server code, no accounts, no analytics.
- Network requests that do happen: album cover thumbnails (Spotify's public oEmbed endpoint and image CDN, only Spotify IDs of visible items) and, **only if you press the button in Settings**, artist names to MusicBrainz.
- "Delete data" in Settings clears everything stored.

## Get your data

Spotify account → Privacy → *Download your data* → select **Extended streaming history**. It arrives by email after a few days as a ZIP with `Streaming_History_Audio_*.json` files. Upload those files (several at once is fine; overlapping exports are de-duplicated).

## Develop

```bash
npm install
npm run dev
npm run typecheck && npm run lint
npm test
npm run build    # static export to ./out
```

Stack: Next.js (App Router, static export), TypeScript, Tailwind CSS 4, Recharts, `idb`. Layout:

| Path | What |
| --- | --- |
| `src/app` | pages, global styles and the theme blocks |
| `src/lib/parse` | export schema and normalisation |
| `src/lib/stats` | pure aggregation functions |
| `src/lib/worker` | the Web Worker that owns the data |
| `src/lib/theme` | genres, themes, cover colour |
| `public/sw.js` | offline service worker |

To test with your own data, put the export in `Spotify Extended Streaming History/` (git-ignored). **Never commit listening data.**

## Contributing

Issues and pull requests are welcome, see [CONTRIBUTING.md](CONTRIBUTING.md). The easiest contribution is teaching Statify more artists and genres.

## Disclaimer

Statify is an independent hobby project. It is **not affiliated with, endorsed by or sponsored by Spotify**. Spotify is a trademark of Spotify AB. Cover thumbnails belong to their respective owners.

## License

[MIT](LICENSE)
