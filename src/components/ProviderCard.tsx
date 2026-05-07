import type { ProviderAvailabilityDto } from "@/types";

function fmtDate(d: string | null): string {
  if (!d) return "Not available";
  const t = Date.parse(d);
  if (!Number.isFinite(t)) return d;
  return new Date(t).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function typeLabel(t: ProviderAvailabilityDto["availabilityType"]): string {
  switch (t) {
    case "subscription":
      return "Subscription";
    case "free":
      return "Free";
    case "rent":
      return "Rent";
    case "buy":
      return "Buy";
    case "ads":
      return "Free with ads";
    default:
      return "—";
  }
}

export function ProviderCard({ p }: { p: ProviderAvailabilityDto }) {
  const dim = !p.available ? "opacity-60" : "";
  return (
    <div
      className={`bg-surface border border-border rounded-xl p-4 flex flex-col gap-3 ${dim}`}
    >
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.logoUrl} alt={p.providerName} className="w-10 h-10 rounded" />
        <div className="flex-1">
          <div className="font-medium">{p.providerName}</div>
          <div
            className={`text-xs ${
              p.available ? "text-emerald-400" : "text-white/40"
            }`}
          >
            {p.available ? "Available" : "Not available on this platform"}
          </div>
        </div>
        {p.available && p.streamingUrl && (
          <a
            href={p.streamingUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="text-xs px-3 py-1.5 rounded-lg bg-accent text-bg font-semibold"
          >
            Watch
          </a>
        )}
      </div>
      <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
        <dt className="text-white/50">Type</dt>
        <dd>{p.available ? typeLabel(p.availabilityType) : "—"}</dd>
        <dt className="text-white/50">Starts</dt>
        <dd>{fmtDate(p.startsAt)}</dd>
        <dt className="text-white/50">Ends</dt>
        <dd>{fmtDate(p.endsAt)}</dd>
        <dt className="text-white/50">Category</dt>
        <dd>{p.providerGenre ?? "Not available"}</dd>
      </dl>
    </div>
  );
}
