import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AppShell } from "@/components/layout/app-shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  const documentCount = session?.user
    ? await prisma.document.count({ where: { userId: session.user.id } })
    : 0;

  return <AppShell documentCount={documentCount}>{children}</AppShell>;
}
