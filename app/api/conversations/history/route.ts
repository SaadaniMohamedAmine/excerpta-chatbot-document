// app/api/conversations/history/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { fetchHistoryPage } from "@/lib/history";

// Static segment — takes precedence over the [id] dynamic route at the same
// level, so GET /api/conversations/history never matches conversationId="history".
export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor") ?? undefined;
  const q = searchParams.get("q")?.trim() || undefined;

  const { items, nextCursor } = await fetchHistoryPage(session.user.id, { cursor, q });

  return NextResponse.json({ items, nextCursor });
}
