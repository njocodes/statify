import { describe, expect, it } from "vitest";
import type { Play } from "../parse/normalize";
import { dedupeKey } from "../parse/normalize";
import { ingest } from "../parse/ingest";
import { habits, milestones, onThisDay, periods } from "../stats/extras";
import { DEFAULT_MIN_PLAY_MS, overview, type Filter } from "../stats/core";

// Made-up listening data, so these tests run anywhere and contain nothing personal.
const f: Filter = { from: null, to: null, minPlayMs: DEFAULT_MIN_PLAY_MS, tz: "UTC" };
const T0 = Date.UTC(2024, 5, 15, 12, 0, 0);
const MIN = 60_000;

const play = (o: Partial<Play> & Pick<Play, "start">): Play => ({
  ms: 3 * MIN,
  kind: "track",
  uri: "spotify:track:aaaaaaaaaaaaaaaaaaaaaa",
  title: "Song",
  artist: "Artist",
  album: "Album",
  platform: "iPhone",
  country: "DE",
  reasonStart: "trackdone",
  reasonEnd: "trackdone",
  shuffle: false,
  skipped: false,
  offline: false,
  incognito: false,
  video: false,
  ...o,
});

describe("overview", () => {
  it("counts plays only above the threshold but minutes always", () => {
    const plays = [play({ start: T0 }), play({ start: T0 + 10 * MIN, ms: 10_000 })];
    const o = overview(plays, f);
    expect(o.plays).toBe(1);
    expect(o.rawEntries).toBe(2);
    expect(o.totalMs).toBe(3 * MIN + 10_000);
  });
});

describe("habits", () => {
  it("finds skipped tracks, repeats and albums listened through", () => {
    const plays: Play[] = [];
    // a track that is skipped 12 times out of 12
    for (let i = 0; i < 12; i++) plays.push(play({ start: T0 + i * 20 * MIN, ms: 5_000, uri: "spotify:track:skipskipskipskipskipsk", title: "Skipper", skipped: true, shuffle: true }));
    // the same track played twice in a row
    const rep = { uri: "spotify:track:repeatrepeatrepeatrepea", title: "Again" };
    plays.push(play({ start: T0 + 500 * MIN, ...rep }), play({ start: T0 + 503 * MIN + 5_000, ...rep }));
    // six different tracks of one album back to back
    for (let i = 0; i < 6; i++) plays.push(play({ start: T0 + 800 * MIN + i * 3 * MIN, uri: `spotify:track:album${String(i).padStart(17, "x")}`, title: `T${i}`, album: "Full Album", artist: "Band" }));
    const h = habits(plays, f);
    expect(h.skipRateShuffle).toBe(1);
    expect(h.skippedTracks[0]?.title).toBe("Skipper");
    expect(h.repeats[0]?.title).toBe("Again");
    expect(h.repeats[0]?.value).toBe(1);
    expect(h.albumRuns.map((a) => a.title)).toContain("Full Album");
  });
});

describe("milestones, periods, this day", () => {
  it("reports crossed play milestones", () => {
    const plays = Array.from({ length: 1001 }, (_, i) => play({ start: T0 + i * 4 * MIN, uri: `spotify:track:t${String(i).padStart(21, "x")}` }));
    const m = milestones(plays, f);
    expect(m.some((x) => x.kind === "plays" && x.value === 1000)).toBe(true);
  });

  it("summarises each period separately", () => {
    const y23 = Date.UTC(2023, 0, 1);
    const y24 = Date.UTC(2024, 0, 1);
    const y25 = Date.UTC(2025, 0, 1);
    const plays = [play({ start: y23 + MIN }), play({ start: y24 + MIN }), play({ start: y24 + 10 * MIN, uri: "spotify:track:bbbbbbbbbbbbbbbbbbbbbb" })];
    const [a, b] = periods(plays, f, [
      { from: y23, to: y24 },
      { from: y24, to: y25 },
    ]);
    expect(a.plays).toBe(1);
    expect(b.plays).toBe(2);
    expect(b.tracks).toBe(2);
  });

  it("groups plays of the same calendar day across years", () => {
    const plays = [play({ start: Date.UTC(2022, 5, 15, 9) }), play({ start: Date.UTC(2024, 5, 15, 9) }), play({ start: Date.UTC(2024, 6, 1, 9) })];
    expect(onThisDay(plays, f, "06-15").map((d) => d.year).sort()).toEqual(["2022", "2024"]);
  });
});

describe("ingest", () => {
  it("drops duplicates and keeps the key stable", () => {
    const row = { ts: "2024-06-15T12:03:00Z", ms_played: 180000, master_metadata_track_name: "Song", master_metadata_album_artist_name: "Artist", master_metadata_album_album_name: "Album", spotify_track_uri: "spotify:track:aaaaaaaaaaaaaaaaaaaaaa", ip_addr: "203.0.113.9" };
    const known = new Set<string>();
    const res = ingest([{ name: "Streaming_History_Audio_2024_0.json", data: [row, row] }], known);
    expect(res.added).toHaveLength(1);
    expect(res.duplicates).toBe(1);
    expect(JSON.stringify(res.added)).not.toContain("203.0.113.9");
    expect(dedupeKey(res.added[0])).toBe(`${res.added[0].start}|spotify:track:aaaaaaaaaaaaaaaaaaaaaa|180000`);
  });
});
