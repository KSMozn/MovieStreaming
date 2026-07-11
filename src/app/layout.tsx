import "./globals.css";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { brand } from "@/lib/brand";
import { absoluteUrl, isIndexingEnabled, site } from "@/lib/site";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter"
});

const HOME_TITLE = "ReelSeek — Find What to Watch and Where to Stream It";
const HOME_DESCRIPTION =
  "Search movies and TV shows, compare streaming availability in your country, and find what to watch across supported services with ReelSeek.";

export const metadata: Metadata = {
  metadataBase: new URL(site.origin),
  title: {
    default: HOME_TITLE,
    template: `%s | ${site.name}`
  },
  description: HOME_DESCRIPTION,
  applicationName: site.name,
  alternates: {
    canonical: site.origin,
    types: { "application/atom+xml": absoluteUrl("/feed.xml") }
  },
  robots: isIndexingEnabled()
    ? { index: true, follow: true }
    : { index: false, follow: false },
  icons: {
    icon: [
      { url: "/brand/icons/favicon.svg", type: "image/svg+xml" },
      { url: "/brand/icons/favicon-32.png", sizes: "32x32", type: "image/png" }
    ],
    apple: "/brand/icons/apple-touch-icon.png"
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    url: site.origin,
    siteName: site.name,
    type: "website",
    locale: "en_US"
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION
  },
  verification: {
    ...(process.env.GOOGLE_SITE_VERIFICATION
      ? { google: process.env.GOOGLE_SITE_VERIFICATION }
      : {}),
    ...(process.env.BING_SITE_VERIFICATION
      ? { other: { "msvalidate.01": process.env.BING_SITE_VERIFICATION } }
      : {})
  }
};

export const viewport: Viewport = {
  themeColor: brand.colors.primary
};

const FOOTER_GROUPS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Product",
    links: [
      { label: "About", href: "/about" },
      { label: "How it works", href: "/how-it-works" },
      { label: "Where to watch", href: "/where-to-watch" },
      { label: "Get the app", href: "/#get-the-app" },
      { label: "FAQ", href: "/faq" }
    ]
  },
  {
    title: "Explore",
    links: [
      { label: "Movies", href: "/movies" },
      { label: "TV shows", href: "/tv-shows" },
      { label: "Streaming providers", href: "/providers" },
      { label: "Supported countries", href: "/supported-countries" },
      { label: "Guides", href: "/guides" }
    ]
  },
  {
    title: "Trust",
    links: [
      { label: "Data sources", href: "/data-sources" },
      { label: "Press", href: "/press" },
      { label: "Support", href: "/support" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" }
    ]
  }
];

export default function RootLayout({ children }: { children: ReactNode }) {
  const pathname = headers().get("x-pathname") ?? "/";
  const isArabic = pathname === "/ar" || pathname.startsWith("/ar/");

  return (
    <html
      lang={isArabic ? "ar" : "en"}
      dir={isArabic ? "rtl" : "ltr"}
      className={inter.variable}
    >
      <body className="min-h-screen font-sans">
        <header className="border-b border-border bg-bg/80 backdrop-blur sticky top-0 z-20">
          <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center gap-3">
            <Link href={isArabic ? "/ar" : "/"} aria-label={`${site.name} home`}>
              <Logo size={26} variant="dark-bg" />
            </Link>
            <nav aria-label="Primary" className="hidden md:flex items-center gap-4 ms-4 text-sm text-white/70">
              <Link href="/movies" className="hover:text-accent">Movies</Link>
              <Link href="/tv-shows" className="hover:text-accent">TV shows</Link>
              <Link href="/guides" className="hover:text-accent">Guides</Link>
            </nav>
            <Link
              href="/search"
              className="ms-auto text-sm text-white/80 hover:text-accent border border-border hover:border-accent rounded-lg px-3 py-1.5 transition"
            >
              {isArabic ? "البحث المتقدم" : "Advanced search"}
            </Link>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
        <footer className="border-t border-border mt-8">
          <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="space-y-3 col-span-2 md:col-span-1">
                <Logo size={20} variant="dark-bg" className="opacity-80" />
                <p className="text-xs text-white/50">{brand.slogan}</p>
                <p className="text-xs text-white/40">
                  <Link href="/ar" className="underline hover:text-accent">
                    العربية
                  </Link>
                  {" · "}
                  <Link href="/" className="underline hover:text-accent">
                    English
                  </Link>
                </p>
              </div>
              {FOOTER_GROUPS.map((group) => (
                <nav key={group.title} aria-label={group.title} className="space-y-2">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-white/40">
                    {group.title}
                  </h2>
                  <ul className="space-y-1.5">
                    {group.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="text-xs text-white/60 hover:text-accent"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              ))}
            </div>
            <div className="text-xs text-white/40 space-y-2 border-t border-border pt-6">
              <p>
                {site.name} is a streaming-discovery service. It does not host,
                stream, or sell movies or TV episodes. Availability depends on
                your country, can change at any time, and should be confirmed
                with the provider. Provider links lead to third-party services;{" "}
                {site.name} is not affiliated with any provider.
              </p>
              <p>
                Data from TMDb, Watchmode, and OMDb. This product uses the TMDb
                API but is not endorsed or certified by TMDb.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
