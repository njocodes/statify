import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Patterns",
  description: "When you listen: weekday and hour heatmap, months, calendar and sessions.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
