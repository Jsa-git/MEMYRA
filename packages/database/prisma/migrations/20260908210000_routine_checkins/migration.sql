CREATE TABLE "routine_plans" (
  "id" UUID NOT NULL, "journey_id" UUID NOT NULL, "duration_days" INTEGER NOT NULL,
  "photo_interval_days" INTEGER NOT NULL, "periods" TEXT[] NOT NULL,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "routine_plans_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "routine_plans_journey_id_fkey" FOREIGN KEY ("journey_id") REFERENCES "journeys"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX "routine_plans_journey_id_key" ON "routine_plans"("journey_id");

CREATE TABLE "routine_check_ins" (
  "id" UUID NOT NULL, "routine_plan_id" UUID NOT NULL, "local_date" VARCHAR(10) NOT NULL,
  "period" VARCHAR(16) NOT NULL, "completed" BOOLEAN NOT NULL,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "routine_check_ins_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "routine_check_ins_routine_plan_id_fkey" FOREIGN KEY ("routine_plan_id") REFERENCES "routine_plans"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX "routine_check_ins_routine_plan_id_local_date_period_key" ON "routine_check_ins"("routine_plan_id", "local_date", "period");
CREATE INDEX "routine_check_ins_routine_plan_id_local_date_idx" ON "routine_check_ins"("routine_plan_id", "local_date");
