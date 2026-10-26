import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { StatifyProvider } from "@/lib/store/StatifyProvider";
import { Nav } from "@/components/Nav";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Statify – your Spotify stats",
  description: "Upload your Spotify extended streaming history and explore your stats. Everything is calculated in your browser.",
};

export const viewport: Viewport = { viewportFit: "cover", themeColor: "#0b0d0c" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <StatifyProvider>
          <Nav />
          <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-6">{children}</main>
        </StatifyProvider>
      </body>
    </html>
  );
}
