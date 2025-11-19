/*
  Warnings:

  - You are about to drop the column `innerBeforeId` on the `machine_service_gibs` table. All the data in the column will be lost.
  - You are about to drop the column `innerDataId` on the `machine_service_gibs` table. All the data in the column will be lost.
  - You are about to drop the column `outerBeforeId` on the `machine_service_gibs` table. All the data in the column will be lost.
  - You are about to drop the column `outerDataId` on the `machine_service_gibs` table. All the data in the column will be lost.
  - You are about to drop the `service_data_gibs` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "GibsStageType" AS ENUM ('OUTER_BEFORE_ADJUSTMENT', 'OUTER_AFTER_ADJUSTMENT', 'OUTER_AFTER_INSTALLATION', 'INNER_BEFORE_ADJUSTMENT', 'INNER_AFTER_ADJUSTMENT', 'INNER_BEFORE_INSTALLATION', 'INNER_AFTER_INSTALLATION');

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
DROP COLUMN "outerDataId";

-- DropTable
DROP TABLE "service_data_gibs";

-- CreateTable
CREATE TABLE "service_data_gibs_stage" (
    "id" TEXT NOT NULL,
    "machineServiceGibsId" TEXT NOT NULL,
    "stageType" "GibsStageType" NOT NULL,
    "position1" DECIMAL(10,4),
    "position2" DECIMAL(10,4),
    "position3" DECIMAL(10,4),
    "position4" DECIMAL(10,4),
    "position5" DECIMAL(10,4),
    "position6" DECIMAL(10,4),
    "position7" DECIMAL(10,4),
    "position8" DECIMAL(10,4),
    "position9" DECIMAL(10,4),
    "position10" DECIMAL(10,4),
    "position11" DECIMAL(10,4),
    "position12" DECIMAL(10,4),
    "position13" DECIMAL(10,4),
    "position14" DECIMAL(10,4),
    "position15" DECIMAL(10,4),
    "position16" DECIMAL(10,4),
    "topFront" DECIMAL(10,4),
    "topBack" DECIMAL(10,4),
    "calculatedTopFront" DECIMAL(10,4),
    "calculatedTopBack" DECIMAL(10,4),
    "calculatedTopRear" DECIMAL(10,4),
    "calculatedBottomFront" DECIMAL(10,4),
    "calculatedBottomBack" DECIMAL(10,4),
    "calculatedLeft" DECIMAL(10,4),
    "calculatedRight" DECIMAL(10,4),
    "calculatedLeftTop" DECIMAL(10,4),
    "calculatedLeftBottom" DECIMAL(10,4),
    "calculatedRightTop" DECIMAL(10,4),
    "calculatedRightBottom" DECIMAL(10,4),
    "calculatedFrontTop" DECIMAL(10,4),
    "calculatedFrontBottom" DECIMAL(10,4),
    "calculatedBackTop" DECIMAL(10,4),
    "calculatedBackBottom" DECIMAL(10,4),
    "differentialTopFront" DECIMAL(10,4),
    "differentialTopBack" DECIMAL(10,4),
    "differentialTopRear" DECIMAL(10,4),
    "differentialBottom" DECIMAL(10,4),
    "differentialLeft" DECIMAL(10,4),
    "differentialRight" DECIMAL(10,4),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_data_gibs_stage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "service_data_gibs_stage" ADD CONSTRAINT "service_data_gibs_stage_machineServiceGibsId_fkey" FOREIGN KEY ("machineServiceGibsId") REFERENCES "machine_service_gibs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
