import { NextRequest, NextResponse } from "next/server";

// Exposes the pathname to the root layout (via a request header) so it can
// set <html lang="ar" dir="rtl"> for /ar routes during server rendering —
// no client-side language switching involved.
export function middleware(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.set("x-pathname", request.nextUrl.pathname);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  // Skip static assets and images; run for pages and route handlers.
  matcher: ["/((?!_next/static|_next/image|brand/|providers/|favicon).*)"]
};
