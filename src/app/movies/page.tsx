import { CtaSection, LinkGrid, PageHero } from "@/components/marketing/Page";
import { TitleRail } from "@/components/marketing/TitleRail";
import { pageMetadata } from "@/lib/seo/metadata";
import { getPopularTitles, getTopRatedTitles } from "@/server/discover";
import { site } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "Movies — Popular and Top Rated",
  description:
    "Browse popular and top-rated movies and see where each one is streaming in Egypt, Saudi Arabia or the UAE.",
  path: "/movies"
});

export default async function MoviesPage() {
  const [popular, topRated] = await Promise.all([
    getPopularTitles("movie"),
    getTopRatedTitles("movie")
  ]);

  return (
    <div className="space-y-10">
      <PageHero
        title="Movies"
        lead="Every movie links to a full page with ratings, cast, and per-country streaming availability."
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Movies", path: "/movies" }
        ]}
      />
      <TitleRail heading="Popular now" titles={popular} />
      <TitleRail heading="Top rated" titles={topRated} />
      <LinkGrid
        links={[
          { label: "Search movies with filters", href: "/search" },
          { label: "TV shows", href: "/tv-shows" },
          ...site.countries.map((c) => ({
            label: `Streaming in ${c.name}`,
            href: `/countries/${c.slug}`
          }))
        ]}
      />
      <CtaSection
        title="Looking for something specific?"
        body="Filter by genre, year, rating, cast, provider and country in advanced search."
        ctaLabel="Open advanced search →"
        ctaHref="/search"
      />
    </div>
  );
}
