import type { Metadata } from "next";

export const metadata: Metadata = { title: "Compare", description: "Compare two periods of your listening side by side." };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
