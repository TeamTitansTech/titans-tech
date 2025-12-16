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

-- CreateTable
CREATE TABLE IF NOT EXISTS "machine_service_bearing_clearance_single_hammer" (
    "id" TEXT NOT NULL,
    "machineServiceId" TEXT NOT NULL,
    "hasBeenAdjusted" "YesNoDncType",
    "beforeDataId" TEXT,
    "dataId" TEXT,
    "notes" TEXT,

    CONSTRAINT "machine_service_bearing_clearance_single_hammer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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
  ALTER TABLE "machine_service_bearing_clearance_single_hammer" ADD CONSTRAINT "machine_service_bearing_clearance_single_hammer_beforeDat_fkey" FOREIGN KEY ("beforeDataId") REFERENCES "bearing_clearance_single_hammer_data"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "machine_service_bearing_clearance_single_hammer" ADD CONSTRAINT "machine_service_bearing_clearance_single_hammer_dataId_fkey" FOREIGN KEY ("dataId") REFERENCES "bearing_clearance_single_hammer_data"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "machine_service_angularity" ADD CONSTRAINT "machine_service_angularity_machineServiceId_fkey" FOREIGN KEY ("machineServiceId") REFERENCES "machine_services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
