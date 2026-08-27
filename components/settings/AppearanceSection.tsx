// components/settings/AppearanceSection.tsx
import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";

export function AppearanceSection() {
  return (
    <section className="flex flex-col gap-8">
      <div>
        <h2 className="text-lg font-semibold text-text-primary">Appearance</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Choose how Excerpta looks on this device.
        </p>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border bg-surface p-4">
        <div>
          <div className="text-sm font-medium text-text-primary">Theme</div>
          <div className="text-sm text-text-secondary">
            Switch between light and dark, or match your system setting.
          </div>
        </div>
        <ThemeToggle />
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border bg-surface p-4">
        <div>
          <div className="text-sm font-medium text-text-primary">Product tour</div>
          <div className="text-sm text-text-secondary">
            Replay the guided walkthrough of Excerpta&apos;s workspace and chat.
          </div>
        </div>
        <Button variant="secondary" size="sm" asChild>
          <Link href="/documents?tour=1">Replay tour</Link>
        </Button>
      </div>
    </section>
  );
}
