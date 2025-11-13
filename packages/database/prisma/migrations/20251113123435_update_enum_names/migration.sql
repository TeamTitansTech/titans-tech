/*
  Warnings:

  - The `psi` column on the `lubrication_hydraulics_gauges` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `parallelism` column on the `machine_service_slide` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `counterbalanceType` column on the `service_data_counterbalance_cylinder_airbag` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `gauge` column on the `service_data_counterbalance_cylinder_airbag` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `airbagPistonSeals` column on the `service_data_counterbalance_cylinder_airbag` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `regulator` column on the `service_data_counterbalance_cylinder_airbag` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `pneumaticsPlumbing` column on the `service_data_counterbalance_cylinder_airbag` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `rodSeals` column on the `service_data_counterbalance_cylinder_airbag` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `rodBushing` column on the `service_data_counterbalance_cylinder_airbag` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `oilWick` column on the `service_data_counterbalance_cylinder_airbag` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `system` on the `lubrication_hydraulics_gauges` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "DncToBedToBolsterType" AS ENUM ('DNC', 'TO_BED', 'TO_BOLSTER');

-- CreateEnum
CREATE TYPE "LubeHydMonitorFlowPressSwGibType" AS ENUM ('LUBE', 'HYD', 'MONITORFLOW', 'PRESS_SW', 'GIB');

-- CreateEnum
CREATE TYPE "OkNaDncDamageType" AS ENUM ('OK', 'NA', 'DNC', 'DAMAGED');

-- CreateEnum
CREATE TYPE "CylinderAirbagType" AS ENUM ('CYLINDER', 'AIRBAG');

-- CreateEnum
CREATE TYPE "OkNaDncLeakingType" AS ENUM ('OK', 'NA', 'DNC', 'LEAKING');

-- CreateEnum
CREATE TYPE "OkNaDncNotOperationalType" AS ENUM ('OK', 'NA', 'DNC', 'NOT_OPERATIONAL');

-- CreateEnum
CREATE TYPE "OkNaDncNotOperationalLeakingType" AS ENUM ('OK', 'NA', 'DNC', 'NOT_OPERATIONAL', 'LEAKING');

-- CreateEnum
CREATE TYPE "OkNaDncDarkOilType" AS ENUM ('OK', 'NA', 'DNC', 'DARK_OIL');

-- CreateEnum
CREATE TYPE "OkNaDncNeedReplacedType" AS ENUM ('OK', 'NA', 'DNC', 'NEEDS_REPLACED');

-- AlterTable
ALTER TABLE "lubrication_hydraulics_gauges" DROP COLUMN "system",
ADD COLUMN     "system" "LubeHydMonitorFlowPressSwGibType" NOT NULL,
DROP COLUMN "psi",
ADD COLUMN     "psi" "OkNaDncDamageType";

-- AlterTable
ALTER TABLE "machine_service_slide" DROP COLUMN "parallelism",
ADD COLUMN     "parallelism" "DncToBedToBolsterType";

-- AlterTable
ALTER TABLE "service_data_counterbalance_cylinder_airbag" DROP COLUMN "counterbalanceType",
ADD COLUMN     "counterbalanceType" "CylinderAirbagType",
DROP COLUMN "gauge",
ADD COLUMN     "gauge" "OkNaDncNotOperationalType",
DROP COLUMN "airbagPistonSeals",
ADD COLUMN     "airbagPistonSeals" "OkNaDncLeakingType",
DROP COLUMN "regulator",
ADD COLUMN     "regulator" "OkNaDncNotOperationalType",
DROP COLUMN "pneumaticsPlumbing",
ADD COLUMN     "pneumaticsPlumbing" "OkNaDncNotOperationalLeakingType",
DROP COLUMN "rodSeals",
ADD COLUMN     "rodSeals" "OkNaDncLeakingType",
DROP COLUMN "rodBushing",
ADD COLUMN     "rodBushing" "OkNaDncDarkOilType",
DROP COLUMN "oilWick",
ADD COLUMN     "oilWick" "OkNaDncNeedReplacedType";

-- DropEnum
DROP TYPE "AirbagPistonSealsType";

-- DropEnum
DROP TYPE "CounterbalanceTypeEnum";

-- DropEnum
DROP TYPE "OilWickType";

-- DropEnum
DROP TYPE "ParallelismType";

-- DropEnum
DROP TYPE "PneumaticsPlumbingType";

-- DropEnum
DROP TYPE "PsiStatusType";

-- DropEnum
DROP TYPE "RegulatorGaugeType";

-- DropEnum
DROP TYPE "RodBushingType";

-- DropEnum
DROP TYPE "RodSealsType";

-- DropEnum
DROP TYPE "SystemType";
