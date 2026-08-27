// app/api/documents/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Lightweight list, called by the command palette on open.
export async function GET(req: NextRequest): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const documents = await prisma.document.findMany({
    where: { userId: session.user.id },
    select: { id: true, title: true, fileType: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json(documents);
}
