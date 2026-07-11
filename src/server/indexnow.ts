import "server-only";
import { site } from "@/lib/site";

// IndexNow submission utility. Server-only; never runs during page render.
// Successful receipt (HTTP 200/202) does not guarantee crawling or ranking.
const ENDPOINT = "https://api.indexnow.org/indexnow";
export const MAX_BATCH = 10_000; // protocol maximum per submission

export interface IndexNowResult {
  submitted: number;
  skipped: string[];
  status: number | null;
  ok: boolean;
}

export function validateIndexNowUrls(urls: string[]): {
  valid: string[];
  invalid: string[];
} {
  const valid: string[] = [];
  const invalid: string[] = [];
  for (const raw of urls) {
    try {
      const url = new URL(raw);
      if (url.origin === site.origin) valid.push(url.toString());
      else invalid.push(raw);
    } catch {
      invalid.push(raw);
    }
  }
  return { valid, invalid };
}

export async function submitToIndexNow(
  urls: string[],
  opts: { retries?: number } = {}
): Promise<IndexNowResult> {
  const key = process.env.INDEXNOW_KEY;
  if (!key) {
    // Non-blocking: missing configuration must never break publishing.
    return { submitted: 0, skipped: urls, status: null, ok: false };
  }
  const { valid, invalid } = validateIndexNowUrls(urls);
  if (valid.length === 0) {
    return { submitted: 0, skipped: invalid, status: null, ok: false };
  }
  const body = {
    host: new URL(site.origin).host,
    key,
    keyLocation:
      process.env.INDEXNOW_KEY_LOCATION || `${site.origin}/indexnow-key.txt`,
    urlList: valid.slice(0, MAX_BATCH)
  };

  const retries = opts.retries ?? 2;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "content-type": "application/json; charset=utf-8" },
        body: JSON.stringify(body)
      });
      if (res.ok || res.status === 202) {
        // Log outcome without the key.
        console.log(
          `[indexnow] submitted ${body.urlList.length} url(s), status ${res.status}`
        );
        return {
          submitted: body.urlList.length,
          skipped: invalid,
          status: res.status,
          ok: true
        };
      }
      if (res.status >= 400 && res.status < 500) {
        console.warn(`[indexnow] rejected with status ${res.status}`);
        return { submitted: 0, skipped: urls, status: res.status, ok: false };
      }
    } catch {
      // transient network error → retry
    }
    await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
  }
  return { submitted: 0, skipped: urls, status: null, ok: false };
}
