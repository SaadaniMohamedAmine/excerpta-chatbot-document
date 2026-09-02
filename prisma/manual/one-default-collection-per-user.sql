-- prisma/manual/one-default-collection-per-user.sql
-- Guarantees at the DB level that an account can never end up with two
-- default collections, even under concurrent creation — Prisma doesn't
-- support declaring a partial unique index natively in the schema yet, so
-- this is applied by hand via `prisma db execute`. See
-- lib/collections.ts's getOrCreateDefaultCollection for the P2002 handling
-- this backs.
CREATE UNIQUE INDEX IF NOT EXISTS collection_one_default_per_user
ON "Collection" ("userId")
WHERE "isDefault" = true;
