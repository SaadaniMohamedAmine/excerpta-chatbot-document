// components/settings/AppearanceSection.tsx
import { ThemeToggle } from "@/components/ui/theme-toggle";

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
    </section>
  );
}
