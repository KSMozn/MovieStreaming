import { CtaSection, LinkGrid, PageHero } from "@/components/marketing/Page";
import { TitleRail } from "@/components/marketing/TitleRail";
import { pageMetadata } from "@/lib/seo/metadata";
import { getPopularTitles, getTopRatedTitles } from "@/server/discover";
import { site } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "TV Shows — Popular and Top Rated",
  description:
    "Browse popular and top-rated TV series and see where each one is streaming in Egypt, Saudi Arabia or the UAE.",
  path: "/tv-shows"
});

export default async function TvShowsPage() {
  const [popular, topRated] = await Promise.all([
    getPopularTitles("tv"),
    getTopRatedTitles("tv")
  ]);

  return (
    <div className="space-y-10">
      <PageHero
        title="TV shows"
        lead="Every series links to a full page with seasons, cast, and per-country streaming availability."
        crumbs={[
          { name: "Home", path: "/" },
          { name: "TV shows", path: "/tv-shows" }
        ]}
      />
      <TitleRail heading="Popular now" titles={popular} />
      <TitleRail heading="Top rated" titles={topRated} />
      <LinkGrid
        links={[
          { label: "Search TV shows with filters", href: "/search" },
          { label: "Movies", href: "/movies" },
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
