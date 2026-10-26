import type { Metadata, Viewport } from "next";
import { Inter, Anton, Space_Mono, Fraunces } from "next/font/google";
import "./globals.css";
import { StatifyProvider } from "@/lib/store/StatifyProvider";
import { RegisterSW } from "@/components/RegisterSW";
import { ErrorBanner } from "@/components/ErrorBanner";
import { Footer } from "@/components/Footer";
import { PullToRefresh } from "@/components/PullToRefresh";
import { Nav } from "@/components/Nav";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
// Display fonts of the genre themes: only fetched by the browser when a theme uses them.
const anton = Anton({ subsets: ["latin"], preload: false, weight: "400", variable: "--font-anton" });
const spaceMono = Space_Mono({ subsets: ["latin"], preload: false, weight: ["400", "700"], variable: "--font-space-mono" });
const fraunces = Fraunces({ subsets: ["latin"], preload: false, weight: ["400", "600"], variable: "--font-fraunces" });

export const metadata: Metadata = {
  title: { default: "Statify – your Spotify stats", template: "%s – Statify" },
  description: "Upload your Spotify extended streaming history and explore your stats. Everything is calculated in your browser.",
  // home-screen app on iOS: no Safari bars, content runs under the status bar
  appleWebApp: { capable: true, title: "Statify", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = { viewportFit: "cover", themeColor: "#0b0d0c" };

// Applies the saved/auto theme before first paint so there is no flash of the wrong design.
const themeScript = `try{var s=JSON.parse(localStorage.getItem('statify.settings')||'{}');var t=s.theme&&s.theme!=='auto'?s.theme:localStorage.getItem('statify.autoTheme');if(t&&['classic','clean','paper','noir','mono','poster'].indexOf(t)>-1)document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const fonts = [inter, anton, spaceMono, fraunces].map((f) => f.variable).join(" ");
  return (
    <html lang="en" className={fonts} data-theme="classic" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="antialiased">
        <RegisterSW />
        <PullToRefresh />
        <StatifyProvider>
          <Nav />
          <main id="main" tabIndex={-1} className="mx-auto w-full max-w-6xl px-4 pb-32 pt-6 outline-none sm:pb-24">{children}<Footer /></main>
          <ErrorBanner />
        </StatifyProvider>
      </body>
    </html>
  );
}
