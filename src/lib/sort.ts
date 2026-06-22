export type SortKey =
  | "popularity.desc"
  | "rating.desc"
  | "rating.asc"
  | "release.desc"
  | "release.asc"
  | "votes.desc";

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "popularity.desc", label: "Most popular" },
  { value: "rating.desc", label: "Rating ↓ (high to low)" },
  { value: "rating.asc", label: "Rating ↑ (low to high)" },
  { value: "release.desc", label: "Newest first" },
  { value: "release.asc", label: "Oldest first" },
  { value: "votes.desc", label: "Most voted" }
];

export const DEFAULT_SORT: SortKey = "popularity.desc";

export function isSortKey(v: string): v is SortKey {
  return SORT_OPTIONS.some((o) => o.value === v);
}
