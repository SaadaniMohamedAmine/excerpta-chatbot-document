// app/api/documents/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Polled by ProcessingPanel every 3s while a document is still processing.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const document = await prisma.document.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!document) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    id: document.id,
    title: document.title,
    fileType: document.fileType,
    fileUrl: document.fileUrl,
    fileSize: document.fileSize,
    pageCount: document.pageCount,
    status: document.status,
    suggestedQuestions: document.suggestedQuestions ?? [],
    createdAt: document.createdAt.toISOString(),
  });
}
