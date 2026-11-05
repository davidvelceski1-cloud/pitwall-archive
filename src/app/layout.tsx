import type { Metadata, Viewport } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { AskPanel } from "@/components/ask/AskPanel";
import { SITE_URL } from "@/lib/utils";

const inter = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-inter", display: "swap" });
const serif = Instrument_Serif({ subsets: ["latin", "latin-ext"], weight: "400", style: ["normal", "italic"], variable: "--font-serif-display", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Pitwall Archive — Formula 1 history, 1950 to today", template: "%s · Pitwall Archive" },
  description: "Every season. Every team. Every driver. An AI-assisted encyclopedia of Formula 1 history from 1950 to today.",
  openGraph: { siteName: "Pitwall Archive", type: "website" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafb" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0e13" },
  ],
};

// Applies the saved/OS theme before first paint to avoid a flash.
// A ?theme=light|dark query parameter overrides both (handy for sharing and screenshots).
const THEME_SCRIPT = `try{var t=new URLSearchParams(location.search).get("theme")||localStorage.getItem("theme");if(t==="dark"||(!t&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${serif.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-screen font-sans antialiased">
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
        <CommandPalette />
        <AskPanel />
      </body>
    </html>
  );
}
