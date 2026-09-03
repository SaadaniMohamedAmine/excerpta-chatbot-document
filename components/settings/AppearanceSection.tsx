// components/settings/AppearanceSection.tsx
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";

export function AppearanceSection() {
  const t = useTranslations("Settings.appearance");

  return (
    <section className="flex flex-col gap-8">
      <div>
        <h2 className="text-lg font-semibold text-text-primary">{t("heading")}</h2>
        <p className="mt-1 text-sm text-text-secondary">{t("subtitle")}</p>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border bg-surface p-4">
        <div>
          <div className="text-sm font-medium text-text-primary">{t("themeLabel")}</div>
          <div className="text-sm text-text-secondary">{t("themeHint")}</div>
        </div>
        <ThemeToggle />
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border bg-surface p-4">
        <div>
          <div className="text-sm font-medium text-text-primary">{t("tourLabel")}</div>
          <div className="text-sm text-text-secondary">{t("tourHint")}</div>
        </div>
        <Button variant="secondary" size="sm" asChild>
          <Link href="/documents?tour=1">{t("replayTour")}</Link>
        </Button>
      </div>
    </section>
  );
}
