/*
  Warnings:

  - You are about to drop the column `innerBeforeId` on the `machine_service_slide` table. All the data in the column will be lost.
  - You are about to drop the column `innerHasParallelismBeenAdjusted` on the `machine_service_slide` table. All the data in the column will be lost.
  - You are about to drop the column `innerIndicatorReading` on the `machine_service_slide` table. All the data in the column will be lost.
  - You are about to drop the column `innerOverloadsOnTonnageMonitor` on the `machine_service_slide` table. All the data in the column will be lost.
  - You are about to drop the column `innerParallelism` on the `machine_service_slide` table. All the data in the column will be lost.
  - You are about to drop the column `innerShutheightActualSh` on the `machine_service_slide` table. All the data in the column will be lost.
  - You are about to drop the column `innerShutheightIndicatorsChecked` on the `machine_service_slide` table. All the data in the column will be lost.
  - You are about to drop the column `outerBeforeId` on the `machine_service_slide` table. All the data in the column will be lost.
  - You are about to drop the column `outerHasParallelismBeenAdjusted` on the `machine_service_slide` table. All the data in the column will be lost.
  - You are about to drop the column `outerIndicatorReading` on the `machine_service_slide` table. All the data in the column will be lost.
  - You are about to drop the column `outerOverloadsOnTonnageMonitor` on the `machine_service_slide` table. All the data in the column will be lost.
  - You are about to drop the column `outerParallelism` on the `machine_service_slide` table. All the data in the column will be lost.
  - You are about to drop the column `outerShutheightActualSh` on the `machine_service_slide` table. All the data in the column will be lost.
  - You are about to drop the column `outerShutheightIndicatorsChecked` on the `machine_service_slide` table. All the data in the column will be lost.
  - You are about to drop the column `position1` on the `service_data_slide` table. All the data in the column will be lost.
  - You are about to drop the column `position2` on the `service_data_slide` table. All the data in the column will be lost.
  - You are about to drop the column `position3` on the `service_data_slide` table. All the data in the column will be lost.
  - You are about to drop the column `position4` on the `service_data_slide` table. All the data in the column will be lost.
  - You are about to drop the column `position5` on the `service_data_slide` table. All the data in the column will be lost.
  - You are about to drop the column `position6` on the `service_data_slide` table. All the data in the column will be lost.
  - Added the required column `afterPosition1` to the `service_data_slide` table without a default value. This is not possible if the table is not empty.
  - Added the required column `afterPosition2` to the `service_data_slide` table without a default value. This is not possible if the table is not empty.
  - Added the required column `afterPosition3` to the `service_data_slide` table without a default value. This is not possible if the table is not empty.
  - Added the required column `afterPosition4` to the `service_data_slide` table without a default value. This is not possible if the table is not empty.
  - Added the required column `afterPosition5` to the `service_data_slide` table without a default value. This is not possible if the table is not empty.

*/

-- Step 1: Add new columns to service_data_slide
ALTER TABLE "service_data_slide"
ADD COLUMN "afterPosition1" DECIMAL(10,4),
ADD COLUMN "afterPosition2" DECIMAL(10,4),
ADD COLUMN "afterPosition3" DECIMAL(10,4),
ADD COLUMN "afterPosition4" DECIMAL(10,4),
ADD COLUMN "afterPosition5" DECIMAL(10,4),
ADD COLUMN "beforePosition1" DECIMAL(10,4),
ADD COLUMN "beforePosition2" DECIMAL(10,4),
ADD COLUMN "beforePosition3" DECIMAL(10,4),
ADD COLUMN "beforePosition4" DECIMAL(10,4),
ADD COLUMN "beforePosition5" DECIMAL(10,4),
ADD COLUMN "hasParallelismBeenAdjusted" "YesNoNaDncType",
ADD COLUMN "indicatorReading" TEXT,
ADD COLUMN "overloadsOnTonnageMonitor" TEXT,
ADD COLUMN "parallelism" "ParallelismType",
ADD COLUMN "shutheightActualSh" TEXT,
ADD COLUMN "shutheightIndicatorsChecked" "YesNoDncType";

-- Step 2: Migrate existing data from position1-5 to afterPosition1-5
UPDATE "service_data_slide"
SET
  "afterPosition1" = "position1",
  "afterPosition2" = "position2",
  "afterPosition3" = "position3",
  "afterPosition4" = "position4",
  "afterPosition5" = "position5";

-- Step 3: For each outer "after" record, merge with its "before" counterpart if exists
UPDATE "service_data_slide" AS after_data
SET
  "beforePosition1" = before_data."position1",
  "beforePosition2" = before_data."position2",
  "beforePosition3" = before_data."position3",
  "beforePosition4" = before_data."position4",
  "beforePosition5" = before_data."position5"
