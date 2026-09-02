// app/api/documents/finalize/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ALLOWED_EXTENSIONS, MAX_FILE_SIZE_BYTES } from "@/lib/documents/constraints";
import { assertCanUpload, incrementUsage } from "@/lib/billing/usage";
import { resolveUploadCollectionId } from "@/lib/collections";

type FinalizeBody = {
  fileUrl: string;
  pathname: string;
  title: string;
  fileSize: number;
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { fileUrl, pathname, title, fileSize } = (await request.json()) as FinalizeBody;

  if (!fileUrl || !pathname || !title || !fileSize) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (fileSize > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json({ error: "File exceeds the 25MB upload limit" }, { status: 400 });
  }

  const extension = pathname.split(".").pop()?.toLowerCase() ?? "";
  const fileType = ALLOWED_EXTENSIONS[extension];
  if (!fileType) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }

  // Idempotency guard — if the client retries this call (e.g. a flaky network
  // after the Blob upload itself already succeeded), don't create a duplicate.
  const existing = await prisma.document.findFirst({ where: { fileUrl } });
  if (existing) {
    return NextResponse.json({ document: existing }, { status: 200 });
  }

  // Second check here (defense in depth, same pattern as the rest of the
  // app) — this is also the only place that actually increments usage, so a
  // Blob upload abandoned before finalization never consumes quota.
  try {
    await assertCanUpload(session.user.id);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Quota exceeded" },
      { status: 402 }
    );
  }

  // collectionId is required in the schema — resolved here rather than
  // waiting on the post-upload popup, so the document is already correctly
  // filed (last-used collection, or the default) before that popup, which
  // only offers to move it, ever shows.
  const collectionId = await resolveUploadCollectionId(session.user.id);

  const document = await prisma.document.create({
    data: {
      userId: session.user.id,
      title,
      fileType,
      fileUrl,
      fileSize,
      status: "processing",
      collectionId,
    },
  });

  await incrementUsage(session.user.id);

  // Fire-and-forget trigger of async processing — do NOT await this.
  const workflowUrl = new URL("/api/workflows/process-document", request.url);
  fetch(workflowUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ documentId: document.id }),
  }).catch((error) => {
    console.error("[finalize] failed to trigger processing workflow:", error);
  });

  return NextResponse.json({ document }, { status: 201 });
}
