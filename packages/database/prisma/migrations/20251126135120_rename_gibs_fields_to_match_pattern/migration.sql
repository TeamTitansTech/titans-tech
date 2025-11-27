-- Rename GIBS fields to match the pattern used in other sections (outerBefore/outerData instead of outerBeforeAdjustment/outerAfterAdjustment)

-- Rename columns in machine_service_gibs table
ALTER TABLE "machine_service_gibs" RENAME COLUMN "outerBeforeAdjustmentId" TO "outerBeforeId";
ALTER TABLE "machine_service_gibs" RENAME COLUMN "outerAfterAdjustmentId" TO "outerDataId";
ALTER TABLE "machine_service_gibs" RENAME COLUMN "outerFreeHangingAfterInstallId" TO "outerFreeHangingDataId";
ALTER TABLE "machine_service_gibs" RENAME COLUMN "innerBeforeAdjustmentId" TO "innerBeforeId";
ALTER TABLE "machine_service_gibs" RENAME COLUMN "innerAfterAdjustmentId" TO "innerDataId";
ALTER TABLE "machine_service_gibs" RENAME COLUMN "innerBeforeToolInstallationId" TO "innerBeforeToolId";
ALTER TABLE "machine_service_gibs" RENAME COLUMN "innerAfterToolInstallationId" TO "innerDataToolId";
