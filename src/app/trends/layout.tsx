import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trends",
  description: "Which artists and tracks are rising, fading or coming back in your listening.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
