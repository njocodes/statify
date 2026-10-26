import type { Metadata } from "next";

export const metadata: Metadata = { title: "Genres", description: "How your genre mix changed over the years, split into sub-genres." };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
