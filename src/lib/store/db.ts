import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { Play } from "../parse/normalize";

interface StatifyDB extends DBSchema {
  /** Plays are stored in chunks (key = running chunk number). */
  plays: { key: number; value: Play[] };
  covers: { key: string; value: { url: string | null; at: number } };
}

let dbp: Promise<IDBPDatabase<StatifyDB>> | null = null;

function db() {
  return (dbp ??= openDB<StatifyDB>("statify", 1, {
    upgrade(d) {
      d.createObjectStore("plays");
      d.createObjectStore("covers");
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
  await Promise.all([d.clear("plays"), d.clear("covers")]);
}

export async function getCover(uri: string) {
  return (await db()).get("covers", uri);
}

export async function putCover(uri: string, url: string | null) {
  await (await db()).put("covers", { url, at: Date.now() }, uri);
}
