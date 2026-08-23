import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import LandingPage from "@/components/landing/LandingPage";

// Public marketing page for signed-out visitors. Signed-in visitors are
// sent straight to their documents instead of seeing the marketing page
// again — the previous version of this file was a bare redirect("/documents")
// (Phase 3 §3.5's "root redirect" glue); that behavior is preserved here for
// authenticated users, just no longer unconditional.
export default async function RootPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session?.user) {
    redirect("/documents");
  }

  return <LandingPage />;
}
