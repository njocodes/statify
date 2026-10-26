import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Podcasts",
  description: "Top shows and episodes from your streaming history.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
