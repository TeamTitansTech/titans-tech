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

-- AlterTable service_data_clutch
-- Drop old columns that will be replaced
ALTER TABLE "service_data_clutch" DROP COLUMN IF EXISTS "clutchType";
ALTER TABLE "service_data_clutch" DROP COLUMN IF EXISTS "clutchLocation";
ALTER TABLE "service_data_clutch" DROP COLUMN IF EXISTS "brakeAnchorClearanceFB";
ALTER TABLE "service_data_clutch" DROP COLUMN IF EXISTS "brakeAnchorClearanceFTB";
ALTER TABLE "service_data_clutch" DROP COLUMN IF EXISTS "brakeAnchorClearanceRTB";
ALTER TABLE "service_data_clutch" DROP COLUMN IF EXISTS "airRegulatorPSI";
ALTER TABLE "service_data_clutch" DROP COLUMN IF EXISTS "hydraulicPressurePSI";
ALTER TABLE "service_data_clutch" DROP COLUMN IF EXISTS "accumulatorPSI";

-- Add new columns with enum types
ALTER TABLE "service_data_clutch" ADD COLUMN "clutchType" "ClutchType";
ALTER TABLE "service_data_clutch" ADD COLUMN "clutchLocation" "ClutchLocation";

-- Add brake spring settings columns
ALTER TABLE "service_data_clutch" ADD COLUMN "brakeSpringFB" DECIMAL(10,4);
ALTER TABLE "service_data_clutch" ADD COLUMN "brakeSpringFTB" DECIMAL(10,4);
ALTER TABLE "service_data_clutch" ADD COLUMN "brakeSpringRTB" DECIMAL(10,4);

-- Update brakeSpringStudBolt to use enum
ALTER TABLE "service_data_clutch" DROP COLUMN IF EXISTS "brakeSpringStudBolt";
ALTER TABLE "service_data_clutch" ADD COLUMN "brakeSpringStudBolt" "BrakeSpringStudBoltType";

-- Update brakeLining to use enum
ALTER TABLE "service_data_clutch" DROP COLUMN IF EXISTS "brakeLining";
ALTER TABLE "service_data_clutch" ADD COLUMN "brakeLining" "BrakeLiningType";

-- Update flywheel columns to use enums
ALTER TABLE "service_data_clutch" DROP COLUMN IF EXISTS "flywheelBearings";
ALTER TABLE "service_data_clutch" ADD COLUMN "flywheelBearings" "FlywheelBearingsType";

ALTER TABLE "service_data_clutch" DROP COLUMN IF EXISTS "flywheelBrake";
ALTER TABLE "service_data_clutch" ADD COLUMN "flywheelBrake" "FlywheelBrakeType";

-- Update rotaryUnion to use enum
ALTER TABLE "service_data_clutch" DROP COLUMN IF EXISTS "rotaryUnion";
ALTER TABLE "service_data_clutch" ADD COLUMN "rotaryUnion" "RotaryUnionType";

-- Update clutch detail columns to use enums
ALTER TABLE "service_data_clutch" DROP COLUMN IF EXISTS "clutchLining";
ALTER TABLE "service_data_clutch" ADD COLUMN "clutchLining" "ClutchLiningType";

ALTER TABLE "service_data_clutch" DROP COLUMN IF EXISTS "clutchSeals";
ALTER TABLE "service_data_clutch" ADD COLUMN "clutchSeals" "ClutchSealsType";

-- Add air system columns with units
ALTER TABLE "service_data_clutch" ADD COLUMN "airRegulatorValue" DECIMAL(10,2);
ALTER TABLE "service_data_clutch" ADD COLUMN "airRegulatorUnit" "PressureUnit";

-- Update air line oiler setting to use enum
ALTER TABLE "service_data_clutch" DROP COLUMN IF EXISTS "airLineOilerSetting";
ALTER TABLE "service_data_clutch" ADD COLUMN "airLineOilerSetting" "AirLineOilerSettingType";

-- Update splines to use enum
ALTER TABLE "service_data_clutch" DROP COLUMN IF EXISTS "splinesDriveRingDisc";
ALTER TABLE "service_data_clutch" ADD COLUMN "splinesDriveRingDisc" "SplinesConditionType";

-- Update adjusting nut/lock to use enum
ALTER TABLE "service_data_clutch" DROP COLUMN IF EXISTS "adjustingNutLockSecure";
ALTER TABLE "service_data_clutch" ADD COLUMN "adjustingNutLockSecure" "AdjustingNutLockType";

-- Add hydraulic system columns with units
ALTER TABLE "service_data_clutch" ADD COLUMN "hydraulicPressureValue" DECIMAL(10,2);
ALTER TABLE "service_data_clutch" ADD COLUMN "hydraulicPressureUnit" "PressureUnit";
ALTER TABLE "service_data_clutch" ADD COLUMN "accumulatorValue" DECIMAL(10,2);
ALTER TABLE "service_data_clutch" ADD COLUMN "accumulatorUnit" "PressureUnit";

-- Update separate brake seals to use enum
ALTER TABLE "service_data_clutch" DROP COLUMN IF EXISTS "separateBrakeSeals";
ALTER TABLE "service_data_clutch" ADD COLUMN "separateBrakeSeals" "SeparateBrakeSealsType";

-- Update flex disc to use enum
ALTER TABLE "service_data_clutch" DROP COLUMN IF EXISTS "flexDisc";
ALTER TABLE "service_data_clutch" ADD COLUMN "flexDisc" "FlexDiscType";

-- Add notes column if not exists
ALTER TABLE "service_data_clutch" ADD COLUMN IF NOT EXISTS "notes" TEXT;
