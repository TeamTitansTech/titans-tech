/*
  Warnings:

  - You are about to drop the column `actualSH` on the `service_data_slide` table. All the data in the column will be lost.
  - You are about to drop the column `hasBeenAdjusted` on the `service_data_slide` table. All the data in the column will be lost.
  - You are about to drop the column `indicatorReading` on the `service_data_slide` table. All the data in the column will be lost.
  - You are about to drop the column `overloadsOnMonitor` on the `service_data_slide` table. All the data in the column will be lost.
  - You are about to drop the column `parallelism` on the `service_data_slide` table. All the data in the column will be lost.
  - You are about to drop the column `shutheightChecked` on the `service_data_slide` table. All the data in the column will be lost.
  - Added the required column `position5` to the `service_data_slide` table without a default value. This is not possible if the table is not empty.
  - Added the required column `position6` to the `service_data_slide` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "YesNoNaDncType" AS ENUM ('YES', 'NO', 'NA', 'DNC');

-- CreateEnum
CREATE TYPE "YesNoDncType" AS ENUM ('YES', 'NO', 'DNC');

-- AlterTable
ALTER TABLE "machine_service_slide" ADD COLUMN     "hasParallelismBeenAdjusted" "YesNoNaDncType",
ADD COLUMN     "innerIndicatorReading" TEXT,
ADD COLUMN     "innerOverloadsOnTonnageMonitor" TEXT,
ADD COLUMN     "innerShutheightActualSh" TEXT,
ADD COLUMN     "innerShutheightIndicatorsChecked" "YesNoDncType",
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "outerIndicatorReading" TEXT,
ADD COLUMN     "outerOverloadsOnTonnageMonitor" TEXT,
ADD COLUMN     "outerShutheightActualSh" TEXT,
ADD COLUMN     "outerShutheightIndicatorsChecked" "YesNoDncType",
ADD COLUMN     "parallelism" "ParallelismType";

-- AlterTable
ALTER TABLE "service_data_slide" DROP COLUMN "actualSH",
DROP COLUMN "hasBeenAdjusted",
DROP COLUMN "indicatorReading",
DROP COLUMN "overloadsOnMonitor",
DROP COLUMN "parallelism",
DROP COLUMN "shutheightChecked",
ADD COLUMN     "position5" DECIMAL(10,4) NOT NULL,
ADD COLUMN     "position6" DECIMAL(10,4) NOT NULL;

-- RenameForeignKey
ALTER TABLE "machine_service_bearing_clearance" RENAME CONSTRAINT "machine_service_bearing_clearance_innerAfterId_fkey" TO "machine_service_bearing_clearance_innerDataId_fkey";

-- RenameForeignKey
ALTER TABLE "machine_service_bearing_clearance" RENAME CONSTRAINT "machine_service_bearing_clearance_outerAfterId_fkey" TO "machine_service_bearing_clearance_outerDataId_fkey";

-- RenameForeignKey
ALTER TABLE "machine_service_gibs" RENAME CONSTRAINT "machine_service_gibs_innerAfterId_fkey" TO "machine_service_gibs_innerDataId_fkey";

-- RenameForeignKey
ALTER TABLE "machine_service_gibs" RENAME CONSTRAINT "machine_service_gibs_outerAfterId_fkey" TO "machine_service_gibs_outerDataId_fkey";

-- RenameForeignKey
ALTER TABLE "machine_service_slide" RENAME CONSTRAINT "machine_service_slide_innerAfterId_fkey" TO "machine_service_slide_innerDataId_fkey";

-- RenameForeignKey
ALTER TABLE "machine_service_slide" RENAME CONSTRAINT "machine_service_slide_outerAfterId_fkey" TO "machine_service_slide_outerDataId_fkey";
