// components/legal/LegalPage.tsx
import { Scales } from "@phosphor-icons/react/dist/ssr";
import { SiteNav } from "@/components/layout/site-nav";
import { SiteFooter } from "@/components/layout/site-footer";

interface LegalSection {
  heading: string;
  paragraphs: string[];
}

export function LegalPage({
  title,
  lastUpdated,
  sections,
}: {
  title: string;
  lastUpdated: string;
  sections: LegalSection[];
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-text-primary">
      <SiteNav />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <div className="text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-white shadow-lg shadow-primary/30">
              <Scales size={26} weight="duotone" />
            </span>
            <h1 className="mt-5 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
            <p className="mt-2 font-sans text-sm text-text-secondary">{lastUpdated}</p>
          </div>

          <div className="mt-12 flex flex-col gap-10">
            {sections.map((section) => (
              <section key={section.heading}>
                <h2 className="border-l-2 border-primary pl-3 font-sans text-lg font-semibold text-text-primary">
                  {section.heading}
                </h2>
                <div className="mt-3 flex flex-col gap-3 pl-3.5">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph} className="font-sans text-sm leading-relaxed text-text-secondary">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
