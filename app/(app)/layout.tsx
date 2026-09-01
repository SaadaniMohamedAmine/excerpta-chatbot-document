import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getUsage } from "@/lib/billing/usage";
import { AppShell } from "@/components/layout/app-shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  const documentCount = session?.user
    ? await prisma.document.count({ where: { userId: session.user.id } })
    : 0;
  const usage = session?.user
    ? await getUsage(session.user.id)
    : { plan: "free" as const, used: 0, limit: 3, remaining: 3 };

  return (
    <AppShell documentCount={documentCount} usage={usage}>
      {children}
    </AppShell>
  );
}
