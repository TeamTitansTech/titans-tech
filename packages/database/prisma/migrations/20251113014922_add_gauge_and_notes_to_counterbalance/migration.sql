/*
  Warnings:

  - You are about to drop the column `gaugePSI` on the `service_data_counterbalance_cylinder_airbag` table. All the data in the column will be lost.
  - The `airbagPistonSeals` column on the `service_data_counterbalance_cylinder_airbag` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `regulator` column on the `service_data_counterbalance_cylinder_airbag` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `pneumaticsPlumbing` column on the `service_data_counterbalance_cylinder_airbag` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `rodSeals` column on the `service_data_counterbalance_cylinder_airbag` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `rodBushing` column on the `service_data_counterbalance_cylinder_airbag` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `oilWick` column on the `service_data_counterbalance_cylinder_airbag` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "AirbagPistonSealsType" AS ENUM ('OK', 'NA', 'DNC', 'LEAKING');

-- CreateEnum
CREATE TYPE "RegulatorGaugeType" AS ENUM ('OK', 'NA', 'DNC', 'NOT_OPERATIONAL');

-- CreateEnum
CREATE TYPE "PneumaticsPlumbingType" AS ENUM ('OK', 'NA', 'DNC', 'NOT_OPERATIONAL', 'LEAKING');

-- CreateEnum
CREATE TYPE "RodSealsType" AS ENUM ('OK', 'NA', 'DNC', 'LEAKING');

-- CreateEnum
CREATE TYPE "RodBushingType" AS ENUM ('OK', 'NA', 'DNC', 'DARK_OIL');

-- CreateEnum
CREATE TYPE "OilWickType" AS ENUM ('OK', 'NA', 'DNC', 'NEEDS_REPLACED');

-- AlterTable
ALTER TABLE "service_data_counterbalance_cylinder_airbag" DROP COLUMN "gaugePSI",
ADD COLUMN     "gauge" "RegulatorGaugeType",
ADD COLUMN     "notes" TEXT,
DROP COLUMN "airbagPistonSeals",
ADD COLUMN     "airbagPistonSeals" "AirbagPistonSealsType",
DROP COLUMN "regulator",
ADD COLUMN     "regulator" "RegulatorGaugeType",
DROP COLUMN "pneumaticsPlumbing",
ADD COLUMN     "pneumaticsPlumbing" "PneumaticsPlumbingType",
DROP COLUMN "rodSeals",
ADD COLUMN     "rodSeals" "RodSealsType",
DROP COLUMN "rodBushing",
ADD COLUMN     "rodBushing" "RodBushingType",
DROP COLUMN "oilWick",
ADD COLUMN     "oilWick" "OilWickType";

-- DropEnum
DROP TYPE "ComponentConditionType";

-- DropEnum
DROP TYPE "OilConditionType";
