/*
  Warnings:

  - You are about to drop the column `hasParallelismBeenAdjusted` on the `machine_service_slide` table. All the data in the column will be lost.
  - You are about to drop the column `parallelism` on the `machine_service_slide` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ParallelismType" AS ENUM ('DNC', 'TO_BED', 'TO_BOLSTER');

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
