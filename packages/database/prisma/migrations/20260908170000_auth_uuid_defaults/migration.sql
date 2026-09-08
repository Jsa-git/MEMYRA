-- Better Auth may omit primary keys and rely on database-generated UUIDs.
-- This is additive and backward-compatible with callers that still provide IDs.
ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "sessions" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "accounts" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "verifications" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
