"use client";

// Poster + trailer viewer in the title-page media column. The visitor swipes
// (or uses the Poster/Trailer tabs) between the poster and the official
// trailer. The trailer is a facade: YouTube is only loaded once the visitor
// clicks play, and it's embedded through the privacy-enhanced no-cookie player.
// The trailer key always comes from TMDb's curated /videos data.

import { useRef, useState } from "react";
import { youtubeEmbedUrl, youtubeThumb, type Trailer } from "@/lib/trailer";
import { titleStrings, type Locale } from "@/lib/title-i18n";

const WRAP =
  "w-full max-w-[240px] mx-auto md:max-w-none md:mx-0";

export function PosterGallery({
  posterUrl,
  title,
  trailer,
  locale = "en"
}: {
  posterUrl: string | null;
  title: string;
  trailer: Trailer | null;
  locale?: Locale;
}) {
  const t = titleStrings(locale).gallery;
  const scroller = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);

  const poster = (
    <div className="aspect-[2/3] bg-surface2">
      {posterUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={posterUrl}
          alt={`${title} poster`}
          className="w-full h-full object-cover"
        />
      ) : null}
    </div>
  );

  // No trailer → plain poster, identical to the original layout.
  if (!trailer) {
    return (
      <div
        className={`${WRAP} bg-surface border border-border rounded-xl overflow-hidden`}
      >
        {poster}
      </div>
    );
  }

  function goTo(i: number) {
    const el = scroller.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
    setActive(i);
  }

  function onScroll() {
    const el = scroller.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== active) setActive(i);
  }

  return (
    <div className={`${WRAP} space-y-2`}>
      <div
        ref={scroller}
        onScroll={onScroll}
        className="flex overflow-x-auto snap-x snap-mandatory rounded-xl border border-border bg-surface [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="w-full shrink-0 snap-center">{poster}</div>

        <div className="w-full shrink-0 snap-center">
          <div className="aspect-[2/3] bg-black flex items-center justify-center">
            {playing ? (
              <div className="w-full aspect-video">
                <iframe
                  src={youtubeEmbedUrl(trailer.key, true)}
                  title={trailer.name || `${title} trailer`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setPlaying(true)}
                aria-label={t.playTrailer}
                className="group relative block w-full h-full"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={youtubeThumb(trailer.key)}
                  alt=""
                  className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition"
                />
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="flex items-center justify-center w-14 h-14 rounded-full bg-black/60 group-hover:bg-accent transition">
                    <svg viewBox="0 0 24 24" aria-hidden className="w-6 h-6 fill-white ms-0.5">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2">
        {[t.poster, t.trailer].map((label, i) => (
          <button
            key={label}
            type="button"
            onClick={() => goTo(i)}
            aria-current={active === i ? "true" : undefined}
            className={`text-xs px-2.5 py-1 rounded-full border transition ${
              active === i
                ? "border-accent text-accent bg-accent/10"
                : "border-border text-white/60 hover:text-white/80"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
