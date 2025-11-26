-- CreateTable
CREATE TABLE "threshold_clutch" (
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

    CONSTRAINT "threshold_clutch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alert_clutch" (
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

    CONSTRAINT "alert_clutch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "threshold_clutch_blueprintId_key" ON "threshold_clutch"("blueprintId");

-- CreateIndex
CREATE UNIQUE INDEX "alert_clutch_machineServiceId_key" ON "alert_clutch"("machineServiceId");

-- AddForeignKey
ALTER TABLE "threshold_clutch" ADD CONSTRAINT "threshold_clutch_blueprintId_fkey" FOREIGN KEY ("blueprintId") REFERENCES "blueprints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alert_clutch" ADD CONSTRAINT "alert_clutch_machineServiceId_fkey" FOREIGN KEY ("machineServiceId") REFERENCES "machine_services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
