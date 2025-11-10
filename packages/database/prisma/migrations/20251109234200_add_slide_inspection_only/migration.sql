-- CreateEnum for Slide-specific types
CREATE TYPE "ParallelismType" AS ENUM ('DNC', 'TO_BED', 'TO_BOLSTER');

-- CreateEnum for measurement units
CREATE TYPE "MeasurementUnit" AS ENUM ('INCHES', 'MM');

-- CreateTable for Slide Inspection junction
CREATE TABLE "machine_inspection_slide" (
    "id" TEXT NOT NULL,
    "machineInspectionId" TEXT NOT NULL,
    "outerSlideBeforeId" TEXT,
    "outerSlideAfterId" TEXT,
    "innerSlideBeforeId" TEXT,
    "innerSlideAfterId" TEXT,

    CONSTRAINT "machine_inspection_slide_pkey" PRIMARY KEY ("id")
);

-- CreateTable for Slide measurement data
CREATE TABLE "slide_data" (
    "id" TEXT NOT NULL,
    "parallelism" "ParallelismType" NOT NULL,
    "hasBeenAdjusted" BOOLEAN NOT NULL DEFAULT false,
    "position1" DECIMAL(10,4) NOT NULL,
    "position2" DECIMAL(10,4) NOT NULL,
    "position3" DECIMAL(10,4) NOT NULL,
    "unit" "MeasurementUnit" NOT NULL,
    "shutheightChecked" BOOLEAN NOT NULL DEFAULT false,
    "actualSH" TEXT,
    "overloadsOnMonitor" TEXT,
    "indicatorReading" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "slide_data_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "machine_inspection_slide" ADD CONSTRAINT "machine_inspection_slide_machineInspectionId_fkey" FOREIGN KEY ("machineInspectionId") REFERENCES "machine_inspections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_inspection_slide" ADD CONSTRAINT "machine_inspection_slide_outerSlideBeforeId_fkey" FOREIGN KEY ("outerSlideBeforeId") REFERENCES "slide_data"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_inspection_slide" ADD CONSTRAINT "machine_inspection_slide_outerSlideAfterId_fkey" FOREIGN KEY ("outerSlideAfterId") REFERENCES "slide_data"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_inspection_slide" ADD CONSTRAINT "machine_inspection_slide_innerSlideBeforeId_fkey" FOREIGN KEY ("innerSlideBeforeId") REFERENCES "slide_data"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_inspection_slide" ADD CONSTRAINT "machine_inspection_slide_innerSlideAfterId_fkey" FOREIGN KEY ("innerSlideAfterId") REFERENCES "slide_data"("id") ON DELETE SET NULL ON UPDATE CASCADE;
