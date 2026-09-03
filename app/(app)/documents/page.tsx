// app/(app)/documents/page.tsx
import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { FileText } from "@phosphor-icons/react/dist/ssr";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeaderBanner } from "@/components/ui/page-header-banner";
import { resolveUploadCollectionId } from "@/lib/collections";
import { getUsage } from "@/lib/billing/usage";
import { DocumentsExplorer } from "@/components/dashboard/DocumentsExplorer";
import UploadDropzone from "@/components/dashboard/UploadDropzone";
import { DashboardTour } from "@/components/onboarding/DashboardTour";

const DEMO_DOCUMENT_TITLE = "Getting Started with Excerpta.pdf";
const DEMO_DOCUMENT_URL = `${process.env.NEXT_PUBLIC_APP_URL}/demo/getting-started-with-excerpta.pdf`;
// Exact byte size of the generated asset (scripts/generate-demo-pdf.ts) —
// keeps this page from needing an extra network round-trip just to know the
// file size. Update if the demo PDF is regenerated with different content.
const DEMO_DOCUMENT_SIZE_BYTES = 4694;

export default async function DocumentsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/sign-in");

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { onboardedAt: true },
  });

  let justOnboarded = false;
  if (!user.onboardedAt) {
    // Silent seed — no popup, no ?assignCollection= redirect param, unlike a
    // real upload. In practice this is almost always what creates the
    // account's very first (default) collection, since the demo document
    // lands before any real upload.
    const collectionId = await resolveUploadCollectionId(session.user.id);

    const demoDocument = await prisma.document.create({
      data: {
        userId: session.user.id,
        title: DEMO_DOCUMENT_TITLE,
        fileType: "pdf",
        fileUrl: DEMO_DOCUMENT_URL,
        fileSize: DEMO_DOCUMENT_SIZE_BYTES,
        status: "processing",
        collectionId,
      },
    });

    // Same fire-and-forget trigger as /api/documents/[id]/retry — that route
    // has an explicit note not to call lib/documents/process.ts directly, so
    // this doesn't either. Fire-and-forget: the page renders immediately
    // with the document showing "processing", same as any other upload.
    fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/workflows/process-document`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentId: demoDocument.id }),
    }).catch((error) => {
      console.error("[documents/page] failed to trigger demo document processing:", error);
    });

    await prisma.user.update({ where: { id: session.user.id }, data: { onboardedAt: new Date() } });
    justOnboarded = true;
  }

  const documents = await prisma.document.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { conversations: true } } },
  });

  const serializable = documents.map((d) => ({
    id: d.id,
    title: d.title,
    fileType: d.fileType as "pdf" | "docx" | "csv" | "code",
    fileSize: d.fileSize,
    status: d.status as "processing" | "ready" | "failed",
    createdAt: d.createdAt.toISOString(),
    conversationCount: d._count.conversations,
  }));

  const totalConversations = serializable.reduce((sum, d) => sum + d.conversationCount, 0);
  const usage = await getUsage(session.user.id);

  const citationCount =
    serializable.length === 0
      ? 0
      : (
          await prisma.message.findMany({
            where: { role: "assistant", conversation: { userId: session.user.id } },
            select: { citations: true },
          })
        ).reduce((total, m) => total + (Array.isArray(m.citations) ? m.citations.length : 0), 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <PageHeaderBanner
        icon={FileText}
        title="My Documents"
        subtitle={
          serializable.length === 0
            ? "Upload a document to begin."
            : `${serializable.length} document${serializable.length === 1 ? "" : "s"}`
        }
        action={
          serializable.length > 0 ? (
            <UploadDropzone variant="button" isQuotaExceeded={usage.remaining <= 0} />
          ) : undefined
        }
      />

      <div className="mt-6">
        {serializable.length === 0 ? (
          <UploadDropzone variant="empty-state" />
        ) : (
          <DocumentsExplorer
            documents={serializable}
            totalConversations={totalConversations}
            citationCount={citationCount}
          />
        )}
      </div>

      <Suspense fallback={null}>
        <DashboardTour autoStart={justOnboarded} />
      </Suspense>
    </div>
  );
}
