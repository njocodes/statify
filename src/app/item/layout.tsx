import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Details",
  description: "Plays, listening time and history for one artist, album or track.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
