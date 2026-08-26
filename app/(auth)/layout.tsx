import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNav } from "@/components/layout/site-nav";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-text-primary">
      <SiteNav />
      <div className="flex flex-1 items-center justify-center px-4 py-12">{children}</div>
      <SiteFooter />
    </div>
  );
}