FROM "service_data_slide" AS before_data
JOIN "machine_service_slide" AS mss ON (
  mss."outerDataId" = after_data.id
  AND mss."outerBeforeId" = before_data.id
  AND mss."outerBeforeId" IS NOT NULL
);

-- Step 4: For each inner "after" record, merge with its "before" counterpart if exists
UPDATE "service_data_slide" AS after_data
SET
  "beforePosition1" = before_data."position1",
  "beforePosition2" = before_data."position2",
  "beforePosition3" = before_data."position3",
  "beforePosition4" = before_data."position4",
  "beforePosition5" = before_data."position5"
FROM "service_data_slide" AS before_data
JOIN "machine_service_slide" AS mss ON (
  mss."innerDataId" = after_data.id
  AND mss."innerBeforeId" = before_data.id
  AND mss."innerBeforeId" IS NOT NULL
);

-- Step 5: Migrate outer metadata from machine_service_slide to outerData SlideData
UPDATE "service_data_slide" AS sd
SET
  "parallelism" = mss."outerParallelism",
  "hasParallelismBeenAdjusted" = mss."outerHasParallelismBeenAdjusted",
  "shutheightIndicatorsChecked" = mss."outerShutheightIndicatorsChecked",
  "overloadsOnTonnageMonitor" = mss."outerOverloadsOnTonnageMonitor",
  "shutheightActualSh" = mss."outerShutheightActualSh",
  "indicatorReading" = mss."outerIndicatorReading"
FROM "machine_service_slide" AS mss
WHERE mss."outerDataId" = sd.id AND mss."outerDataId" IS NOT NULL;

-- Step 6: Migrate inner metadata from machine_service_slide to innerData SlideData
UPDATE "service_data_slide" AS sd
SET
  "parallelism" = mss."innerParallelism",
  "hasParallelismBeenAdjusted" = mss."innerHasParallelismBeenAdjusted",
  "shutheightIndicatorsChecked" = mss."innerShutheightIndicatorsChecked",
  "overloadsOnTonnageMonitor" = mss."innerOverloadsOnTonnageMonitor",
  "shutheightActualSh" = mss."innerShutheightActualSh",
  "indicatorReading" = mss."innerIndicatorReading"
FROM "machine_service_slide" AS mss
WHERE mss."innerDataId" = sd.id AND mss."innerDataId" IS NOT NULL;

-- Step 7: Delete orphaned "before" SlideData records (no longer referenced)
DELETE FROM "service_data_slide"
WHERE id IN (
  SELECT "outerBeforeId" FROM "machine_service_slide" WHERE "outerBeforeId" IS NOT NULL
  UNION
  SELECT "innerBeforeId" FROM "machine_service_slide" WHERE "innerBeforeId" IS NOT NULL
);

-- Step 8: Drop old foreign key constraints
ALTER TABLE "machine_service_slide" DROP CONSTRAINT IF EXISTS "machine_service_slide_innerBeforeId_fkey";
ALTER TABLE "machine_service_slide" DROP CONSTRAINT IF EXISTS "machine_service_slide_outerBeforeId_fkey";

-- Step 9: Drop old columns from machine_service_slide
ALTER TABLE "machine_service_slide"
DROP COLUMN "innerBeforeId",
DROP COLUMN "innerHasParallelismBeenAdjusted",
DROP COLUMN "innerIndicatorReading",
DROP COLUMN "innerOverloadsOnTonnageMonitor",
DROP COLUMN "innerParallelism",
DROP COLUMN "innerShutheightActualSh",
DROP COLUMN "innerShutheightIndicatorsChecked",
DROP COLUMN "outerBeforeId",
DROP COLUMN "outerHasParallelismBeenAdjusted",
DROP COLUMN "outerIndicatorReading",
DROP COLUMN "outerOverloadsOnTonnageMonitor",
DROP COLUMN "outerParallelism",
DROP COLUMN "outerShutheightActualSh",
DROP COLUMN "outerShutheightIndicatorsChecked";

-- Step 10: Drop old position columns from service_data_slide
ALTER TABLE "service_data_slide"
DROP COLUMN "position1",
DROP COLUMN "position2",
DROP COLUMN "position3",
DROP COLUMN "position4",
DROP COLUMN "position5",
DROP COLUMN "position6";

-- Step 11: Make afterPosition columns NOT NULL (now that data is migrated)
ALTER TABLE "service_data_slide"
ALTER COLUMN "afterPosition1" SET NOT NULL,
ALTER COLUMN "afterPosition2" SET NOT NULL,
ALTER COLUMN "afterPosition3" SET NOT NULL,
ALTER COLUMN "afterPosition4" SET NOT NULL,
ALTER COLUMN "afterPosition5" SET NOT NULL;
