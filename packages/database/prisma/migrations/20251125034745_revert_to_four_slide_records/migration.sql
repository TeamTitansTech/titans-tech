/*
  Revert to Four Slide Records Architecture

  This migration reverts the previous consolidation (20251123170925_restructure_slide_section)
  and returns to the more normalized design where:
  - Each SlideData contains only position1-5 (not beforePosition + afterPosition)
  - MachineServiceSlide has 4 foreign keys (outerBeforeId, outerDataId, innerBeforeId, innerDataId)

  Data Preservation Strategy:
  1. Split each existing SlideData (that has beforePosition data) into two records
  2. Keep metadata duplicated across both records (per user's architectural preference)
*/

-- Step 1: Add new foreign key columns to machine_service_slide (nullable for now)
ALTER TABLE "machine_service_slide"
ADD COLUMN "outerBeforeId" TEXT,
ADD COLUMN "innerBeforeId" TEXT;

-- Step 2: Add new position columns to service_data_slide (nullable for now)
ALTER TABLE "service_data_slide"
ADD COLUMN "position1" DECIMAL(10,4),
ADD COLUMN "position2" DECIMAL(10,4),
ADD COLUMN "position3" DECIMAL(10,4),
ADD COLUMN "position4" DECIMAL(10,4),
ADD COLUMN "position5" DECIMAL(10,4);

-- Step 3: For each outerData record that has beforePosition data, create a new "before" record
INSERT INTO "service_data_slide" (
  id,
  "parallelism",
  "hasParallelismBeenAdjusted",
  "shutheightIndicatorsChecked",
  "overloadsOnTonnageMonitor",
  "shutheightActualSh",
  "indicatorReading",
  "position1",
  "position2",
  "position3",
  "position4",
  "position5",
  "createdAt",
  "updatedAt"
)
SELECT
  gen_random_uuid()::text,
  sd."parallelism",
  sd."hasParallelismBeenAdjusted",
  sd."shutheightIndicatorsChecked",
  sd."overloadsOnTonnageMonitor",
  sd."shutheightActualSh",
  sd."indicatorReading",
  sd."beforePosition1",
  sd."beforePosition2",
  sd."beforePosition3",
  sd."beforePosition4",
  sd."beforePosition5",
  sd."createdAt",
  NOW()
FROM "service_data_slide" AS sd
JOIN "machine_service_slide" AS mss ON mss."outerDataId" = sd.id
WHERE sd."beforePosition1" IS NOT NULL
RETURNING id, (
  SELECT mss."outerDataId"
  FROM "machine_service_slide" AS mss
  WHERE mss."outerDataId" = (
    SELECT sd2.id
    FROM "service_data_slide" AS sd2
    WHERE sd2."beforePosition1" = "position1"
    LIMIT 1
  )
);

-- Step 3a: Update machine_service_slide with the new outerBeforeId references
WITH new_before_records AS (
  SELECT
    sd_new.id AS new_before_id,
    sd_orig.id AS orig_after_id
  FROM "service_data_slide" AS sd_new
  JOIN "service_data_slide" AS sd_orig ON (
    sd_new."position1" = sd_orig."beforePosition1"
    AND sd_new."position2" = sd_orig."beforePosition2"
    AND sd_new."position3" = sd_orig."beforePosition3"
    AND sd_new."position4" = sd_orig."beforePosition4"
    AND sd_new."position5" = sd_orig."beforePosition5"
    AND sd_orig."beforePosition1" IS NOT NULL
  )
)
UPDATE "machine_service_slide" AS mss
SET "outerBeforeId" = nbr.new_before_id
FROM new_before_records AS nbr
WHERE mss."outerDataId" = nbr.orig_after_id;

-- Step 4: For each innerData record that has beforePosition data, create a new "before" record
INSERT INTO "service_data_slide" (
  id,
  "parallelism",
  "hasParallelismBeenAdjusted",
  "shutheightIndicatorsChecked",
  "overloadsOnTonnageMonitor",
  "shutheightActualSh",
  "indicatorReading",
  "position1",
  "position2",
  "position3",
  "position4",
  "position5",
  "createdAt",
  "updatedAt"
)
SELECT
  gen_random_uuid()::text,
  sd."parallelism",
  sd."hasParallelismBeenAdjusted",
  sd."shutheightIndicatorsChecked",
  sd."overloadsOnTonnageMonitor",
  sd."shutheightActualSh",
  sd."indicatorReading",
  sd."beforePosition1",
  sd."beforePosition2",
  sd."beforePosition3",
  sd."beforePosition4",
  sd."beforePosition5",
  sd."createdAt",
  NOW()
