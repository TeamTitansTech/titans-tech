-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ServiceSection" ADD VALUE 'BEARING_CLEARANCE_SINGLE_HAMMER';
ALTER TYPE "ServiceSection" ADD VALUE 'ANGULARITY';

-- AlterTable
ALTER TABLE "machine_services" ADD COLUMN     "fillAngularity" BOOLEAN DEFAULT false;

-- CreateTable
CREATE TABLE "threshold_bearing_clearance_single_hammer" (
    "id" TEXT NOT NULL,
    "blueprintId" TEXT NOT NULL,
    "totalClearance_greenMin" DECIMAL(10,4) NOT NULL,
    "totalClearance_yellowMin" DECIMAL(10,4) NOT NULL,
    "totalClearance_redMin" DECIMAL(10,4) NOT NULL,
    "mainBearings_greenMin" DECIMAL(10,4) NOT NULL,
    "mainBearings_yellowMin" DECIMAL(10,4) NOT NULL,
    "mainBearings_redMin" DECIMAL(10,4) NOT NULL,
    "upperConnectionBearings_greenMin" DECIMAL(10,4) NOT NULL,
    "upperConnectionBearings_yellowMin" DECIMAL(10,4) NOT NULL,
    "upperConnectionBearings_redMin" DECIMAL(10,4) NOT NULL,
    "wristPinToMatingPart_greenMin" DECIMAL(10,4) NOT NULL,
    "wristPinToMatingPart_yellowMin" DECIMAL(10,4) NOT NULL,
    "wristPinToMatingPart_redMin" DECIMAL(10,4) NOT NULL,
    "wristPinToBushing_greenMin" DECIMAL(10,4) NOT NULL,
    "wristPinToBushing_yellowMin" DECIMAL(10,4) NOT NULL,
    "wristPinToBushing_redMin" DECIMAL(10,4) NOT NULL,
    "slideAdjNutToScrewSleeve_greenMin" DECIMAL(10,4) NOT NULL,
    "slideAdjNutToScrewSleeve_yellowMin" DECIMAL(10,4) NOT NULL,
    "slideAdjNutToScrewSleeve_redMin" DECIMAL(10,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "threshold_bearing_clearance_single_hammer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alert_bearing_clearance_single_hammer" (
    "id" TEXT NOT NULL,
    "machineServiceId" TEXT NOT NULL,
    "totalClearance_differential" DECIMAL(10,4) NOT NULL,
    "totalClearance_severity" "AlertSeverity" NOT NULL,
    "mainBearings_differential" DECIMAL(10,4) NOT NULL,
    "mainBearings_severity" "AlertSeverity" NOT NULL,
    "upperConnectionBearings_differential" DECIMAL(10,4) NOT NULL,
    "upperConnectionBearings_severity" "AlertSeverity" NOT NULL,
    "wristPinToMatingPart_differential" DECIMAL(10,4) NOT NULL,
    "wristPinToMatingPart_severity" "AlertSeverity" NOT NULL,
    "wristPinToBushing_differential" DECIMAL(10,4) NOT NULL,
    "wristPinToBushing_severity" "AlertSeverity" NOT NULL,
    "slideAdjNutToScrewSleeve_differential" DECIMAL(10,4) NOT NULL,
    "slideAdjNutToScrewSleeve_severity" "AlertSeverity" NOT NULL,
    "thresholdSnapshot" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alert_bearing_clearance_single_hammer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "machine_service_bearing_clearance_single_hammer" (
    "id" TEXT NOT NULL,
    "machineServiceId" TEXT NOT NULL,
    "beforeDataId" TEXT,
    "dataId" TEXT,

    CONSTRAINT "machine_service_bearing_clearance_single_hammer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "machine_service_angularity" (
    "id" TEXT NOT NULL,
    "machineServiceId" TEXT NOT NULL,
    "hasBeenAdjusted" "YesNoDncType",
    "spm" DECIMAL(10,2),
    "distanceOfIndicatorTip" DECIMAL(10,4),
    "locationOfIndicator" TEXT,
    "counterbalancePressure" DECIMAL(10,2),
    "strokePartBeingRead" TEXT,
    "shutheightSetAt" TEXT,
    "whatWasUsedAsSquare" TEXT,
    "whereWasSquarePlaced" TEXT,
    "indicatorUsedGraduation" TEXT,
    "tipKindOnIndicator" TEXT,
    "totalLiftCheck" DECIMAL(10,4),
    "beforeFR" DECIMAL(10,4),
    "beforeLR" DECIMAL(10,4),
    "afterFR" DECIMAL(10,4),
    "afterLR" DECIMAL(10,4),
    "notes" TEXT,

    CONSTRAINT "machine_service_angularity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "threshold_bearing_clearance_single_hammer_blueprintId_key" ON "threshold_bearing_clearance_single_hammer"("blueprintId");

-- CreateIndex
CREATE INDEX "alert_bearing_clearance_single_hammer_machineServiceId_idx" ON "alert_bearing_clearance_single_hammer"("machineServiceId");

-- AddForeignKey
ALTER TABLE "threshold_bearing_clearance_single_hammer" ADD CONSTRAINT "threshold_bearing_clearance_single_hammer_blueprintId_fkey" FOREIGN KEY ("blueprintId") REFERENCES "blueprints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alert_bearing_clearance_single_hammer" ADD CONSTRAINT "alert_bearing_clearance_single_hammer_machineServiceId_fkey" FOREIGN KEY ("machineServiceId") REFERENCES "machine_services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_service_bearing_clearance_single_hammer" ADD CONSTRAINT "machine_service_bearing_clearance_single_hammer_machineSer_fkey" FOREIGN KEY ("machineServiceId") REFERENCES "machine_services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_service_bearing_clearance_single_hammer" ADD CONSTRAINT "machine_service_bearing_clearance_single_hammer_beforeData_fkey" FOREIGN KEY ("beforeDataId") REFERENCES "service_data_bearing_clearance"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_service_bearing_clearance_single_hammer" ADD CONSTRAINT "machine_service_bearing_clearance_single_hammer_dataId_fkey" FOREIGN KEY ("dataId") REFERENCES "service_data_bearing_clearance"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_service_angularity" ADD CONSTRAINT "machine_service_angularity_machineServiceId_fkey" FOREIGN KEY ("machineServiceId") REFERENCES "machine_services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
