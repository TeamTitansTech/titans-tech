-- AlterEnum
ALTER TYPE "ServiceSection" ADD VALUE 'ANGULARITY';

-- CreateTable
CREATE TABLE "machine_service_angularity" (
    "id" TEXT NOT NULL,
    "machineServiceId" TEXT NOT NULL,
    "beforeDataId" TEXT,
    "afterDataId" TEXT,
    "sizeTonnage" TEXT,
    "serialNumber" TEXT,
    "stroke" TEXT,
    "spm" TEXT,
    "distanceIndicatorTipFromSlide" TEXT,
    "locationOfIndicator" TEXT,
    "counterbalancePressure" TEXT,
    "partOfStrokeBeingRead" TEXT,
    "shutheightSetAt" TEXT,
    "whatWasUsedAsSquare" TEXT,
    "whereWasSquarePlaced" TEXT,
    "whatIndicatorWasUsed" TEXT,
    "whatKindOfTipWasOnIndicator" TEXT,
    "totalLiftCheck" TEXT,
    "hasPerpendicularityBeenAdjusted" "YesNoDncType",
    "notes" TEXT,

    CONSTRAINT "machine_service_angularity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_data_angularity" (
    "id" TEXT NOT NULL,
    "fr" DECIMAL(10,4) NOT NULL,
    "lr" DECIMAL(10,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_data_angularity_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "machine_service_angularity" ADD CONSTRAINT "machine_service_angularity_machineServiceId_fkey" FOREIGN KEY ("machineServiceId") REFERENCES "machine_services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_service_angularity" ADD CONSTRAINT "machine_service_angularity_beforeDataId_fkey" FOREIGN KEY ("beforeDataId") REFERENCES "service_data_angularity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_service_angularity" ADD CONSTRAINT "machine_service_angularity_afterDataId_fkey" FOREIGN KEY ("afterDataId") REFERENCES "service_data_angularity"("id") ON DELETE SET NULL ON UPDATE CASCADE;
