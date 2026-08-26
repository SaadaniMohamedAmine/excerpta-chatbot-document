// prisma/seed.ts
//
// Seeds fixed demo accounts (test1-3, demo, pro) so they can sign in
// directly from /sign-in without registering first. Portfolio-demo
// convenience only — regular sign-up is untouched, and these accounts have
// no elevated permissions (the schema has no role/plan field, so every
// account can already do everything a signed-in user can). Idempotent:
// re-running skips accounts that already exist.
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const DEMO_PASSWORD = "Excerpta2026!";

const DEMO_USERS = [
  { name: "Test User 1", email: "test1@excerpta.app" },
  { name: "Test User 2", email: "test2@excerpta.app" },
  { name: "Test User 3", email: "test3@excerpta.app" },
  { name: "Demo User", email: "demo@excerpta.app" },
  { name: "Pro User", email: "pro@excerpta.app" },
];

async function main() {
  const { auth } = await import("../lib/auth");
  const { prisma } = await import("../lib/db");

  for (const { name, email } of DEMO_USERS) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      console.log(`skip (already exists): ${email}`);
      continue;
    }

    await auth.api.signUpEmail({ body: { name, email, password: DEMO_PASSWORD } });
    console.log(`created: ${email}`);
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
