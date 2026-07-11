import { llmsTxt } from "@/lib/seo/llms";

export const runtime = "nodejs";

export function GET(): Response {
  return new Response(llmsTxt(), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600"
    }
  });
}
