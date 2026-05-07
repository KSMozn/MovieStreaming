import Link from "next/link";
import type { CastMemberDto } from "@/types";

export function CastList({ cast }: { cast: CastMemberDto[] }) {
  if (cast.length === 0) {
    return <p className="text-sm text-white/60">No cast information.</p>;
  }
  return (
    <ul className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
      {cast.map((c) => (
        <li
          key={`${c.personId}-${c.character ?? ""}`}
          className="min-w-[110px] max-w-[110px]"
        >
          <Link
            href={`/person/${c.personId}`}
            className="block bg-surface border border-border rounded-lg p-2 hover:border-accent transition"
            title={`See ${c.name}'s filmography`}
          >
            <div className="aspect-[2/3] rounded bg-surface2 overflow-hidden mb-2">
              {c.profileUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.profileUrl} alt="" className="w-full h-full object-cover" />
              ) : null}
            </div>
            <div className="text-xs font-medium leading-tight line-clamp-2">
              {c.name}
            </div>
            <div className="text-[11px] text-white/50 line-clamp-2">
              {c.character ?? "—"}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
