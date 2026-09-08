CREATE TABLE "photo_records" (
  "id" UUID NOT NULL,
  "journey_id" UUID NOT NULL,
  "skin_area_id" UUID NOT NULL,
  "captured_at" TIMESTAMPTZ(3) NOT NULL,
  "storage_key" VARCHAR(255) NOT NULL,
  "width" INTEGER NOT NULL,
  "height" INTEGER NOT NULL,
  "orientation" VARCHAR(16) NOT NULL,
  "framing" VARCHAR(24) NOT NULL,
  "distance" VARCHAR(24) NOT NULL,
  "lighting" VARCHAR(24) NOT NULL,
  "quality_status" VARCHAR(24) NOT NULL,
  "processing_status" VARCHAR(24) NOT NULL,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "photo_records_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "photo_records_journey_id_fkey" FOREIGN KEY ("journey_id") REFERENCES "journeys"("id") ON DELETE CASCADE,
  CONSTRAINT "photo_records_skin_area_id_fkey" FOREIGN KEY ("skin_area_id") REFERENCES "skin_areas"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX "photo_records_storage_key_key" ON "photo_records"("storage_key");
CREATE INDEX "photo_records_journey_id_captured_at_idx" ON "photo_records"("journey_id", "captured_at");
CREATE INDEX "photo_records_skin_area_id_captured_at_idx" ON "photo_records"("skin_area_id", "captured_at");
