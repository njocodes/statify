# Reference numbers for the vitest cross-check. Usage: python3 -I scripts/reference.py <export-dir>
import json, glob, os, sys
from datetime import datetime, timezone
d = sys.argv[1]
seen, plays = set(), []
for f in sorted(glob.glob(os.path.join(d, "Streaming_History_*.json"))):
    for r in json.load(open(f)):
        uri = r["spotify_track_uri"] or r["spotify_episode_uri"] or r["audiobook_chapter_uri"] or r["audiobook_uri"]
        if not uri: continue
        ts = int(datetime.strptime(r["ts"], "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc).timestamp() * 1000)
        k = (ts - r["ms_played"], uri, r["ms_played"])
        if k in seen: continue
        seen.add(k); plays.append((r, uri))
tr = [r for r, u in plays if r["spotify_track_uri"]]
print(json.dumps({
    "entries": len(plays),
    "tracks_entries": len(tr),
    "hours_tracks": round(sum(r["ms_played"] for r in tr) / 3.6e6, 3),
    "plays_30s": sum(1 for r in tr if r["ms_played"] >= 30000),
    "unique_tracks_30s": len({r["spotify_track_uri"] for r in tr if r["ms_played"] >= 30000}),
}))
