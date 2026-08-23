// lib/auth-actions.ts
"use client";

import { authClient } from "@/lib/auth-client";

/**
 * Deliberately just a session/cookie clear, not a call to Better Auth's
 * own `authClient.deleteUser()`. Two reasons:
 *
 * 1. `deleteUser()` requires `user.deleteUser.enabled: true` in the server
 *    betterAuth() config (lib/auth.ts) — not configured, and enabling it
 *    for real (with `sendDeleteAccountVerification`) needs an email
 *    provider this app doesn't have.
 * 2. By the time this runs, the account is already gone: DELETE
 *    /api/account/delete (see lib/settings/delete-account.ts) has already
 *    deleted the User row server-side, cascading Sessions with it. Calling
 *    deleteUser() afterward would be operating on a session/user that no
 *    longer exists.
 *
 * So this function's only remaining job is clearing the local
 * session/cookie once the account is already deleted.
 */
export async function deleteCurrentUserAccount(): Promise<void> {
  await authClient.signOut();
}
