# Statify

Upload your Spotify **Extended streaming history** (`Streaming_History_Audio_*.json`) and explore your stats.
Everything is calculated in your browser (Web Worker + IndexedDB) – no file ever leaves your device.

- Next.js (App Router, static export), TypeScript, Tailwind
- Overview, patterns, behavior, discovery, podcasts, detail pages and search
- Genre-based drawn designs (automatic or manual)
- DE / EN

## Develop

```bash
npm install
npm run dev
npm test        # vitest (the real-data tests run only if the export folder is present)
npm run build   # static export to ./out
```

Statify is not affiliated with Spotify.
