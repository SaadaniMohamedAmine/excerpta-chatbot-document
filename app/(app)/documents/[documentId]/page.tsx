// app/(app)/documents/[documentId]/page.tsx
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import DocumentWorkspace from "@/components/workspace/DocumentWorkspace";

interface PageProps {
  params: Promise<{ documentId: string }>;
}

export default async function DocumentPage({ params }: PageProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    redirect("/sign-in");
  }

  const { documentId } = await params;

  const document = await prisma.document.findFirst({
    where: { id: documentId, userId: session.user.id },
  });

  if (!document) {
    notFound();
  }

  const serializable = {
    id: document.id,
    title: document.title,
    fileType: document.fileType as "pdf" | "docx" | "csv" | "code",
    fileUrl: document.fileUrl,
    fileSize: document.fileSize,
    pageCount: document.pageCount,
    status: document.status as "processing" | "ready" | "failed",
    createdAt: document.createdAt.toISOString(),
    suggestedQuestions: (document.suggestedQuestions as string[] | null) ?? [],
  };

  return (
    // DocumentWorkspace reads citePage/citeExcerpt query params (used when
    // navigating here from a collection chat's citation click) via
    // useSearchParams, which Next.js requires a Suspense boundary for.
    <Suspense fallback={null}>
      <DocumentWorkspace document={serializable} />
    </Suspense>
  );
}
