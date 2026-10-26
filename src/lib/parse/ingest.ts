import { classifyFile, dedupeKey, normalizeEntry, type Play, type RawEntry } from "./normalize";

export interface IngestResult {
  added: Play[];
  duplicates: number;
  invalid: number;
  /** files that were skipped, with a reason code for the UI */
  skipped: { name: string; reason: "not-json" | "basic-export" | "unknown" }[];
}

export interface ParsedFile {
  name: string;
  data: unknown;
}

/**
 * Merge freshly parsed files into an existing play set.
 * `known` is the set of dedupe keys already stored; it is extended in place.
 */
export function ingest(files: ParsedFile[], known: Set<string>): IngestResult {
  const added: Play[] = [];
  const skipped: IngestResult["skipped"] = [];
  let duplicates = 0;
  let invalid = 0;

  for (const f of files) {
    const kind = classifyFile(f.name, f.data);
    if (kind === "basic") {
      skipped.push({ name: f.name, reason: "basic-export" });
      continue;
    }
    if (kind === "unknown") {
      skipped.push({ name: f.name, reason: "unknown" });
      continue;
    }
    for (const raw of f.data as RawEntry[]) {
      const p = normalizeEntry(raw, kind === "video");
      if (!p) {
        invalid++;
        continue;
      }
      const k = dedupeKey(p);
      if (known.has(k)) {
        duplicates++;
        continue;
      }
      known.add(k);
      added.push(p);
    }
  }
  return { added, duplicates, invalid, skipped };
}
