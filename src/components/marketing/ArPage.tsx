import Link from "next/link";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo/metadata";
import type { ArPageContent } from "@/content/ar";

// Shared renderer for Arabic public pages. The root layout already sets
// lang="ar" dir="rtl" for /ar routes (via middleware pathname header), so
// this component only handles content structure.
export function arMetadata(page: ArPageContent): Metadata {
  return pageMetadata({
    title: page.title,
    description: page.description,
    path: page.path,
    locale: "ar"
  });
}

export function ArPageView({
  page,
  children
}: {
  page: ArPageContent;
  children?: React.ReactNode;
}) {
  return (
    <div className="space-y-10">
      <header className="space-y-3 pb-2">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          {page.heading}
        </h1>
        <p className="text-white/65 max-w-2xl">{page.lead}</p>
      </header>

      {page.sections.map((section) => (
        <section key={section.heading ?? section.paragraphs[0].slice(0, 24)} className="space-y-3">
          {section.heading && (
            <h2 className="text-xl font-semibold">{section.heading}</h2>
          )}
          <div className="space-y-3 text-sm leading-relaxed text-white/75">
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
          </div>
        </section>
      ))}

      {children}

      {page.links && page.links.length > 0 && (
        <nav aria-label="روابط ذات صلة">
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {page.links.map((link) => (
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
        </nav>
      )}
    </div>
  );
}
