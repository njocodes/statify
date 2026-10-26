import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Behavior",
  description: "Skips, shuffle, devices, countries and how your tracks start and end.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
