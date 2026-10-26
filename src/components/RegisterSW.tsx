"use client";
import { useEffect } from "react";

/** Registers the offline service worker (production only, so dev reloads are never served stale). */
export function RegisterSW() {
  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);
  return null;
}
