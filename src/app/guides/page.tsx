import Link from "next/link";
import { PageHero } from "@/components/marketing/Page";
import { pageMetadata } from "@/lib/seo/metadata";
import { GUIDES } from "@/content/guides";

export const metadata = pageMetadata({
  title: "Streaming Guides",
  description:
    "Practical guides to streaming discovery in the Middle East: finding where movies stream, comparing services, and searching smarter with ReelSeek.",
  path: "/guides"
});

export default function GuidesPage() {
  return (
    <div className="space-y-8">
      <PageHero
        title="Guides"
        lead="Practical, regional, and honest — how to get more out of streaming discovery."
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Guides", path: "/guides" }
        ]}
      />
      <ul className="space-y-3">
        {GUIDES.map((g) => (
          <li key={g.slug}>
            <Link
              href={`/guides/${g.slug}`}
              className="block bg-surface border border-border rounded-xl p-5 hover:border-accent transition"
            >
              <h2 className="text-base font-semibold">{g.title}</h2>
              <p className="text-sm text-white/60 mt-1">{g.description}</p>
              <p className="text-xs text-white/40 mt-2">
                {g.author} · Updated{" "}
                <time dateTime={g.dateModified}>{g.dateModified}</time>
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
