// app/(app)/documents/page.tsx
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DocumentsExplorer } from "@/components/dashboard/DocumentsExplorer";
import UploadDropzone from "@/components/dashboard/UploadDropzone";

export default async function DocumentsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/sign-in");

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

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-sans text-xl font-semibold text-text-primary">My Documents</h1>
          <p className="mt-1 font-sans text-sm text-text-secondary">
            {serializable.length === 0
              ? "Upload a document to begin."
              : `${serializable.length} document${serializable.length === 1 ? "" : "s"}`}
          </p>
        </div>
        {serializable.length > 0 && <UploadDropzone variant="button" />}
      </div>

      {serializable.length === 0 ? (
        <UploadDropzone variant="empty-state" />
      ) : (
        <DocumentsExplorer documents={serializable} />
      )}
    </div>
  );
}
