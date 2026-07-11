"use client";

// Interactive availability island: server-rendered initial data, client-side
// country switching. The URL keeps a ?country= param for shareability, but
// the canonical URL (set server-side) always points at the base title URL.

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProviderCard } from "@/components/ProviderCard";
import { ProviderGridSkeleton } from "@/components/Skeletons";
import { site } from "@/lib/site";
import type { AvailabilityDto, MediaType } from "@/types";

const COUNTRIES = site.countries.map((c) => ({ code: c.code, label: c.name }));

export function AvailabilityClient({
  tmdbId,
  mediaType,
  initialCountry,
  initialAvailability
}: {
  tmdbId: number;
  mediaType: MediaType;
  initialCountry: string;
  initialAvailability: AvailabilityDto | null;
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const [country, setCountry] = useState(initialCountry);
  const [availability, setAvailability] = useState(initialAvailability);
  const [loading, setLoading] = useState(false);
  const skipFirstFetch = useRef(true);

  useEffect(() => {
    if (skipFirstFetch.current) {
      // The server already rendered availability for the initial country.
      skipFirstFetch.current = false;
      return;
    }
    let alive = true;
    setLoading(true);
    fetch(`/api/movies/${tmdbId}/availability?country=${country}&type=${mediaType}`)
      .then(async (r) => {
        if (!r.ok) throw new Error(`Failed availability (${r.status})`);
        return (await r.json()) as AvailabilityDto;
      })
      .then((a) => alive && setAvailability(a))
      .catch(() => alive && setAvailability(null))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [tmdbId, mediaType, country]);

  function changeCountry(code: string) {
    setCountry(code);
    const params = new URLSearchParams(sp.toString());
    params.set("country", code);
    const path = mediaType === "tv" ? "tv" : "movie";
    router.replace(`/${path}/${tmdbId}?${params.toString()}`, { scroll: false });
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <h2 className="text-lg font-semibold">Where to watch</h2>
        <label className="text-xs flex items-center gap-2">
          <span className="text-white/50">Country</span>
          <select
            value={country}
            onChange={(e) => changeCountry(e.target.value)}
            className="bg-surface border border-border rounded-lg px-2 py-1.5"
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {loading ? (
        <ProviderGridSkeleton />
      ) : !availability ? (
        <div className="bg-surface border border-border rounded-xl p-6 text-sm text-white/60">
          Streaming availability could not be loaded.
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {availability.providers.map((p) => (
              <ProviderCard key={p.providerKey} p={p} />
            ))}
          </div>
          {availability.providers.every((p) => !p.available) && (
            <p className="text-sm text-white/50 mt-4">
              Not currently available on the supported providers in{" "}
              {availability.country}.
            </p>
          )}
          <p className="text-xs text-white/40 mt-4">
            Availability can change as licenses rotate — confirm on the
            provider’s page before subscribing. Last checked:{" "}
            {new Date(availability.lastCheckedAt).toLocaleDateString("en-GB", {
              year: "numeric",
              month: "short",
              day: "numeric"
            })}
            .
          </p>
        </>
      )}
    </section>
  );
}
