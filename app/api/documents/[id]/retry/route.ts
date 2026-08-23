// app/api/documents/[id]/retry/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(
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

  await prisma.document.update({
    where: { id: document.id },
    data: { status: "processing" },
  });

  // Same fire-and-forget trigger as /api/documents/finalize, so there is a
  // single code path for "how processing gets kicked off" — do NOT call
  // lib/documents/process.ts directly from here.
  const workflowUrl = new URL("/api/workflows/process-document", request.url);
  fetch(workflowUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ documentId: document.id }),
  }).catch((error) => {
    console.error("[retry] failed to trigger processing workflow:", error);
  });

  return NextResponse.json({ status: "processing" });
}
