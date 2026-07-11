import type { AnchorHTMLAttributes, ReactNode } from "react";

// ReelSeek CTA primitives: amber primary, outlined secondary (brand board
// "logo variations" pills / hero reference buttons).

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export function PrimaryButton({
  children,
  className = "",
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode }) {
  return (
    <a
      className={`${base} bg-accent text-brand-primary hover:brightness-110 ${className}`}
      {...props}
    >
      {children}
    </a>
  );
}

export function SecondaryButton({
  children,
  className = "",
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode }) {
  return (
    <a
      className={`${base} border border-border text-brand-neutral hover:border-accent hover:text-accent ${className}`}
      {...props}
    >
      {children}
    </a>
  );
}