FROM "service_data_slide" AS sd
JOIN "machine_service_slide" AS mss ON mss."innerDataId" = sd.id
WHERE sd."beforePosition1" IS NOT NULL;

-- Step 4a: Update machine_service_slide with the new innerBeforeId references
WITH new_before_records AS (
  SELECT
    sd_new.id AS new_before_id,
    sd_orig.id AS orig_after_id
  FROM "service_data_slide" AS sd_new
  JOIN "service_data_slide" AS sd_orig ON (
    sd_new."position1" = sd_orig."beforePosition1"
    AND sd_new."position2" = sd_orig."beforePosition2"
    AND sd_new."position3" = sd_orig."beforePosition3"
    AND sd_new."position4" = sd_orig."beforePosition4"
    AND sd_new."position5" = sd_orig."beforePosition5"
    AND sd_orig."beforePosition1" IS NOT NULL
  )
  WHERE NOT EXISTS (
    SELECT 1 FROM "machine_service_slide" WHERE "outerDataId" = sd_orig.id
  )
)
UPDATE "machine_service_slide" AS mss
SET "innerBeforeId" = nbr.new_before_id
FROM new_before_records AS nbr
WHERE mss."innerDataId" = nbr.orig_after_id;

-- Step 5: Migrate afterPosition data to position columns for all existing records
UPDATE "service_data_slide"
SET
  "position1" = "afterPosition1",
  "position2" = "afterPosition2",
  "position3" = "afterPosition3",
  "position4" = "afterPosition4",
  "position5" = "afterPosition5"
WHERE "afterPosition1" IS NOT NULL;

-- Step 6: Make position columns NOT NULL
ALTER TABLE "service_data_slide"
ALTER COLUMN "position1" SET NOT NULL,
ALTER COLUMN "position2" SET NOT NULL,
ALTER COLUMN "position3" SET NOT NULL,
ALTER COLUMN "position4" SET NOT NULL,
ALTER COLUMN "position5" SET NOT NULL;

-- Step 7: Drop old beforePosition and afterPosition columns
ALTER TABLE "service_data_slide"
DROP COLUMN "beforePosition1",
DROP COLUMN "beforePosition2",
DROP COLUMN "beforePosition3",
DROP COLUMN "beforePosition4",
DROP COLUMN "beforePosition5",
DROP COLUMN "afterPosition1",
DROP COLUMN "afterPosition2",
DROP COLUMN "afterPosition3",
DROP COLUMN "afterPosition4",
DROP COLUMN "afterPosition5";

-- Step 8: Add foreign key constraints for new columns
ALTER TABLE "machine_service_slide"
ADD CONSTRAINT "machine_service_slide_outerBeforeId_fkey"
FOREIGN KEY ("outerBeforeId") REFERENCES "service_data_slide"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "machine_service_slide"
ADD CONSTRAINT "machine_service_slide_innerBeforeId_fkey"
FOREIGN KEY ("innerBeforeId") REFERENCES "service_data_slide"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- Step 9: Update existing foreign key constraints to match new relation names
-- (Drop and recreate with updated names for clarity)
ALTER TABLE "machine_service_slide" DROP CONSTRAINT "machine_service_slide_outerDataId_fkey";
ALTER TABLE "machine_service_slide" DROP CONSTRAINT "machine_service_slide_innerDataId_fkey";

ALTER TABLE "machine_service_slide"
ADD CONSTRAINT "machine_service_slide_outerDataId_fkey"
FOREIGN KEY ("outerDataId") REFERENCES "service_data_slide"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "machine_service_slide"
ADD CONSTRAINT "machine_service_slide_innerDataId_fkey"
FOREIGN KEY ("innerDataId") REFERENCES "service_data_slide"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
