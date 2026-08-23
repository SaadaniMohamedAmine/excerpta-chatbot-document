// app/(app)/collections/page.tsx
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import CollectionsPageClient from "./collections-page-client";

export default async function CollectionsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/sign-in");

  // Collection <-> Document is an explicit join model (CollectionDocument),
  // not an implicit many-to-many — the include below goes through it.
  const collections = await prisma.collection.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      documents: {
        include: { document: { select: { id: true, title: true, fileType: true } } },
        take: 4,
      },
      _count: { select: { documents: true } },
    },
  });

  const documents = await prisma.document.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, fileType: true },
  });

  const serializableCollections = collections.map((c) => ({
    id: c.id,
    name: c.name,
    documentCount: c._count.documents,
    previewDocuments: c.documents.map((cd) => ({
      id: cd.document.id,
      title: cd.document.title,
      fileType: cd.document.fileType as "pdf" | "docx" | "csv" | "code",
    })),
  }));

  return (
    <CollectionsPageClient
      collections={serializableCollections}
      availableDocuments={documents.map((d) => ({
        id: d.id,
        title: d.title,
        fileType: d.fileType as "pdf" | "docx" | "csv" | "code",
      }))}
    />
  );
}
