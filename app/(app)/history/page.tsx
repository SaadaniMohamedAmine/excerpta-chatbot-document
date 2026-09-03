// app/(app)/history/page.tsx
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ClockCounterClockwise } from "@phosphor-icons/react/dist/ssr";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeaderBanner } from "@/components/ui/page-header-banner";
import { fetchHistoryPage } from "@/lib/history";
import { HistoryList } from "@/components/history/HistoryList";

export default async function HistoryPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/sign-in");

  const t = await getTranslations("HistoryPage");
  const tNav = await getTranslations("Nav");

  const [totalCount, { items, nextCursor }] = await Promise.all([
    prisma.conversation.count({ where: { userId: session.user.id } }),
    fetchHistoryPage(session.user.id),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <PageHeaderBanner
        icon={ClockCounterClockwise}
        title={tNav("history")}
        subtitle={totalCount === 0 ? t("noConversationsYet") : t("subtitleCount", { count: totalCount })}
      />

      <HistoryList initialItems={items} initialNextCursor={nextCursor} />
    </div>
  );
}
