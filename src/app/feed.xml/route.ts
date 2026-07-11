import { GUIDES } from "@/content/guides";
import { publicFacts } from "@/content/publicFacts";
import { absoluteUrl, site } from "@/lib/site";

export const runtime = "nodejs";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Atom feed of public guides. No personalized or private content.
export function GET(): Response {
  const updated = GUIDES.map((g) => g.dateModified).sort().at(-1) ?? publicFacts.lastReviewed;
  const items = GUIDES.map((g) => {
    const url = absoluteUrl(`/guides/${g.slug}`);
    return `  <entry>
    <title>${escapeXml(g.title)}</title>
    <link href="${url}"/>
    <id>${url}</id>
    <published>${g.datePublished}T00:00:00Z</published>
    <updated>${g.dateModified}T00:00:00Z</updated>
    <summary>${escapeXml(g.description)}</summary>
    <author><name>${escapeXml(g.author)}</name></author>
  </entry>`;
  }).join("\n");

  const feed = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXml(site.name)} Guides</title>
  <subtitle>${escapeXml(publicFacts.description)}</subtitle>
  <link href="${absoluteUrl("/feed.xml")}" rel="self"/>
  <link href="${site.origin}"/>
  <id>${site.origin}/</id>
  <updated>${updated}T00:00:00Z</updated>
${items}
</feed>`;

  return new Response(feed, {
    headers: {
      "content-type": "application/atom+xml; charset=utf-8",
      "cache-control": "public, max-age=3600"
    }
  });
}
