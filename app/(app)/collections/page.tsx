// app/(app)/collections/page.tsx
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import CollectionsPageClient from "./collections-page-client";

export default async function CollectionsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/sign-in");

  const collections = await prisma.collection.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    include: {
      documents: { select: { id: true, title: true, fileType: true }, take: 4 },
      _count: { select: { documents: true } },
    },
  });

  const serializableCollections = collections.map((c) => ({
    id: c.id,
    name: c.name,
    isDefault: c.isDefault,
    documentCount: c._count.documents,
    previewDocuments: c.documents.map((d) => ({
      id: d.id,
      title: d.title,
      fileType: d.fileType as "pdf" | "docx" | "csv" | "code",
    })),
  }));

  return <CollectionsPageClient collections={serializableCollections} />;
}
