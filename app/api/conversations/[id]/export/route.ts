// app/api/conversations/[id]/export/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateConversationPdf } from "@/lib/export/pdf";
import { generateConversationDocx } from "@/lib/export/docx";
import type { Citation, ExportConversation } from "@/lib/export/types";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const format = request.nextUrl.searchParams.get("format");
  if (format !== "pdf" && format !== "docx") {
    return NextResponse.json(
      { error: "Invalid format. Use ?format=pdf or ?format=docx." },
      { status: 400 }
    );
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }
  if (conversation.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let title = "Untitled conversation";
  if (conversation.documentId) {
    const document = await prisma.document.findUnique({
      where: { id: conversation.documentId },
      select: { title: true },
    });
    if (document?.title) title = document.title;
  } else if (conversation.collectionId) {
    const collection = await prisma.collection.findUnique({
      where: { id: conversation.collectionId },
      select: { name: true },
    });
    if (collection?.name) title = collection.name;
  }

  const exportConversation: ExportConversation = {
    id: conversation.id,
    title,
    messages: conversation.messages.map((message) => ({
      id: message.id,
      role: message.role,
      content: message.content,
      citations: (message.citations as unknown as Citation[] | null) ?? null,
      createdAt: message.createdAt,
    })),
  };

  const safeTitle =
    title.replace(/[^a-z0-9-_ ]/gi, "").trim().slice(0, 60) || "conversation";

  if (format === "pdf") {
    const buffer = await generateConversationPdf(exportConversation);
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeTitle}.pdf"`,
      },
    });
  }

  const buffer = await generateConversationDocx(exportConversation);
  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${safeTitle}.docx"`,
    },
  });
}
