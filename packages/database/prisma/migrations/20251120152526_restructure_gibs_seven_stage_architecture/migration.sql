/*
  Warnings:

  - You are about to drop the column `innerBeforeId` on the `machine_service_gibs` table. All the data in the column will be lost.
  - You are about to drop the column `innerDataId` on the `machine_service_gibs` table. All the data in the column will be lost.
  - You are about to drop the column `outerBeforeId` on the `machine_service_gibs` table. All the data in the column will be lost.
  - You are about to drop the column `outerDataId` on the `machine_service_gibs` table. All the data in the column will be lost.
  - You are about to drop the column `hasParallelismBeenAdjusted` on the `machine_service_slide` table. All the data in the column will be lost.
  - You are about to drop the column `parallelism` on the `machine_service_slide` table. All the data in the column will be lost.
  - You are about to drop the column `accumulatorPSI` on the `service_data_clutch` table. All the data in the column will be lost.
  - You are about to drop the column `airRegulatorPSI` on the `service_data_clutch` table. All the data in the column will be lost.
  - You are about to drop the column `brakeAnchorClearanceFB` on the `service_data_clutch` table. All the data in the column will be lost.
  - You are about to drop the column `brakeAnchorClearanceFTB` on the `service_data_clutch` table. All the data in the column will be lost.
  - You are about to drop the column `brakeAnchorClearanceRTB` on the `service_data_clutch` table. All the data in the column will be lost.
  - You are about to drop the column `hydraulicPressurePSI` on the `service_data_clutch` table. All the data in the column will be lost.
  - The `clutchType` column on the `service_data_clutch` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `clutchLocation` column on the `service_data_clutch` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `brakeSpringStudBolt` column on the `service_data_clutch` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `brakeLining` column on the `service_data_clutch` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `flywheelBearings` column on the `service_data_clutch` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `flywheelBrake` column on the `service_data_clutch` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `clutchLining` column on the `service_data_clutch` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `clutchSeals` column on the `service_data_clutch` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `airLineOilerSetting` column on the `service_data_clutch` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `rotaryUnion` column on the `service_data_clutch` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `splinesDriveRingDisc` column on the `service_data_clutch` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `adjustingNutLockSecure` column on the `service_data_clutch` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `separateBrakeSeals` column on the `service_data_clutch` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `flexDisc` column on the `service_data_clutch` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `service_data_gibs` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ParallelismType" AS ENUM ('DNC', 'TO_BED', 'TO_BOLSTER');

-- CreateEnum
CREATE TYPE "ClutchType" AS ENUM ('AFC', 'CFC', 'EFHC', 'GC', 'HC', 'MC', 'MDHC', 'MHC', 'MHCC');

-- CreateEnum
CREATE TYPE "ClutchLocation" AS ENUM ('CRANKSHAFT', 'DRIVESHAFT');

-- CreateEnum
CREATE TYPE "BrakeSpringStudBoltType" AS ENUM ('OK', 'NA', 'DNC', 'BROKEN', 'BENT_WORN');

-- CreateEnum
CREATE TYPE "BrakeLiningType" AS ENUM ('OK', 'NA', 'DNC', 'GLAZED', 'OIL_SOAKED', 'MISSING_SEGMENTS');

-- CreateEnum
CREATE TYPE "FlywheelBearingsType" AS ENUM ('OK', 'NA', 'DNC', 'NOISE', 'WOBBLE');

-- CreateEnum
CREATE TYPE "FlywheelBrakeType" AS ENUM ('OK', 'NA', 'DNC', 'LINING_WORN');

-- CreateEnum
CREATE TYPE "RotaryUnionType" AS ENUM ('OK', 'NA', 'DNC', 'AIR_LEAK', 'OIL_LEAK', 'CONCENTRICITY');

-- CreateEnum
CREATE TYPE "ClutchLiningType" AS ENUM ('OK', 'NA', 'DNC', 'GLAZED', 'OIL_SOAKED', 'MISSING_SEGMENTS');

-- CreateEnum
CREATE TYPE "ClutchSealsType" AS ENUM ('OK', 'NA', 'DNC', 'LEAKING', 'SLOW_RESPONSE');

-- CreateEnum
CREATE TYPE "PressureUnit" AS ENUM ('BAR', 'MPA', 'PSI');

-- CreateEnum
CREATE TYPE "SplinesConditionType" AS ENUM ('OK', 'NA', 'DNC', 'BROKEN', 'NOT_VISIBLE', 'WEAR_VISIBLE');

-- CreateEnum
CREATE TYPE "AdjustingNutLockType" AS ENUM ('OK', 'NA', 'DNC');

-- CreateEnum
CREATE TYPE "AirLineOilerSettingType" AS ENUM ('OK', 'NA', 'DNC', 'NEEDS_OIL', 'NEEDS_OIL_RESET', 'NEEDS_RESET');

-- CreateEnum
CREATE TYPE "SeparateBrakeSealsType" AS ENUM ('OK', 'NA', 'DNC', 'LEAKING');

-- CreateEnum
CREATE TYPE "FlexDiscType" AS ENUM ('OK', 'NA', 'DNC', 'BUCKLED', 'CRACKED');

-- DropForeignKey
ALTER TABLE "machine_service_gibs" DROP CONSTRAINT "machine_service_gibs_innerBeforeId_fkey";

-- DropForeignKey
ALTER TABLE "machine_service_gibs" DROP CONSTRAINT "machine_service_gibs_innerDataId_fkey";

-- DropForeignKey
ALTER TABLE "machine_service_gibs" DROP CONSTRAINT "machine_service_gibs_outerBeforeId_fkey";

-- DropForeignKey
ALTER TABLE "machine_service_gibs" DROP CONSTRAINT "machine_service_gibs_outerDataId_fkey";

-- AlterTable
ALTER TABLE "machine_service_gibs" DROP COLUMN "innerBeforeId",
DROP COLUMN "innerDataId",
DROP COLUMN "outerBeforeId",
DROP COLUMN "outerDataId",
ADD COLUMN     "innerAfterAdjustmentId" TEXT,
ADD COLUMN     "innerAfterToolInstallationId" TEXT,
ADD COLUMN     "innerBeforeAdjustmentId" TEXT,
ADD COLUMN     "innerBeforeToolInstallationId" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "outerAfterAdjustmentId" TEXT,
ADD COLUMN     "outerBeforeAdjustmentId" TEXT,
ADD COLUMN     "outerFreeHangingAfterInstallId" TEXT;

-- AlterTable
ALTER TABLE "machine_service_slide" DROP COLUMN "hasParallelismBeenAdjusted",
DROP COLUMN "parallelism",
ADD COLUMN     "innerHasParallelismBeenAdjusted" "YesNoNaDncType",
ADD COLUMN     "innerParallelism" "ParallelismType",
ADD COLUMN     "outerHasParallelismBeenAdjusted" "YesNoNaDncType",
ADD COLUMN     "outerParallelism" "ParallelismType";

-- AlterTable
ALTER TABLE "machine_services" ADD COLUMN     "completedSections" JSONB DEFAULT '[]',
ADD COLUMN     "currentSectionKey" TEXT,
ADD COLUMN     "currentStep" TEXT,
ADD COLUMN     "lastSectionSavedAt" TIMESTAMP(3),
ADD COLUMN     "selectedSections" JSONB DEFAULT '[]';

-- AlterTable
ALTER TABLE "service_data_clutch" DROP COLUMN "accumulatorPSI",
DROP COLUMN "airRegulatorPSI",
DROP COLUMN "brakeAnchorClearanceFB",
DROP COLUMN "brakeAnchorClearanceFTB",
DROP COLUMN "brakeAnchorClearanceRTB",
DROP COLUMN "hydraulicPressurePSI",
ADD COLUMN     "accumulatorUnit" "PressureUnit",
ADD COLUMN     "accumulatorValue" DECIMAL(10,2),
ADD COLUMN     "airRegulatorUnit" "PressureUnit",
ADD COLUMN     "airRegulatorValue" DECIMAL(10,2),
ADD COLUMN     "brakeSpringFB" DECIMAL(10,4),
ADD COLUMN     "brakeSpringFTB" DECIMAL(10,4),
ADD COLUMN     "brakeSpringRTB" DECIMAL(10,4),
ADD COLUMN     "hydraulicPressureUnit" "PressureUnit",
ADD COLUMN     "hydraulicPressureValue" DECIMAL(10,2),
ADD COLUMN     "notes" TEXT,
DROP COLUMN "clutchType",
ADD COLUMN     "clutchType" "ClutchType",
DROP COLUMN "clutchLocation",
ADD COLUMN     "clutchLocation" "ClutchLocation",
DROP COLUMN "brakeSpringStudBolt",
ADD COLUMN     "brakeSpringStudBolt" "BrakeSpringStudBoltType",
DROP COLUMN "brakeLining",
ADD COLUMN     "brakeLining" "BrakeLiningType",
DROP COLUMN "flywheelBearings",
ADD COLUMN     "flywheelBearings" "FlywheelBearingsType",
DROP COLUMN "flywheelBrake",
ADD COLUMN     "flywheelBrake" "FlywheelBrakeType",
DROP COLUMN "clutchLining",
ADD COLUMN     "clutchLining" "ClutchLiningType",
DROP COLUMN "clutchSeals",
ADD COLUMN     "clutchSeals" "ClutchSealsType",
DROP COLUMN "airLineOilerSetting",
ADD COLUMN     "airLineOilerSetting" "AirLineOilerSettingType",
DROP COLUMN "rotaryUnion",
ADD COLUMN     "rotaryUnion" "RotaryUnionType",
DROP COLUMN "splinesDriveRingDisc",
ADD COLUMN     "splinesDriveRingDisc" "SplinesConditionType",
DROP COLUMN "adjustingNutLockSecure",
ADD COLUMN     "adjustingNutLockSecure" "AdjustingNutLockType",
DROP COLUMN "separateBrakeSeals",
ADD COLUMN     "separateBrakeSeals" "SeparateBrakeSealsType",
DROP COLUMN "flexDisc",
ADD COLUMN     "flexDisc" "FlexDiscType";

-- DropTable
DROP TABLE "service_data_gibs";

-- CreateTable
CREATE TABLE "service_data_gibs_stage" (
    "id" TEXT NOT NULL,
    "point1" DECIMAL(10,4) NOT NULL,
    "point2" DECIMAL(10,4) NOT NULL,
    "point3" DECIMAL(10,4) NOT NULL,
    "point4" DECIMAL(10,4) NOT NULL,
    "point5" DECIMAL(10,4) NOT NULL,
    "point6" DECIMAL(10,4) NOT NULL,
    "point7" DECIMAL(10,4) NOT NULL,
    "point8" DECIMAL(10,4) NOT NULL,
    "point9" DECIMAL(10,4) NOT NULL,
    "point10" DECIMAL(10,4) NOT NULL,
    "point11" DECIMAL(10,4) NOT NULL,
    "point12" DECIMAL(10,4) NOT NULL,
    "point13" DECIMAL(10,4) NOT NULL,
    "point14" DECIMAL(10,4) NOT NULL,
    "point15" DECIMAL(10,4) NOT NULL,
    "point16" DECIMAL(10,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_data_gibs_stage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "machine_service_gibs" ADD CONSTRAINT "machine_service_gibs_outerBeforeAdjustmentId_fkey" FOREIGN KEY ("outerBeforeAdjustmentId") REFERENCES "service_data_gibs_stage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_service_gibs" ADD CONSTRAINT "machine_service_gibs_outerAfterAdjustmentId_fkey" FOREIGN KEY ("outerAfterAdjustmentId") REFERENCES "service_data_gibs_stage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_service_gibs" ADD CONSTRAINT "machine_service_gibs_outerFreeHangingAfterInstallId_fkey" FOREIGN KEY ("outerFreeHangingAfterInstallId") REFERENCES "service_data_gibs_stage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_service_gibs" ADD CONSTRAINT "machine_service_gibs_innerBeforeAdjustmentId_fkey" FOREIGN KEY ("innerBeforeAdjustmentId") REFERENCES "service_data_gibs_stage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_service_gibs" ADD CONSTRAINT "machine_service_gibs_innerAfterAdjustmentId_fkey" FOREIGN KEY ("innerAfterAdjustmentId") REFERENCES "service_data_gibs_stage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_service_gibs" ADD CONSTRAINT "machine_service_gibs_innerBeforeToolInstallationId_fkey" FOREIGN KEY ("innerBeforeToolInstallationId") REFERENCES "service_data_gibs_stage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_service_gibs" ADD CONSTRAINT "machine_service_gibs_innerAfterToolInstallationId_fkey" FOREIGN KEY ("innerAfterToolInstallationId") REFERENCES "service_data_gibs_stage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
