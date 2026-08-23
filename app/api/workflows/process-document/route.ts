// app/api/workflows/process-document/route.ts
//
// VERIFY BEFORE RELYING ON DURABILITY: Vercel Workflows' exact package/API
// was explicitly flagged as fast-moving in the delegation file this was
// written from. `step.run` below is a local no-op shim (each "step" just
// runs inline in the same request) — NOT a real durable-execution SDK.
// Confirm the current Workflows package/API before treating this as durable;
// until then this is a raised-timeout serverless route, not a resumable one.
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { extractStage, chunkStage, embedAndStoreStage, finalizeStage } from "@/lib/documents/process";

// VERIFY against your Vercel plan's actual ceiling for workflow/long-running routes.
export const maxDuration = 300;
export const dynamic = "force-dynamic";

const step = {
  run: async <T,>(_name: string, fn: () => Promise<T>): Promise<T> => fn(),
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  const { documentId } = (await request.json()) as { documentId: string };
  if (!documentId) {
    return NextResponse.json({ error: "documentId is required" }, { status: 400 });
  }

  try {
    // WORKFLOW STEP: extract
    const { fileType, extracted, userId } = await step.run("extract", () => extractStage(documentId));

    // WORKFLOW STEP: chunk
    const chunks = await step.run("chunk", () => chunkStage(fileType, extracted));

    // WORKFLOW STEP: embed + store
    await step.run("embed-and-store", () => embedAndStoreStage(documentId, chunks));

    // WORKFLOW STEP: finalize
    await step.run("finalize", () => finalizeStage(documentId, userId, fileType, extracted, chunks));

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error(`[workflow] processing failed for ${documentId}:`, error);
    await prisma.document.update({ where: { id: documentId }, data: { status: "failed" } }).catch(() => {});
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
}
