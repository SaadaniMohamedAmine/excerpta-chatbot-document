// app/share/[token]/page.tsx
//
// Lives outside the (app) route group, so it isn't wrapped by the
// authenticated shell — and proxy.ts's matcher only covers
// /documents, /collections, /settings, /sign-in, /sign-up, so this route
// is reachable without a session (verified, not just assumed).
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { MessageBubble } from "@/components/workspace/MessageBubble";
import type { Citation } from "@/lib/citations";

export const runtime = "nodejs";

interface SharePageProps {
  params: Promise<{ token: string }>;
}

export default async function SharePage({ params }: SharePageProps) {
  const { token } = await params;
  const t = await getTranslations("Share");
  const tLanding = await getTranslations("Landing");

  const conversation = await prisma.conversation.findFirst({
    where: { shareToken: token, isPublic: true },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  if (!conversation) {
    notFound();
  }

  let title = t("defaultTitle");
  if (conversation.documentId) {
    const document = await prisma.document.findUnique({
      where: { id: conversation.documentId },
      select: { title: true },
    });
    if (document?.title) title = document.title;
  } else if (conversation.collectionId) {
    const collection = await prisma.collection.findUnique({
      where: { id: conversation.collectionId },
      select: { name: true },
    });
    if (collection?.name) title = collection.name;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/" aria-label={t("homeAriaLabel")}>
            <Logo />
          </Link>
          <Link href="/sign-up">
            <Button size="sm">{tLanding("hero.ctaSignedOut")}</Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <h1 className="mb-1 font-serif text-2xl text-text-primary">{title}</h1>
        <p className="mb-8 text-sm text-text-secondary">{t("readOnlySubtitle")}</p>

        <div className="flex flex-col gap-6">
          {conversation.messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={{
                id: message.id,
                role: message.role === "assistant" ? "assistant" : "user",
                content: message.content,
                citations: (message.citations as unknown as Citation[] | null) ?? undefined,
              }}
              readOnly
            />
          ))}
        </div>
      </main>

      <footer className="border-t border-border py-6 text-center text-sm text-text-secondary">
        {t("footerTagline")}
      </footer>
    </div>
  );
}
