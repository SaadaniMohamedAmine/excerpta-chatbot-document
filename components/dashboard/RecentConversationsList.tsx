// components/dashboard/RecentConversationsList.tsx
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ChatCircleText } from "@phosphor-icons/react/dist/ssr";
import { formatRelativeDate } from "@/lib/format";

export interface RecentConversation {
  id: string;
  href: string;
  label: string;
  preview: string;
  createdAt: string;
}

export function RecentConversationsList({ conversations }: { conversations: RecentConversation[] }) {
  const t = useTranslations("Dashboard");

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-sans text-sm font-medium text-text-primary">{t("recentConversations")}</h2>
        <Link href="/history" className="font-sans text-xs text-primary hover:underline">
          {t("viewAll")}
        </Link>
      </div>

      {conversations.length === 0 ? (
        <p className="mt-4 font-sans text-sm text-text-secondary">{t("noConversationsYet")}</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-1">
          {conversations.map((conversation) => (
            <li key={conversation.id}>
              <Link
                href={conversation.href}
                className="flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-background"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <ChatCircleText size={16} weight="duotone" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-sans text-sm text-text-primary">
                    {conversation.label}
                  </span>
                  <span className="block truncate font-sans text-xs text-text-secondary">
                    {conversation.preview}
                  </span>
                </span>
                <span className="shrink-0 font-sans text-xs text-text-secondary">
                  {formatRelativeDate(conversation.createdAt)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
