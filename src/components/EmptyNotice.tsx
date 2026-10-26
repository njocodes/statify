"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStatify } from "@/lib/store/StatifyProvider";

/** Shown by data pages while nothing is uploaded: hands over to the upload page instead of showing a dead end. */
export function EmptyNotice() {
  const { ready, extent } = useStatify();
  const router = useRouter();
  const empty = ready && !extent?.first;
  useEffect(() => {
    if (empty) router.replace("/");
  }, [empty, router]);
  return null;
}
