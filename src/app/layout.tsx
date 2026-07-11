import "./globals.css";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import { Logo } from "@/components/brand/Logo";
import { brand } from "@/lib/brand";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter"
});

export const metadata: Metadata = {
  title: `${brand.name} — ${brand.slogan}`,
  description: brand.message,
  icons: {
    icon: [
      { url: "/brand/icons/favicon.svg", type: "image/svg+xml" },
      { url: "/brand/icons/favicon-32.png", sizes: "32x32", type: "image/png" }
    ],
    apple: "/brand/icons/apple-touch-icon.png"
  },
  openGraph: {
    title: `${brand.name} — ${brand.headline}`,
    description: brand.message,
    siteName: brand.name,
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: `${brand.name} — ${brand.headline}`,
    description: brand.message
  }
};

export const viewport: Viewport = {
  themeColor: brand.colors.primary
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen font-sans">
        <header className="border-b border-border bg-bg/80 backdrop-blur sticky top-0 z-20">
          <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center gap-3">
            <a href="/" aria-label={`${brand.name} home`}>
              <Logo size={26} variant="dark-bg" />
            </a>
            <span className="text-xs text-white/50 ml-2 hidden sm:inline">
              {brand.headline}
            </span>
            <a
              href="/search"
              className="ml-auto text-sm text-white/80 hover:text-accent border border-border hover:border-accent rounded-lg px-3 py-1.5 transition"
            >
              Advanced search
            </a>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
        <footer className="border-t border-border mt-8">
          <div className="max-w-5xl mx-auto px-4 py-10 text-xs text-white/40 space-y-3">
            <Logo size={20} variant="dark-bg" className="opacity-80" />
            <p>
              {brand.name} is a streaming-discovery service. It does not host,
              stream, or sell movies or TV episodes.
            </p>
            <p>
              Data from TMDb, Watchmode, and OMDb. This product uses the TMDb
              API but is not endorsed or certified by TMDb. Not affiliated with
              any streaming provider.
            </p>
            <p>
              <a
                href="https://ksmozn.github.io/MovieStreaming/privacy"
                className="underline hover:text-accent"
              >
                Privacy policy
              </a>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
