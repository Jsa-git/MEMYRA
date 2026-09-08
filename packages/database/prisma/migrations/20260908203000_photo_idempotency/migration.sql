ALTER TABLE "photo_records" ADD COLUMN "upload_id" UUID;
UPDATE "photo_records" SET "upload_id" = "id" WHERE "upload_id" IS NULL;
ALTER TABLE "photo_records" ALTER COLUMN "upload_id" SET NOT NULL;
CREATE UNIQUE INDEX "photo_records_upload_id_key" ON "photo_records"("upload_id");
