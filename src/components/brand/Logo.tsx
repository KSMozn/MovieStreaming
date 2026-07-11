// Official ReelSeek lockup: mark (magnifier + play) plus Inter-bold wordmark.
// The wordmark stays real HTML text for accessibility and crisp rendering;
// mark geometry mirrors public/brand/logo/reelseek-mark*.svg.

const MARK_TITLE = "ReelSeek";

export function LogoMark({
  size = 28,
  variant = "dark-bg",
  decorative = false
}: {
  size?: number;
  variant?: "dark-bg" | "light-bg";
  decorative?: boolean;
}) {
  const stroke = variant === "dark-bg" ? "#F7F8FA" : "#0D1B2A";
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : MARK_TITLE}
      aria-hidden={decorative || undefined}
    >
      <circle cx="27" cy="27" r="19" fill="none" stroke={stroke} strokeWidth="7" />
      <path d="M21 17.5 L39.5 27 L21 36.5 Z" fill="#F5A623" />
      <path d="M41.5 41.5 L53 53" stroke={stroke} strokeWidth="9" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({
  size = 28,
  variant = "dark-bg",
  className = ""
}: {
  size?: number;
  variant?: "dark-bg" | "light-bg";
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark size={size} variant={variant} decorative />
      <span
        className="font-bold tracking-tight leading-none"
        style={{ fontSize: size * 0.78 }}
      >
        <span className={variant === "dark-bg" ? "text-brand-neutral" : "text-brand-primary"}>
          Reel
        </span>
        <span className="text-accent">Seek</span>
      </span>
    </span>
  );
}
