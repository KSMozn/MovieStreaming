import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Streamly — Find where to watch",
  description:
    "Search any movie and see where to stream it across Netflix, OSN, Prime Video, Shahid and Watch It.",
  icons: { icon: "/favicon.svg" }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <header className="border-b border-border bg-bg/80 backdrop-blur sticky top-0 z-20">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
            <a href="/" className="flex items-center gap-2 font-semibold">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/favicon.svg" alt="" className="w-6 h-6" />
              Streamly
            </a>
            <span className="text-xs text-white/50 ml-2">
              Find where to watch
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
        <footer className="max-w-5xl mx-auto px-4 py-10 text-xs text-white/40">
          Data from TMDb, Watchmode, and OMDb. Not affiliated with any provider.
        </footer>
      </body>
    </html>
  );
}
