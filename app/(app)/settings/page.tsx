// app/(app)/settings/page.tsx
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SettingsLayout } from "@/components/settings/SettingsLayout";

export default async function SettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, image: true },
  });

  if (!user) {
    redirect("/sign-in");
  }

  const accounts = await prisma.account.findMany({
    where: { userId: user.id },
    select: { providerId: true },
  });

  return (
    <SettingsLayout user={user} providers={accounts.map((account) => account.providerId)} />
  );
}
