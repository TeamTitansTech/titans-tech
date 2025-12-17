-- Add enum values (idempotent)
DO $$ BEGIN
  ALTER TYPE "ServiceSection" ADD VALUE 'BEARING_CLEARANCE_SINGLE_HAMMER';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TYPE "ServiceSection" ADD VALUE 'ANGULARITY';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- AlterTable
ALTER TABLE "machine_services" ADD COLUMN IF NOT EXISTS "fillAngularity" BOOLEAN;

-- CreateTable for threshold
CREATE TABLE IF NOT EXISTS "threshold_bearing_clearance_single_hammer" (
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

-- CreateIndex for threshold
CREATE UNIQUE INDEX IF NOT EXISTS "threshold_bearing_clearance_single_hammer_blueprintId_key" ON "threshold_bearing_clearance_single_hammer"("blueprintId");

-- AddForeignKey for threshold
DO $$ BEGIN
  ALTER TABLE "threshold_bearing_clearance_single_hammer" ADD CONSTRAINT "threshold_bearing_clearance_single_hammer_blueprintId_fkey" FOREIGN KEY ("blueprintId") REFERENCES "blueprints"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- CreateTable for alert
CREATE TABLE IF NOT EXISTS "alert_bearing_clearance_single_hammer" (
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

-- CreateIndex for alert
CREATE INDEX IF NOT EXISTS "alert_bearing_clearance_single_hammer_machineServiceId_idx" ON "alert_bearing_clearance_single_hammer"("machineServiceId");

-- AddForeignKey for alert
DO $$ BEGIN
  ALTER TABLE "alert_bearing_clearance_single_hammer" ADD CONSTRAINT "alert_bearing_clearance_single_hammer_machineServiceId_fkey" FOREIGN KEY ("machineServiceId") REFERENCES "machine_services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- CreateTable for service data
CREATE TABLE IF NOT EXISTS "machine_service_bearing_clearance_single_hammer" (
    "id" TEXT NOT NULL,
    "machineServiceId" TEXT NOT NULL,
    "beforeDataId" TEXT,
    "dataId" TEXT,

    CONSTRAINT "machine_service_bearing_clearance_single_hammer_pkey" PRIMARY KEY ("id")
);

-- CreateTable for angularity
CREATE TABLE IF NOT EXISTS "machine_service_angularity" (
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
CREATE UNIQUE INDEX IF NOT EXISTS "machine_service_bearing_clearance_single_hammer_machineSer_key" ON "machine_service_bearing_clearance_single_hammer"("machineServiceId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "machine_service_angularity_machineServiceId_key" ON "machine_service_angularity"("machineServiceId");

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "machine_service_bearing_clearance_single_hammer" ADD CONSTRAINT "machine_service_bearing_clearance_single_hammer_machineSe_fkey" FOREIGN KEY ("machineServiceId") REFERENCES "machine_services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "machine_service_bearing_clearance_single_hammer" ADD CONSTRAINT "machine_service_bearing_clearance_single_hammer_beforeDat_fkey" FOREIGN KEY ("beforeDataId") REFERENCES "bearing_clearance_data"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "machine_service_bearing_clearance_single_hammer" ADD CONSTRAINT "machine_service_bearing_clearance_single_hammer_dataId_fkey" FOREIGN KEY ("dataId") REFERENCES "bearing_clearance_data"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "machine_service_angularity" ADD CONSTRAINT "machine_service_angularity_machineServiceId_fkey" FOREIGN KEY ("machineServiceId") REFERENCES "machine_services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
