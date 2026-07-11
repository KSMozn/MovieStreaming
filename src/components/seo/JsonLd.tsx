import { serializeJsonLd } from "@/lib/seo/schema";

// Renders one JSON-LD block with safe serialization (escapes <, >, & and
// script-ending sequences).
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
