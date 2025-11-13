/*
  Warnings:

  - The `counterbalanceType` column on the `service_data_counterbalance_cylinder_airbag` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `airbagPistonSeals` column on the `service_data_counterbalance_cylinder_airbag` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `regulator` column on the `service_data_counterbalance_cylinder_airbag` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `pneumaticsPlumbing` column on the `service_data_counterbalance_cylinder_airbag` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `rodSeals` column on the `service_data_counterbalance_cylinder_airbag` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `rodBushing` column on the `service_data_counterbalance_cylinder_airbag` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `oilWick` column on the `service_data_counterbalance_cylinder_airbag` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ComponentConditionType" AS ENUM ('OK', 'LEAKING', 'NOT_OPERATIONAL', 'NEEDS_REPLACED', 'NA', 'DNC');

-- CreateEnum
CREATE TYPE "CounterbalanceTypeEnum" AS ENUM ('CYLINDER', 'AIRBAG');

-- CreateEnum
CREATE TYPE "OilConditionType" AS ENUM ('OK', 'DARK_OIL', 'NEEDS_REPLACED', 'NA', 'DNC');

-- AlterTable
ALTER TABLE "service_data_counterbalance_cylinder_airbag" DROP COLUMN "counterbalanceType",
ADD COLUMN     "counterbalanceType" "CounterbalanceTypeEnum",
DROP COLUMN "airbagPistonSeals",
ADD COLUMN     "airbagPistonSeals" "ComponentConditionType",
DROP COLUMN "regulator",
ADD COLUMN     "regulator" "ComponentConditionType",
DROP COLUMN "pneumaticsPlumbing",
ADD COLUMN     "pneumaticsPlumbing" "ComponentConditionType",
DROP COLUMN "rodSeals",
ADD COLUMN     "rodSeals" "ComponentConditionType",
DROP COLUMN "rodBushing",
ADD COLUMN     "rodBushing" "ComponentConditionType",
DROP COLUMN "oilWick",
ADD COLUMN     "oilWick" "OilConditionType";
