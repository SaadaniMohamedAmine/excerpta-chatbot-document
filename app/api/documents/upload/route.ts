// app/api/documents/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { auth } from "@/lib/auth";
import { ALLOWED_EXTENSIONS, ALLOWED_CONTENT_TYPES, MAX_FILE_SIZE_BYTES } from "@/lib/documents/constraints";
import { assertCanUpload } from "@/lib/billing/usage";
import { rateLimit } from "@/lib/rate-limit";

// The monthly plan quota (assertCanUpload) already caps total volume; this
// separately throttles the *rate* of requests to this token-generation
// endpoint itself, which is cheap to call but still worth not letting a
// script hammer.
const UPLOAD_RATE_LIMIT = 10;
const UPLOAD_RATE_WINDOW_MS = 60_000;

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limit = rateLimit(`upload:${session.user.id}`, UPLOAD_RATE_LIMIT, UPLOAD_RATE_WINDOW_MS);
  if (!limit.ok) {
    const t = await getTranslations("Common");
    return NextResponse.json(
      { error: t("tooManyRequests") },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        // Rejects before a Blob upload token is even issued — avoids
        // consuming storage for an upload that would never be confirmed.
        await assertCanUpload(session.user.id);

        const extension = pathname.split(".").pop()?.toLowerCase() ?? "";
        const fileType = ALLOWED_EXTENSIONS[extension];
        if (!fileType) {
          throw new Error(`Unsupported file extension: .${extension}`);
        }

        let parsed: { title?: string; declaredSize?: number } = {};
        try {
          parsed = clientPayload ? JSON.parse(clientPayload) : {};
        } catch {
          // malformed payload — fall back to defaults below
        }

        if (typeof parsed.declaredSize === "number" && parsed.declaredSize > MAX_FILE_SIZE_BYTES) {
          throw new Error("File exceeds the 25MB upload limit");
        }

        return {
          allowedContentTypes: ALLOWED_CONTENT_TYPES,
          maximumSizeInBytes: MAX_FILE_SIZE_BYTES,
          addRandomSuffix: true,
          // Carries the authenticated user id + resolved fileType through the
          // token round-trip so later steps don't have to re-derive them from
          // an unauthenticated context.
          tokenPayload: JSON.stringify({
            userId: session.user.id,
            fileType,
            title: parsed.title ?? pathname,
          }),
        };
      },
      // Intentionally a no-op — document creation happens in
      // POST /api/documents/finalize instead, called directly by the client
      // (onUploadCompleted is a webhook that doesn't fire against localhost).
      onUploadCompleted: async () => {},
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("[documents/upload] token generation failed:", error);
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json(
      { error: message },
      // 402 specifically on the quota case, so the frontend can tell "you
      // need to upgrade" apart from an ordinary validation error (400).
      { status: message.includes("monthly upload limit") ? 402 : 400 }
    );
  }
}
