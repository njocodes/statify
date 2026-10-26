import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Overview",
  description: "Hours, plays and your top tracks, artists and albums.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
