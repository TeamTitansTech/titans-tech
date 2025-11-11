/*
  Warnings:

  - You are about to rename the column `innerAfterId` to `innerDataId` on the `machine_service_bearing_clearance` table.
  - You are about to rename the column `outerAfterId` to `outerDataId` on the `machine_service_bearing_clearance` table.
  - You are about to rename the column `innerAfterId` to `innerDataId` on the `machine_service_gibs` table.
  - You are about to rename the column `outerAfterId` to `outerDataId` on the `machine_service_gibs` table.
  - You are about to rename the column `innerAfterId` to `innerDataId` on the `machine_service_slide` table.
  - You are about to rename the column `outerAfterId` to `outerDataId` on the `machine_service_slide` table.

*/

-- Rename columns for machine_service_bearing_clearance
ALTER TABLE "machine_service_bearing_clearance" RENAME COLUMN "outerAfterId" TO "outerDataId";
ALTER TABLE "machine_service_bearing_clearance" RENAME COLUMN "innerAfterId" TO "innerDataId";

-- Rename columns for machine_service_slide
ALTER TABLE "machine_service_slide" RENAME COLUMN "outerAfterId" TO "outerDataId";
ALTER TABLE "machine_service_slide" RENAME COLUMN "innerAfterId" TO "innerDataId";

-- Rename columns for machine_service_gibs
ALTER TABLE "machine_service_gibs" RENAME COLUMN "outerAfterId" TO "outerDataId";
ALTER TABLE "machine_service_gibs" RENAME COLUMN "innerAfterId" TO "innerDataId";
