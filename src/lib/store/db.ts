import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { Play } from "../parse/normalize";

interface StatifyDB extends DBSchema {
  /** Plays are stored in chunks (key = running chunk number). */
  plays: { key: number; value: Play[] };
  covers: { key: string; value: { url: string | null; at: number } };
  /** genre lookups (MusicBrainz), keyed by normalized artist name; genre null = looked up, nothing usable found */
  genres: { key: string; value: { genre: string | null; at: number } };
}

let dbp: Promise<IDBPDatabase<StatifyDB>> | null = null;

function db() {
  return (dbp ??= openDB<StatifyDB>("statify", 2, {
    upgrade(d) {
      if (!d.objectStoreNames.contains("plays")) d.createObjectStore("plays");
      if (!d.objectStoreNames.contains("covers")) d.createObjectStore("covers");
      if (!d.objectStoreNames.contains("genres")) d.createObjectStore("genres");
    },
    // a newer tab wants to upgrade: let go of this connection instead of blocking it
    blocking() {
      void dbp?.then((d) => d.close());
      dbp = null;
    },
  }));
}

const CHUNK = 20_000;

export async function loadPlays(): Promise<Play[]> {
  const d = await db();
  const chunks = await d.getAll("plays");
  return chunks.flat();
}

export async function appendPlays(added: Play[]): Promise<void> {
  if (!added.length) return;
  const d = await db();
  const next = (await d.count("plays")) + 1_000_000; // keys only need to be unique + ordered
  const tx = d.transaction("plays", "readwrite");
  for (let i = 0; i * CHUNK < added.length; i++) {
    void tx.store.put(added.slice(i * CHUNK, (i + 1) * CHUNK), next + i + Date.now());
  }
  await tx.done;
}

export async function clearAll(): Promise<void> {
  const d = await db();
  await Promise.all([d.clear("plays"), d.clear("covers"), d.clear("genres")]);
}

export async function getCover(uri: string) {
  return (await db()).get("covers", uri);
}

export async function putCover(uri: string, url: string | null) {
  await (await db()).put("covers", { url, at: Date.now() }, uri);
}

export async function loadGenreCache(): Promise<Map<string, string | null>> {
  const d = await db();
  const [keys, vals] = await Promise.all([d.getAllKeys("genres"), d.getAll("genres")]);
  return new Map(keys.map((k, i) => [k, vals[i].genre]));
}

export async function putGenre(key: string, genre: string | null) {
  await (await db()).put("genres", { genre, at: Date.now() }, key);
}
