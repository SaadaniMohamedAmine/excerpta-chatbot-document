// app/api/conversations/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  if (!conversation || conversation.userId !== session.user.id) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  return NextResponse.json({ conversation });
}

// Note: isPublic/shareToken already exist on the Conversation model (for a
// future public-share feature) but no sharing flow is implemented here —
// that's out of scope. GET above always requires ownership; it does not
// check isPublic. Do not add a sharing endpoint unless a later phase
// explicitly asks for one.
