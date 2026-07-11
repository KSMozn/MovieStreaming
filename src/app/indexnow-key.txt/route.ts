// IndexNow key-verification file, served from a stable root path and
// referenced via keyLocation in submissions. Returns 404 until
// INDEXNOW_KEY is configured.
export const runtime = "nodejs";

export function GET(): Response {
  const key = process.env.INDEXNOW_KEY;
  if (!key) return new Response("Not configured", { status: 404 });
  return new Response(key, {
    headers: { "content-type": "text/plain; charset=utf-8" }
  });
}
