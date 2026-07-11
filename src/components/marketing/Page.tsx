import Link from "next/link";
import type { ReactNode } from "react";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema } from "@/lib/seo/schema";

// Shared primitives for public marketing/editorial pages so every page uses
// one visual system instead of bespoke styling.

export interface Crumb {
  name: string;
  path: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <>
      <nav aria-label="Breadcrumb" className="text-xs text-white/50">
        <ol className="flex flex-wrap items-center gap-1">
          {items.map((item, i) => (
            <li key={item.path} className="flex items-center gap-1">
              {i > 0 && <span aria-hidden>›</span>}
              {i < items.length - 1 ? (
                <Link href={item.path} className="hover:text-accent underline-offset-2">
                  {item.name}
                </Link>
              ) : (
                <span aria-current="page" className="text-white/70">
                  {item.name}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd data={breadcrumbSchema(items)} />
    </>
  );
}

export function PageHero({
  title,
  lead,
  crumbs
}: {
  title: string;
  lead?: string;
  crumbs?: Crumb[];
}) {
  return (
    <header className="space-y-3 pb-2">
      {crumbs && <Breadcrumbs items={crumbs} />}
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{title}</h1>
      {lead && <p className="text-white/65 max-w-2xl">{lead}</p>}
    </header>
  );
}

export function Section({
  title,
  children
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      {title && <h2 className="text-xl font-semibold">{title}</h2>}
      {children}
    </section>
  );
}

export function Prose({ children }: { children: ReactNode }) {
  return <div className="space-y-3 text-sm leading-relaxed text-white/75">{children}</div>;
}

export function LinkGrid({ links }: { links: { label: string; href: string }[] }) {
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
      {links.map((link) => (
        <li key={link.href}>
          <Link
            href={link.href}
            className="block bg-surface border border-border rounded-lg px-4 py-3 text-sm hover:border-accent transition"
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function CtaSection({
  title,
  body,
  ctaLabel,
  ctaHref
}: {
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
}) {
  return (
    <section className="bg-surface border border-border rounded-xl p-6 text-center space-y-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-sm text-white/65 max-w-xl mx-auto">{body}</p>
      <Link
        href={ctaHref}
        className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold bg-accent text-brand-primary hover:brightness-110 transition"
      >
        {ctaLabel}
      </Link>
    </section>
  );
}

// FAQ list rendered with <details>/<summary> so answers are in the HTML and
// usable without JavaScript.
export function FaqList({
  items
}: {
  items: { question: string; answer: string }[];
}) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <details
          key={item.question}
          className="bg-surface border border-border rounded-lg px-4 py-3 group"
        >
          <summary className="cursor-pointer text-sm font-medium list-none flex justify-between items-center gap-3">
            {item.question}
            <span aria-hidden className="text-white/40 group-open:rotate-45 transition">
              +
            </span>
          </summary>
          <p className="text-sm text-white/70 pt-2">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
