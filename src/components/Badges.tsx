export function GenreChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs px-2.5 py-1 rounded-full bg-surface2 border border-border">
      {children}
    </span>
  );
}

export function RatingBadge({
  rating,
  imdbId
}: {
  rating: number | null;
  imdbId?: string | null;
}) {
  const href = imdbId ? `https://www.imdb.com/title/${imdbId}/` : null;

  if (rating == null) return null;

  const inner = (
    <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-accent text-bg">
      <span className="text-[10px] font-bold tracking-wider">IMDb</span>
      <span className="text-sm font-bold">{rating.toFixed(1)}</span>
    </span>
  );
  return href ? (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      title="View on IMDb"
      className="hover:opacity-90 transition"
    >
      {inner}
    </a>
  ) : (
    inner
  );
}

export function TmdbRatingBadge({
  rating,
  votes
}: {
  rating: number | null;
  votes: number | null;
}) {
  if (rating == null) return null;
  return (
    <span
      className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-surface2 border border-border text-xs"
      title={`TMDb user rating${votes ? ` · ${votes.toLocaleString()} votes` : ""}`}
    >
      <span className="text-[10px] font-bold tracking-wider text-emerald-400">
        TMDb
      </span>
      <span className="text-sm font-bold">{rating.toFixed(1)}</span>
    </span>
  );
}

export function ImdbLinkButton({ imdbId }: { imdbId: string | null }) {
  if (!imdbId) return null;
  return (
    <a
      href={`https://www.imdb.com/title/${imdbId}/`}
      target="_blank"
      rel="noreferrer noopener"
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent text-bg text-xs font-semibold hover:opacity-90 transition"
      title="View on IMDb"
    >
      <span className="text-[10px] font-extrabold tracking-wider">IMDb</span>
      <span>View on IMDb ↗</span>
    </a>
  );
}
