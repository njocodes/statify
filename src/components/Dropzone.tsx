"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { useStatify } from "@/lib/store/StatifyProvider";
import { fmtInt } from "@/lib/format";

type Result = Awaited<ReturnType<ReturnType<typeof useStatify>["ingest"]>>;

export function Dropzone() {
  const { ingest, clear, t, extent, ready, settings } = useStatify();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<{ done: number; total: number } | null>(null);
  const [over, setOver] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handle(list: FileList | File[]) {
    const files = [...list].filter((f) => /\.(json|gz)$/i.test(f.name));
    if (!files.length) return;
    setBusy({ done: 0, total: files.length });
    setError(null);
    try {
      setResult(await ingest(files, (done, total) => setBusy({ done, total })));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  }

  const reason = (r: "not-json" | "basic-export" | "unknown") =>
    r === "basic-export" ? t("skippedBasic") : r === "not-json" ? t("skippedNotJson") : t("skippedUnknown");

  return (
    <div className="space-y-4">
      <div
        role="button"
        tabIndex={0}
        onClick={() => input.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && input.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          void handle(e.dataTransfer.files);
        }}
        className={`card flex cursor-pointer flex-col items-center gap-2 border-dashed px-6 py-14 text-center transition ${
          over ? "border-accent bg-surface2" : "hover:border-accentdim"
        }`}
      >
        <div className="text-lg font-semibold">{busy ? `${t("processing")} ${busy.done}/${busy.total}` : t("dropTitle")}</div>
        <div className="text-sm text-muted">{t("dropSub")}</div>
        <input
          ref={input}
          type="file"
          accept=".json,.gz,application/json,application/gzip"
          multiple
          hidden
          onChange={(e) => e.target.files && void handle(e.target.files)}
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {result && (
        <div className="card space-y-1 p-4 text-sm">
          <p>
            <b className="text-accent">{fmtInt(result.added, settings.lang)}</b> {t("added")} ·{" "}
            {fmtInt(result.duplicates, settings.lang)} {t("duplicates")}
          </p>
          {result.skipped.map((s, i) => (
            <p key={i} className="text-amber-400">
              {s.name} {reason(s.reason)}
            </p>
          ))}
        </div>
      )}

      {ready && extent?.first && (
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/" className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-onaccent hover:bg-accentdim">
            {t("openDashboard")}
          </Link>
          <button
            onClick={async () => {
              if (confirm(t("confirmDelete"))) {
                await clear();
                setResult(null);
              }
            }}
            className="rounded-full border border-line px-5 py-2.5 text-sm text-muted hover:text-fg"
          >
            {t("deleteData")}
          </button>
        </div>
      )}
    </div>
  );
}
