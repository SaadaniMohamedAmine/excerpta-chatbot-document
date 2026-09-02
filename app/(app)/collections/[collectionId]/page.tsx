// app/(app)/collections/[collectionId]/page.tsx
import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import CollectionWorkspace from "@/components/workspace/CollectionWorkspace";

interface PageProps {
  params: Promise<{ collectionId: string }>;
}

export default async function CollectionPage({ params }: PageProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/sign-in");

  const { collectionId } = await params;

  const collection = await prisma.collection.findFirst({
    where: { id: collectionId, userId: session.user.id },
    include: { documents: true },
  });

  if (!collection) {
    notFound();
  }

  const serializable = {
    id: collection.id,
    name: collection.name,
    documents: collection.documents.map((d) => ({
      id: d.id,
      title: d.title,
      fileType: d.fileType as "pdf" | "docx" | "csv" | "code",
      status: d.status as "processing" | "ready" | "failed",
    })),
  };

  return <CollectionWorkspace collection={serializable} />;
}
