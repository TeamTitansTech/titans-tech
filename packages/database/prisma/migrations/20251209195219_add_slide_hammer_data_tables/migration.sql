/*
  Warnings:

  - You are about to drop the `threshold_slide` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "threshold_slide" DROP CONSTRAINT "threshold_slide_blueprintId_fkey";

-- DropTable
DROP TABLE "threshold_slide";

-- CreateTable
CREATE TABLE "alert_slide_single_hammer" (
    "id" TEXT NOT NULL,
    "machineServiceId" TEXT NOT NULL,
    "maxDeviation_differential" DECIMAL(10,4) NOT NULL,
    "maxDeviation_severity" "AlertSeverity" NOT NULL,
    "thresholdSnapshot" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alert_slide_single_hammer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alert_slide_double_hammer" (
    "id" TEXT NOT NULL,
    "machineServiceId" TEXT NOT NULL,
    "maxDeviationOuter_differential" DECIMAL(10,4) NOT NULL,
    "maxDeviationOuter_severity" "AlertSeverity" NOT NULL,
    "maxDeviationInner_differential" DECIMAL(10,4) NOT NULL,
    "maxDeviationInner_severity" "AlertSeverity" NOT NULL,
    "thresholdSnapshot" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alert_slide_double_hammer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "machine_service_slide_single_hammer" (
    "id" TEXT NOT NULL,
    "machineServiceId" TEXT NOT NULL,
    "beforeDataId" TEXT,
    "dataId" TEXT,
    "notes" TEXT,
    "attachments" JSONB DEFAULT '[]',

    CONSTRAINT "machine_service_slide_single_hammer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "machine_service_slide_double_hammer" (
    "id" TEXT NOT NULL,
    "machineServiceId" TEXT NOT NULL,
    "outerBeforeId" TEXT,
    "outerDataId" TEXT,
    "innerBeforeId" TEXT,
    "innerDataId" TEXT,
    "notes" TEXT,
    "attachments" JSONB DEFAULT '[]',

    CONSTRAINT "machine_service_slide_double_hammer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_data_slide_single_hammer" (
    "id" TEXT NOT NULL,
    "parallelism" "ParallelismType",
    "hasParallelismBeenAdjusted" "YesNoNaDncType",
    "shutheightIndicatorsChecked" "YesNoDncType",
    "overloadsOnTonnageMonitor" TEXT,
    "shutheightActualSh" TEXT,
    "indicatorReading" TEXT,
    "position1" DECIMAL(10,4) NOT NULL,
    "position2" DECIMAL(10,4) NOT NULL,
    "position3" DECIMAL(10,4) NOT NULL,
    "position4" DECIMAL(10,4) NOT NULL,
    "position5" DECIMAL(10,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_data_slide_single_hammer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_data_slide_double_hammer" (
    "id" TEXT NOT NULL,
    "parallelism" "ParallelismType",
    "hasParallelismBeenAdjusted" "YesNoNaDncType",
    "shutheightIndicatorsChecked" "YesNoDncType",
    "overloadsOnTonnageMonitor" TEXT,
    "shutheightActualSh" TEXT,
    "indicatorReading" TEXT,
    "position1" DECIMAL(10,4) NOT NULL,
    "position2" DECIMAL(10,4) NOT NULL,
    "position3" DECIMAL(10,4) NOT NULL,
    "position4" DECIMAL(10,4) NOT NULL,
    "position5" DECIMAL(10,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_data_slide_double_hammer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "alert_slide_single_hammer_machineServiceId_idx" ON "alert_slide_single_hammer"("machineServiceId");

-- CreateIndex
CREATE INDEX "alert_slide_double_hammer_machineServiceId_idx" ON "alert_slide_double_hammer"("machineServiceId");

-- AddForeignKey
ALTER TABLE "alert_slide_single_hammer" ADD CONSTRAINT "alert_slide_single_hammer_machineServiceId_fkey" FOREIGN KEY ("machineServiceId") REFERENCES "machine_services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alert_slide_double_hammer" ADD CONSTRAINT "alert_slide_double_hammer_machineServiceId_fkey" FOREIGN KEY ("machineServiceId") REFERENCES "machine_services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_service_slide_single_hammer" ADD CONSTRAINT "machine_service_slide_single_hammer_machineServiceId_fkey" FOREIGN KEY ("machineServiceId") REFERENCES "machine_services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_service_slide_single_hammer" ADD CONSTRAINT "machine_service_slide_single_hammer_beforeDataId_fkey" FOREIGN KEY ("beforeDataId") REFERENCES "service_data_slide_single_hammer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_service_slide_single_hammer" ADD CONSTRAINT "machine_service_slide_single_hammer_dataId_fkey" FOREIGN KEY ("dataId") REFERENCES "service_data_slide_single_hammer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_service_slide_double_hammer" ADD CONSTRAINT "machine_service_slide_double_hammer_machineServiceId_fkey" FOREIGN KEY ("machineServiceId") REFERENCES "machine_services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_service_slide_double_hammer" ADD CONSTRAINT "machine_service_slide_double_hammer_outerBeforeId_fkey" FOREIGN KEY ("outerBeforeId") REFERENCES "service_data_slide_double_hammer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_service_slide_double_hammer" ADD CONSTRAINT "machine_service_slide_double_hammer_outerDataId_fkey" FOREIGN KEY ("outerDataId") REFERENCES "service_data_slide_double_hammer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_service_slide_double_hammer" ADD CONSTRAINT "machine_service_slide_double_hammer_innerBeforeId_fkey" FOREIGN KEY ("innerBeforeId") REFERENCES "service_data_slide_double_hammer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_service_slide_double_hammer" ADD CONSTRAINT "machine_service_slide_double_hammer_innerDataId_fkey" FOREIGN KEY ("innerDataId") REFERENCES "service_data_slide_double_hammer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
