-- Additive initial schema. Roll back by dropping these new tables and enum only
-- before any production data exists; afterwards prefer a forward migration.
CREATE TYPE "JourneyStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'ARCHIVED');

CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "journeys" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "status" "JourneyStatus" NOT NULL DEFAULT 'ACTIVE',
    "context" VARCHAR(64) NOT NULL,
    "approximate_age" VARCHAR(64) NOT NULL,
    "goal" VARCHAR(160) NOT NULL,
    "started_at" TIMESTAMPTZ(3) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "journeys_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "skin_areas" (
    "id" UUID NOT NULL,
    "journey_id" UUID NOT NULL,
    "body_region" VARCHAR(64) NOT NULL,
    "side" VARCHAR(32) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "skin_areas_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "journeys_user_id_created_at_idx" ON "journeys"("user_id", "created_at");
CREATE UNIQUE INDEX "skin_areas_journey_id_key" ON "skin_areas"("journey_id");
ALTER TABLE "journeys" ADD CONSTRAINT "journeys_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "skin_areas" ADD CONSTRAINT "skin_areas_journey_id_fkey" FOREIGN KEY ("journey_id") REFERENCES "journeys"("id") ON DELETE CASCADE ON UPDATE CASCADE;
