-- AlterTable
ALTER TABLE "service_data_bearing_clearance" ADD COLUMN     "chainsGearsSprockets" TEXT,
ADD COLUMN     "lockingClamps" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "powerCordHoses" TEXT,
ADD COLUMN     "slideMotorMounts" TEXT;

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
