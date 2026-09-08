-- Better Auth 1.7.0-1.7.2 scopes account identities by issuer.
ALTER TABLE "accounts" ADD COLUMN "issuer" VARCHAR(255) NOT NULL;

DROP INDEX "accounts_provider_id_account_id_key";
CREATE UNIQUE INDEX "accounts_issuer_account_id_key" ON "accounts"("issuer", "account_id");
