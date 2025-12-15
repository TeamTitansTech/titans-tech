-- CreateEnum
CREATE TYPE "DieCushionAirLeaksType" AS ENUM ('OK', 'NA', 'DNC', 'LEAKING');

-- CreateEnum
CREATE TYPE "DieCushionPneumaticsPlumbingType" AS ENUM ('OK', 'NA', 'DNC', 'NOT_OPERATIONAL', 'LEAKING');

-- CreateEnum
CREATE TYPE "DieCushionLubricationType" AS ENUM ('OK', 'NA', 'DNC', 'NOT_OPERATIONAL');

-- AlterEnum
BEGIN;
CREATE TYPE "MachineClutchType_new" AS ENUM ('AIR', 'HYD', 'WET_AIR', 'WET_HYD');
ALTER TABLE "machines" ALTER COLUMN "clutchType" TYPE "MachineClutchType_new" USING ("clutchType"::text::"MachineClutchType_new");
ALTER TYPE "MachineClutchType" RENAME TO "MachineClutchType_old";
ALTER TYPE "MachineClutchType_new" RENAME TO "MachineClutchType";
DROP TYPE "public"."MachineClutchType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "PneumaticSystemType_new" AS ENUM ('NA', 'COUNTERBALANCE', 'CBAL_W_DIE_CUSHION', 'DIE_CUSHION_ONLY');
ALTER TABLE "machines" ALTER COLUMN "pneumaticSystem" TYPE "PneumaticSystemType_new" USING ("pneumaticSystem"::text::"PneumaticSystemType_new");
ALTER TYPE "PneumaticSystemType" RENAME TO "PneumaticSystemType_old";
ALTER TYPE "PneumaticSystemType_new" RENAME TO "PneumaticSystemType";
DROP TYPE "public"."PneumaticSystemType_old";
COMMIT;

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ServiceSection" ADD VALUE 'SHIM_THICKNESS';
ALTER TYPE "ServiceSection" ADD VALUE 'DIE_CUSHION';

-- CreateTable
CREATE TABLE "machine_service_shim_thickness" (
    "id" TEXT NOT NULL,
    "machineServiceId" TEXT NOT NULL,
    "outerLhDataId" TEXT,
    "outerRhDataId" TEXT,
    "innerLhDataId" TEXT,
    "innerRhDataId" TEXT,
    "notes" TEXT,

    CONSTRAINT "machine_service_shim_thickness_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shim_thickness_data" (
    "id" TEXT NOT NULL,
    "top" DECIMAL(10,4),
    "bottom" DECIMAL(10,4),
    "left" DECIMAL(10,4),
    "right" DECIMAL(10,4),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shim_thickness_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "machine_service_die_cushion" (
    "id" TEXT NOT NULL,
    "machineServiceId" TEXT NOT NULL,
    "airLeaks" "DieCushionAirLeaksType",
    "airLeaksLocation" TEXT,
    "pneumaticsPlumbing" "DieCushionPneumaticsPlumbingType",
    "lubrication" "DieCushionLubricationType",
    "notes" TEXT,

    CONSTRAINT "machine_service_die_cushion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "machine_service_shim_thickness" ADD CONSTRAINT "machine_service_shim_thickness_machineServiceId_fkey" FOREIGN KEY ("machineServiceId") REFERENCES "machine_services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_service_shim_thickness" ADD CONSTRAINT "machine_service_shim_thickness_outerLhDataId_fkey" FOREIGN KEY ("outerLhDataId") REFERENCES "shim_thickness_data"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_service_shim_thickness" ADD CONSTRAINT "machine_service_shim_thickness_outerRhDataId_fkey" FOREIGN KEY ("outerRhDataId") REFERENCES "shim_thickness_data"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_service_shim_thickness" ADD CONSTRAINT "machine_service_shim_thickness_innerLhDataId_fkey" FOREIGN KEY ("innerLhDataId") REFERENCES "shim_thickness_data"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_service_shim_thickness" ADD CONSTRAINT "machine_service_shim_thickness_innerRhDataId_fkey" FOREIGN KEY ("innerRhDataId") REFERENCES "shim_thickness_data"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_service_die_cushion" ADD CONSTRAINT "machine_service_die_cushion_machineServiceId_fkey" FOREIGN KEY ("machineServiceId") REFERENCES "machine_services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
