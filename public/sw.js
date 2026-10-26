// Statify service worker: keeps the app usable offline.
// - hashed build files (/_next/static/): cache first, they never change
// - pages and everything else on this origin: network first, last good copy as offline fallback
// - cover images from Spotify's CDN: cache first with a size cap
const VERSION = "statify-v2";
const STATIC = `${VERSION}-static`;
const PAGES = `${VERSION}-pages`;
const IMAGES = `${VERSION}-images`;
const MAX_IMAGES = 400;

const ROUTES = ["/", "/dashboard/", "/patterns/", "/behavior/", "/discovery/", "/trends/", "/genres/", "/compare/", "/podcasts/", "/wrapped/", "/item/", "/settings/"];

// Pre-cache every page and the build files it references, so all sections open offline right after the first visit.
async function precache() {
  const pages = await caches.open(PAGES);
  const files = await caches.open(STATIC);
  const assets = new Set();
  await Promise.all(
    ROUTES.map(async (r) => {
      try {
        const res = await fetch(r);
        if (!res.ok) return;
        const html = await res.clone().text();
        for (const m of html.matchAll(/\/_next\/static\/[^"'\s\\)]+/g)) assets.add(m[0]);
        await pages.put(r, res);
      } catch {}
    }),
  );
  await Promise.all([...assets].map((a) => files.add(a).catch(() => {})));
  // The Web Worker and its chunks are only named inside the JS bundles (without the /_next/ prefix), so scan those too.
  const extra = new Set();
  await Promise.all(
    [...assets]
      .filter((a) => a.endsWith(".js"))
      .map(async (a) => {
        try {
          const js = await (await files.match(a)).text();
          for (const m of js.matchAll(/static\/chunks\/[\w.-]+\.js/g)) if (!assets.has("/_next/" + m[0])) extra.add("/_next/" + m[0]);
        } catch {}
      }),
  );
  await Promise.all([...extra].map((a) => files.add(a).catch(() => {})));
}

self.addEventListener("install", (e) => {
  e.waitUntil(precache().then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    (async () => {
      for (const k of await caches.keys()) if (!k.startsWith(VERSION)) await caches.delete(k);
      await self.clients.claim();
    })(),
  );
});

async function networkFirst(req) {
  const cache = await caches.open(PAGES);
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch {
    const hit = await cache.match(req, { ignoreSearch: req.mode === "navigate" });
    if (hit) return hit;
    if (req.mode === "navigate") return (await cache.match("/dashboard/")) || (await cache.match("/")) || Response.error();
    return Response.error();
  }
}

async function cacheFirst(req, name, limit) {
  const cache = await caches.open(name);
  // the worker entry carries its chunk list in the query string, which may differ from the precached copy
  const hit = await cache.match(req, { ignoreSearch: /turbopack-worker/.test(req.url) });
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok || res.type === "opaque") {
    cache.put(req, res.clone());
    if (limit) {
      const keys = await cache.keys();
      if (keys.length > limit) await cache.delete(keys[0]);
    }
  }
  return res;
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin === self.location.origin) {
    if (url.pathname.startsWith("/_next/static/")) return e.respondWith(cacheFirst(req, STATIC));
    return e.respondWith(networkFirst(req));
  }
  if (req.destination === "image" && /(scdn\.co|spotifycdn\.com)$/.test(url.hostname)) e.respondWith(cacheFirst(req, IMAGES, MAX_IMAGES));
});
