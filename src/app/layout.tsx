import type { Metadata, Viewport } from "next";
import { Inter, Bangers, Comic_Neue, Permanent_Marker, Patrick_Hand, Gochi_Hand, UnifrakturCook, Special_Elite } from "next/font/google";
import "./globals.css";
import { StatifyProvider } from "@/lib/store/StatifyProvider";
import { Nav } from "@/components/Nav";
import { SvgDefs } from "@/components/SvgDefs";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
// Display/body fonts of the drawn themes: only fetched by the browser when a theme uses them.
const bangers = Bangers({ subsets: ["latin"], preload: false, weight: "400", variable: "--font-bangers" });
const comicNeue = Comic_Neue({ subsets: ["latin"], preload: false, weight: ["400", "700"], variable: "--font-comic-neue" });
const marker = Permanent_Marker({ subsets: ["latin"], preload: false, weight: "400", variable: "--font-marker" });
const patrick = Patrick_Hand({ subsets: ["latin"], preload: false, weight: "400", variable: "--font-patrick" });
const gochi = Gochi_Hand({ subsets: ["latin"], preload: false, weight: "400", variable: "--font-gochi" });
const fraktur = UnifrakturCook({ subsets: ["latin"], preload: false, weight: "700", variable: "--font-fraktur" });
const elite = Special_Elite({ subsets: ["latin"], preload: false, weight: "400", variable: "--font-elite" });

export const metadata: Metadata = {
  title: { default: "Statify – your Spotify stats", template: "%s – Statify" },
  description: "Upload your Spotify extended streaming history and explore your stats. Everything is calculated in your browser.",
};

export const viewport: Viewport = { viewportFit: "cover" };

// Applies the saved/auto theme before first paint so there is no flash of the wrong design.
const themeScript = `try{var s=JSON.parse(localStorage.getItem('statify.settings')||'{}');var t=s.theme&&s.theme!=='auto'?s.theme:localStorage.getItem('statify.autoTheme');if(t)document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const fonts = [inter, bangers, comicNeue, marker, patrick, gochi, fraktur, elite].map((f) => f.variable).join(" ");
  return (
    <html lang="en" className={fonts} data-theme="classic" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="antialiased">
        <SvgDefs />
        <StatifyProvider>
          <Nav />
          <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-6">{children}</main>
        </StatifyProvider>
      </body>
    </html>
  );
}
