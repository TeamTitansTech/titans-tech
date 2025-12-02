-- AlterTable
ALTER TABLE "companies" ADD COLUMN     "accentColor" TEXT,
ADD COLUMN     "loginLogo" TEXT;

-- AlterTable
ALTER TABLE "machines" ADD COLUMN     "imageUrl" TEXT;

-- RenameForeignKey
ALTER TABLE "machine_service_gibs" RENAME CONSTRAINT "machine_service_gibs_innerAfterAdjustmentId_fkey" TO "machine_service_gibs_innerDataId_fkey";

-- RenameForeignKey
ALTER TABLE "machine_service_gibs" RENAME CONSTRAINT "machine_service_gibs_innerAfterToolInstallationId_fkey" TO "machine_service_gibs_innerDataToolId_fkey";

-- RenameForeignKey
ALTER TABLE "machine_service_gibs" RENAME CONSTRAINT "machine_service_gibs_innerBeforeAdjustmentId_fkey" TO "machine_service_gibs_innerBeforeId_fkey";

-- RenameForeignKey
ALTER TABLE "machine_service_gibs" RENAME CONSTRAINT "machine_service_gibs_innerBeforeToolInstallationId_fkey" TO "machine_service_gibs_innerBeforeToolId_fkey";

-- RenameForeignKey
ALTER TABLE "machine_service_gibs" RENAME CONSTRAINT "machine_service_gibs_outerAfterAdjustmentId_fkey" TO "machine_service_gibs_outerDataId_fkey";

-- RenameForeignKey
ALTER TABLE "machine_service_gibs" RENAME CONSTRAINT "machine_service_gibs_outerBeforeAdjustmentId_fkey" TO "machine_service_gibs_outerBeforeId_fkey";

-- RenameForeignKey
ALTER TABLE "machine_service_gibs" RENAME CONSTRAINT "machine_service_gibs_outerFreeHangingAfterInstallId_fkey" TO "machine_service_gibs_outerFreeHangingDataId_fkey";
