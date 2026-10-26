"use client";
import { useEffect, useState } from "react";
import { getCover, putCover } from "@/lib/store/db";

// Only well-formed Spotify ids are sent out, and only thumbnails from Spotify's own CDNs are used.
const KINDS = new Set(["track", "episode", "show"]);
const TRACK_ID = /^[A-Za-z0-9]{22}$/;
const trustedImage = (u: unknown): string | null => {
  try {
    const url = new URL(String(u));
    return url.protocol === "https:" && /(^|\.)(scdn\.co|spotifycdn\.com)$/.test(url.hostname) ? url.href : null;
  } catch {
    return null;
  }
};

const mem = new Map<string, Promise<string | null>>();

export function fetchCover(uri: string): Promise<string | null> {
  let p = mem.get(uri);
  if (!p) {
    p = (async () => {
      const [, kind = "", id = ""] = uri.split(":");
      if (!KINDS.has(kind) || !TRACK_ID.test(id)) return null;
      // episodes were once looked up as tracks and cached as "no cover", so they use a fresh cache key
      const key = kind === "track" ? uri : `v2:${uri}`;
      const cached = await getCover(key).catch(() => undefined);
      if (cached) return cached.url;
      try {
        const r = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(`https://open.spotify.com/${kind}/${id}`)}`);
        const url = r.ok ? trustedImage((await r.json()).thumbnail_url) : null;
        await putCover(key, url).catch(() => {});
        return url;
      } catch {
        return null; // CORS/offline: fall back to placeholder, don't cache
      }
    })();
    mem.set(uri, p);
  }
  return p;
}

export function Cover({ uri, label, size = 44 }: { uri: string; label: string; size?: number }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    let off = false;
    fetchCover(uri).then((u) => !off && setSrc(u));
    return () => {
      off = true;
    };
  }, [uri]);
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" width={size} height={size} loading="lazy" className="shrink-0 rounded-md object-cover" style={{ width: size, height: size }} />
  ) : (
    <div
      className="flex shrink-0 items-center justify-center rounded-md bg-surface2 text-sm font-semibold text-muted"
      style={{ width: size, height: size }}
    >
      {label.slice(0, 1).toUpperCase()}
    </div>
  );
}
