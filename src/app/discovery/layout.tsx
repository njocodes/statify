import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Discovery",
  description: "New artists per month, your artist ranking by year and forgotten favourites.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
