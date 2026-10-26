import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Design",
  description: "Pick a design or let Statify match it to your music.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
