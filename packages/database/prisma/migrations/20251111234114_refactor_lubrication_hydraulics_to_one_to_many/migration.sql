-- Drop existing tables/enums if they exist from previous migrations
DROP TABLE IF EXISTS "lubrication_hydraulics_measurements" CASCADE;
DROP TYPE IF EXISTS "LubricationSystemType" CASCADE;

-- CreateEnum
CREATE TYPE "SystemType" AS ENUM ('LUBE', 'HYD', 'MONITORFLOW', 'PRESS_SW', 'GIB');

-- CreateEnum
CREATE TYPE "PsiStatusType" AS ENUM ('OK', 'NA', 'DNC', 'DAMAGED');

-- CreateTable
CREATE TABLE "lubrication_hydraulics_gauges" (
    "id" TEXT NOT NULL,
    "lubricationHydraulicsDataId" TEXT NOT NULL,
    "system" "SystemType" NOT NULL,
    "gauge" TEXT,
    "psi" "PsiStatusType",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lubrication_hydraulics_gauges_pkey" PRIMARY KEY ("id")
);

-- Migrate existing data from service_data_lubrication_hydraulics to lubrication_hydraulics_gauges
-- For each record with PSI data, create gauge entries
INSERT INTO "lubrication_hydraulics_gauges" ("id", "lubricationHydraulicsDataId", "system", "gauge", "psi", "createdAt", "updatedAt")
SELECT
    gen_random_uuid(),
    id,
    'LUBE',
    CAST("lubePSI" AS TEXT),
    'OK',
    "createdAt",
    "updatedAt"
FROM "service_data_lubrication_hydraulics"
WHERE "lubePSI" IS NOT NULL;

INSERT INTO "lubrication_hydraulics_gauges" ("id", "lubricationHydraulicsDataId", "system", "gauge", "psi", "createdAt", "updatedAt")
SELECT
    gen_random_uuid(),
    id,
    'HYD',
    CAST("hydPSI" AS TEXT),
    'OK',
    "createdAt",
    "updatedAt"
FROM "service_data_lubrication_hydraulics"
WHERE "hydPSI" IS NOT NULL;

INSERT INTO "lubrication_hydraulics_gauges" ("id", "lubricationHydraulicsDataId", "system", "gauge", "psi", "createdAt", "updatedAt")
SELECT
    gen_random_uuid(),
    id,
    'MONITORFLOW',
    CAST("monitorflowPSI" AS TEXT),
    'OK',
    "createdAt",
    "updatedAt"
FROM "service_data_lubrication_hydraulics"
WHERE "monitorflowPSI" IS NOT NULL;

INSERT INTO "lubrication_hydraulics_gauges" ("id", "lubricationHydraulicsDataId", "system", "gauge", "psi", "createdAt", "updatedAt")
SELECT
    gen_random_uuid(),
    id,
    'PRESS_SW',
    CAST("pressSWPSI" AS TEXT),
    'OK',
    "createdAt",
    "updatedAt"
FROM "service_data_lubrication_hydraulics"
WHERE "pressSWPSI" IS NOT NULL;

-- Add notes column to service_data_lubrication_hydraulics
ALTER TABLE "service_data_lubrication_hydraulics" ADD COLUMN "notes" TEXT;

-- Migrate otherGauges to notes
UPDATE "service_data_lubrication_hydraulics"
SET "notes" = "otherGauges"
WHERE "otherGauges" IS NOT NULL AND "otherGauges" != '';

-- AlterTable - Change changedOil and changedFilter to YesNoDncType enum
-- First, update existing boolean values to enum values
ALTER TABLE "service_data_lubrication_hydraulics"
    ALTER COLUMN "changedOil" DROP DEFAULT,
    ALTER COLUMN "changedOil" TYPE TEXT;

UPDATE "service_data_lubrication_hydraulics"
SET "changedOil" = CASE
    WHEN "changedOil" = 'true' THEN 'YES'
    WHEN "changedOil" = 'false' THEN 'NO'
    ELSE 'DNC'
END;

ALTER TABLE "service_data_lubrication_hydraulics"
    ALTER COLUMN "changedFilter" DROP DEFAULT,
    ALTER COLUMN "changedFilter" TYPE TEXT;

UPDATE "service_data_lubrication_hydraulics"
SET "changedFilter" = CASE
    WHEN "changedFilter" = 'true' THEN 'YES'
    WHEN "changedFilter" = 'false' THEN 'NO'
    ELSE 'DNC'
END;

-- Convert columns to enum type
ALTER TABLE "service_data_lubrication_hydraulics"
    ALTER COLUMN "changedOil" TYPE "YesNoDncType" USING "changedOil"::"YesNoDncType",
    ALTER COLUMN "changedOil" SET DEFAULT 'DNC';

ALTER TABLE "service_data_lubrication_hydraulics"
    ALTER COLUMN "changedFilter" TYPE "YesNoDncType" USING "changedFilter"::"YesNoDncType",
    ALTER COLUMN "changedFilter" SET DEFAULT 'DNC';

-- AlterTable - Change oilTemperatureF from Decimal to Int
ALTER TABLE "service_data_lubrication_hydraulics"
    ALTER COLUMN "oilTemperatureF" TYPE INTEGER USING ROUND("oilTemperatureF"::numeric);

-- DropColumn - Remove old PSI columns
ALTER TABLE "service_data_lubrication_hydraulics" DROP COLUMN "lubePSI";
ALTER TABLE "service_data_lubrication_hydraulics" DROP COLUMN "monitorflowPSI";
ALTER TABLE "service_data_lubrication_hydraulics" DROP COLUMN "hydPSI";
ALTER TABLE "service_data_lubrication_hydraulics" DROP COLUMN "pressSWPSI";
ALTER TABLE "service_data_lubrication_hydraulics" DROP COLUMN "otherGauges";

-- AddForeignKey
ALTER TABLE "lubrication_hydraulics_gauges" ADD CONSTRAINT "lubrication_hydraulics_gauges_lubricationHydraulicsDataId_fkey" FOREIGN KEY ("lubricationHydraulicsDataId") REFERENCES "service_data_lubrication_hydraulics"("id") ON DELETE CASCADE ON UPDATE CASCADE;
