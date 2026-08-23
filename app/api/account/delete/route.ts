// app/api/account/delete/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { deleteUserData } from "@/lib/settings/delete-account";

export const runtime = "nodejs";

export async function DELETE(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    await deleteUserData(userId);
  } catch (err) {
    console.error(`[DELETE /api/account/delete] Failed for user ${userId}:`, err);
    return NextResponse.json(
      { error: "Couldn't delete your account. Try again or contact support." },
      { status: 500 }
    );
  }

  // Invalidate the session now that the User row (and its Session rows,
  // via cascade) are gone. Non-fatal if it throws — the rows are already
  // gone either way, at worst the cookie is orphaned client-side.
  try {
    await auth.api.signOut({ headers: request.headers });
  } catch (err) {
    console.error(
      `[DELETE /api/account/delete] signOut cleanup failed for user ${userId}:`,
      err
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.delete("better-auth.session_token");
  return response;
}
