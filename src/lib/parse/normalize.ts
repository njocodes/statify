// Raw Spotify "Extended Streaming History" entry -> compact Play.
// IPs, usernames and user agents are dropped here and never stored.

export type RawEntry = Record<string, unknown>;

export type Kind = "track" | "episode" | "audiobook";

export interface Play {
  /** Start of the play in epoch ms (ts is the END of the play in the export). */
  start: number;
  ms: number;
  kind: Kind;
  /** spotify:track:… / spotify:episode:… / audiobook chapter uri */
  uri: string;
  title: string;
  /** artist for tracks, show for episodes, audiobook title for audiobooks */
  artist: string;
  album: string;
  platform: string;
  country: string;
  reasonStart: string;
  reasonEnd: string;
  shuffle: boolean;
  skipped: boolean;
  offline: boolean;
  incognito: boolean;
  video: boolean;
}

export function dedupeKey(p: Pick<Play, "start" | "uri" | "ms">): string {
  return `${p.start}|${p.uri}|${p.ms}`;
}

const str = (v: unknown): string => (typeof v === "string" ? v : "");

/** "ios", "iOS 15.5 (iPhone12,1)", "Windows 10 (10.0.19042; x64; AppX)", "osx", … */
export function normalizePlatform(raw: string): string {
  const p = raw.toLowerCase();
  if (!p) return "Unknown";
  if (p.includes("ipad")) return "iPad";
  if (p.startsWith("ios") || p.includes("iphone")) return "iPhone";
  if (p.includes("android")) return "Android";
  if (p.startsWith("windows")) return "Windows";
  if (p.startsWith("osx") || p.includes("os x") || p.includes("macos") || p.includes("mac os")) return "macOS";
  if (p.includes("linux")) return "Linux";
  if (p.includes("web_player") || p.includes("web player") || p.includes("webplayer")) return "Web Player";
  if (p.includes("chromecast") || p.includes("cast")) return "Chromecast";
  if (p.includes("partner") || p.includes("sonos") || p.includes("tv") || p.includes("playstation")) return "Speaker / TV";
  return "Other";
}

/** Returns null for entries that are not a playable item (e.g. foreign JSON shapes). */
export function normalizeEntry(e: RawEntry, video = false): Play | null {
  const ts = Date.parse(str(e.ts));
  const ms = typeof e.ms_played === "number" ? e.ms_played : NaN;
  if (Number.isNaN(ts) || Number.isNaN(ms)) return null;

  let kind: Kind;
  let uri: string;
  let title: string;
  let artist: string;
  let album: string;

  if (str(e.spotify_track_uri)) {
    kind = "track";
    uri = str(e.spotify_track_uri);
    title = str(e.master_metadata_track_name);
    artist = str(e.master_metadata_album_artist_name);
    album = str(e.master_metadata_album_album_name);
  } else if (str(e.spotify_episode_uri)) {
    kind = "episode";
    uri = str(e.spotify_episode_uri);
    title = str(e.episode_name);
    artist = str(e.episode_show_name);
    album = "";
  } else if (str(e.audiobook_chapter_uri) || str(e.audiobook_uri)) {
    kind = "audiobook";
    uri = str(e.audiobook_chapter_uri) || str(e.audiobook_uri);
    title = str(e.audiobook_chapter_title);
    artist = str(e.audiobook_title);
    album = "";
  } else {
    return null;
  }

  return {
    start: ts - ms,
    ms,
    kind,
    uri,
    title,
    artist,
    album,
    platform: normalizePlatform(str(e.platform)),
    country: str(e.conn_country),
    reasonStart: str(e.reason_start) || "unknown",
    reasonEnd: str(e.reason_end) || "unknown",
    shuffle: e.shuffle === true,
    skipped: e.skipped === true,
    offline: e.offline === true,
    incognito: e.incognito_mode === true,
    video,
  };
}

export type FileKind = "audio" | "video" | "basic" | "unknown";

/** Classify an uploaded file by name + first element. */
export function classifyFile(name: string, data: unknown): FileKind {
  if (!Array.isArray(data)) return "unknown";
  if (/^StreamingHistory_(music|podcast)_/i.test(name)) return "basic";
  const first = data[0] as RawEntry | undefined;
  if (first && "endTime" in first && "trackName" in first) return "basic";
  if (/Streaming_History_Video/i.test(name)) return "video";
  if (/Streaming_History_Audio/i.test(name)) return "audio";
  if (first && "ts" in first && "ms_played" in first) return "audio";
  return "unknown";
}
