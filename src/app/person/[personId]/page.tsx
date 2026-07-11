import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/marketing/Page";
import { getPerson } from "@/server/people";
import { personSchema } from "@/lib/seo/schema";
import { pageMetadata, truncateDescription } from "@/lib/seo/metadata";
import type { PersonDto } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Props {
  params: { personId: string };
}

function parseId(raw: string): number | null {
  if (!/^\d{1,10}$/.test(raw)) return null;
  const id = Number.parseInt(raw, 10);
  return Number.isFinite(id) && id > 0 ? id : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = parseId(params.personId);
  const person = id ? await getPerson(id) : null;
  if (!person) return { robots: { index: false, follow: false } };
  return pageMetadata({
    title: `${person.name} — Movies and TV Shows`,
    description: truncateDescription(
      person.biography ||
        `${person.name}'s filmography with links to where each title is streaming in your country.`
    ),
    path: `/person/${person.personId}`,
    ogType: "profile",
    images: person.profileUrl
      ? [{ url: person.profileUrl, alt: person.name }]
      : undefined
  });
}

// UTC-based age math (no local-timezone drift on date-only strings).
function ageOrLifespan(person: PersonDto): string | null {
  const parse = (d: string | null) =>
    d && /^\d{4}-\d{2}-\d{2}$/.test(d) ? Date.parse(`${d}T00:00:00Z`) : NaN;
  const birth = parse(person.birthday);
  if (!Number.isFinite(birth)) return null;
  const end = Number.isFinite(parse(person.deathday))
    ? parse(person.deathday)
    : Date.now();
  const years = Math.floor((end - birth) / (365.2425 * 24 * 3600 * 1000));
  return person.deathday
    ? `${person.birthday} – ${person.deathday} (aged ${years})`
    : `${person.birthday} (age ${years})`;
}

export default async function PersonPage({ params }: Props) {
  const id = parseId(params.personId);
  if (!id) notFound();
  const person = await getPerson(id);
  if (!person) notFound();

  const lifespan = ageOrLifespan(person);

  return (
    <div className="space-y-10">
      <JsonLd data={personSchema(person)} />
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: person.name, path: `/person/${person.personId}` }
        ]}
      />

      <section className="grid md:grid-cols-[220px_1fr] gap-6">
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="aspect-[2/3] bg-surface2">
            {person.profileUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={person.profileUrl}
                alt={person.name}
                className="w-full h-full object-cover"
              />
            ) : null}
          </div>
        </div>
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-bold">{person.name}</h1>
          <div className="text-sm text-white/60 space-y-1">
            {person.knownForDepartment && (
              <div>
                <span className="text-white/40">Known for: </span>
                {person.knownForDepartment}
              </div>
            )}
            {lifespan && (
              <div>
                <span className="text-white/40">Born: </span>
                {lifespan}
              </div>
            )}
            {person.placeOfBirth && (
              <div>
                <span className="text-white/40">From: </span>
                {person.placeOfBirth}
              </div>
            )}
            {person.imdbId && (
              <div>
                <a
                  href={`https://www.imdb.com/name/${person.imdbId}/`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-2 mt-1 px-2.5 py-1 rounded-md bg-accent text-bg text-xs font-semibold"
                >
                  <span className="text-[10px] font-extrabold tracking-wider">IMDb</span>
                  View on IMDb ↗
                </a>
              </div>
            )}
          </div>
          {person.biography && (
            <p className="text-sm leading-relaxed text-white/80 whitespace-pre-line">
              {person.biography}
            </p>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">
          Filmography{" "}
          <span className="text-white/40 text-sm font-normal">
            ({person.credits.length})
          </span>
        </h2>
        {person.credits.length === 0 ? (
          <p className="text-sm text-white/60">No credits found.</p>
        ) : (
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {person.credits.map((c) => {
              const path = c.mediaType === "tv" ? "tv" : "movie";
              return (
                <li key={`${c.mediaType}-${c.tmdbId}`}>
                  <Link
                    href={`/${path}/${c.tmdbId}`}
                    className="block bg-surface border border-border rounded-lg overflow-hidden hover:border-accent transition"
                  >
                    <div className="aspect-[2/3] bg-surface2 relative">
                      {c.posterUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={c.posterUrl}
                          alt=""
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      ) : null}
                      <span
                        className={`absolute top-1 left-1 text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded ${
                          c.mediaType === "tv"
                            ? "bg-emerald-500/90 text-bg"
                            : "bg-sky-500/90 text-bg"
                        }`}
                      >
                        {c.mediaType === "tv" ? "TV" : "MOVIE"}
                      </span>
                      {c.voteAverage != null && (
                        <span className="absolute bottom-1 right-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-bg/80 border border-border">
                          ★ {c.voteAverage.toFixed(1)}
                        </span>
                      )}
                    </div>
                    <div className="p-2">
                      <div className="text-xs font-medium line-clamp-2">{c.title}</div>
                      <div className="text-[11px] text-white/50">
                        {c.releaseYear ?? "—"}
                      </div>
                      {c.character && (
                        <div className="text-[11px] text-white/40 line-clamp-1 italic">
                          as {c.character}
                        </div>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
