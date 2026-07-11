/* eslint-disable @next/next/no-img-element */
import { brand } from "@/lib/brand";

// Shared Open Graph card template. Every page-level opengraph-image route
// renders this with its own title/subtitle so all social previews share one
// visual system (official mark, palette, Inter).
export function OgCard({
  title,
  subtitle
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        backgroundColor: brand.colors.primary,
        backgroundImage: `linear-gradient(135deg, ${brand.colors.primary} 55%, #16283f 100%)`,
        color: brand.colors.textPrimary,
        fontFamily: "Inter"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <svg viewBox="0 0 64 64" width="72" height="72">
          <circle cx="27" cy="27" r="19" fill="none" stroke={brand.colors.neutral} strokeWidth="7" />
          <path d="M21 17.5 L39.5 27 L21 36.5 Z" fill={brand.colors.accent} />
          <path d="M41.5 41.5 L53 53" stroke={brand.colors.neutral} strokeWidth="9" strokeLinecap="round" />
        </svg>
        <div style={{ display: "flex", fontSize: 52, fontWeight: 700 }}>
          <span style={{ color: brand.colors.neutral }}>Reel</span>
          <span style={{ color: brand.colors.accent }}>Seek</span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05 }}>{title}</div>
        {subtitle ? (
          <div style={{ fontSize: 32, color: "rgba(247,248,250,0.65)" }}>{subtitle}</div>
        ) : null}
      </div>
    </div>
  );
}

export const ogSize = { width: 1200, height: 630 };
