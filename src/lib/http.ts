/**
 * Small wrapper around fetch with timeout + JSON parsing + structured errors.
 * Server-side only.
 */
export class HttpError extends Error {
  constructor(
    public status: number,
    public url: string,
    message: string
  ) {
    super(message);
  }
}

export async function fetchJson<T>(
  url: string,
  init: RequestInit & { timeoutMs?: number; revalidate?: number } = {}
): Promise<T> {
  const { timeoutMs = 10_000, revalidate, ...rest } = init;
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...rest,
      signal: controller.signal,
      // Cache hints for Next.js App Router fetch
      next: revalidate !== undefined ? { revalidate } : undefined
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new HttpError(
        res.status,
        url,
        `HTTP ${res.status} for ${url}: ${body.slice(0, 200)}`
      );
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(t);
  }
}
