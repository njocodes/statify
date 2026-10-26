"use client";
import { useEffect, useState } from "react";
import { getCover, putCover } from "@/lib/store/db";

const mem = new Map<string, Promise<string | null>>();

export function fetchCover(uri: string): Promise<string | null> {
  let p = mem.get(uri);
  if (!p) {
    p = (async () => {
      const cached = await getCover(uri).catch(() => undefined);
      if (cached) return cached.url;
      const id = uri.split(":")[2];
      try {
        const r = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(`https://open.spotify.com/track/${id}`)}`);
        const url: string | null = r.ok ? ((await r.json()).thumbnail_url ?? null) : null;
        await putCover(uri, url).catch(() => {});
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
