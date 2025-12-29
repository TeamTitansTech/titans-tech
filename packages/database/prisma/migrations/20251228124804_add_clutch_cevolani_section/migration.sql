-- AlterEnum
ALTER TYPE "ServiceSection" ADD VALUE 'CLUTCH_CEVOLANI';

-- CreateTable
CREATE TABLE "threshold_clutch_cevolani" (
    "id" TEXT NOT NULL,
    "blueprintId" TEXT NOT NULL,
    "hydClutchClearanceTotal_greenMin" DECIMAL(10,4) NOT NULL,
    "hydClutchClearanceTotal_yellowMin" DECIMAL(10,4) NOT NULL,
    "hydClutchClearanceTotal_redMin" DECIMAL(10,4) NOT NULL,
    "hydClutchClearanceRear_greenMin" DECIMAL(10,4) NOT NULL,
    "hydClutchClearanceRear_yellowMin" DECIMAL(10,4) NOT NULL,
    "hydClutchClearanceRear_redMin" DECIMAL(10,4) NOT NULL,
    "fb_greenMin" DECIMAL(10,4) NOT NULL,
    "fb_yellowMin" DECIMAL(10,4) NOT NULL,
    "fb_redMin" DECIMAL(10,4) NOT NULL,
    "fTB_greenMin" DECIMAL(10,4) NOT NULL,
    "fTB_yellowMin" DECIMAL(10,4) NOT NULL,
    "fTB_redMin" DECIMAL(10,4) NOT NULL,
    "rTB_greenMin" DECIMAL(10,4) NOT NULL,
    "rTB_yellowMin" DECIMAL(10,4) NOT NULL,
    "rTB_redMin" DECIMAL(10,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "threshold_clutch_cevolani_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alert_clutch_cevolani" (
    "id" TEXT NOT NULL,
    "machineServiceId" TEXT NOT NULL,
    "hydClutchClearanceTotal_value" DECIMAL(10,4) NOT NULL,
    "hydClutchClearanceTotal_severity" "AlertSeverity" NOT NULL,
    "hydClutchClearanceRear_value" DECIMAL(10,4) NOT NULL,
    "hydClutchClearanceRear_severity" "AlertSeverity" NOT NULL,
    "fb_value" DECIMAL(10,4) NOT NULL,
    "fb_severity" "AlertSeverity" NOT NULL,
    "fTB_value" DECIMAL(10,4) NOT NULL,
    "fTB_severity" "AlertSeverity" NOT NULL,
    "rTB_value" DECIMAL(10,4) NOT NULL,
    "rTB_severity" "AlertSeverity" NOT NULL,
    "thresholdSnapshot" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alert_clutch_cevolani_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "machine_service_clutch_cevolani" (
    "id" TEXT NOT NULL,
    "machineServiceId" TEXT NOT NULL,
    "dataId" TEXT,
    "attachments" JSONB DEFAULT '[]',

    CONSTRAINT "machine_service_clutch_cevolani_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "threshold_clutch_cevolani_blueprintId_key" ON "threshold_clutch_cevolani"("blueprintId");

-- CreateIndex
CREATE INDEX "alert_clutch_cevolani_machineServiceId_idx" ON "alert_clutch_cevolani"("machineServiceId");

-- AddForeignKey
ALTER TABLE "threshold_clutch_cevolani" ADD CONSTRAINT "threshold_clutch_cevolani_blueprintId_fkey" FOREIGN KEY ("blueprintId") REFERENCES "blueprints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alert_clutch_cevolani" ADD CONSTRAINT "alert_clutch_cevolani_machineServiceId_fkey" FOREIGN KEY ("machineServiceId") REFERENCES "machine_services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_service_clutch_cevolani" ADD CONSTRAINT "machine_service_clutch_cevolani_machineServiceId_fkey" FOREIGN KEY ("machineServiceId") REFERENCES "machine_services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_service_clutch_cevolani" ADD CONSTRAINT "machine_service_clutch_cevolani_dataId_fkey" FOREIGN KEY ("dataId") REFERENCES "service_data_clutch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
