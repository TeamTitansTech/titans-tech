-- DropIndex
DROP INDEX "alert_bearing_clearance_machineServiceId_key";

-- DropIndex
DROP INDEX "alert_clutch_machineServiceId_key";

-- DropIndex
DROP INDEX "alert_gibs_machineServiceId_key";

-- DropIndex
DROP INDEX "alert_slide_machineServiceId_key";

-- AlterTable
ALTER TABLE "companies" ADD COLUMN     "accentColor" TEXT,
ADD COLUMN     "loginLogo" TEXT;

-- CreateIndex
CREATE INDEX "alert_bearing_clearance_machineServiceId_idx" ON "alert_bearing_clearance"("machineServiceId");

-- CreateIndex
CREATE INDEX "alert_clutch_machineServiceId_idx" ON "alert_clutch"("machineServiceId");

-- CreateIndex
CREATE INDEX "alert_gibs_machineServiceId_idx" ON "alert_gibs"("machineServiceId");

-- CreateIndex
CREATE INDEX "alert_slide_machineServiceId_idx" ON "alert_slide"("machineServiceId");
