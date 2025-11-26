-- CreateTable
CREATE TABLE "threshold_slide" (
    "id" TEXT NOT NULL,
    "blueprintId" TEXT NOT NULL,
    "maxDeviation_greenMin" DECIMAL(10,4) NOT NULL,
    "maxDeviation_yellowMin" DECIMAL(10,4) NOT NULL,
    "maxDeviation_redMin" DECIMAL(10,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "threshold_slide_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alert_slide" (
    "id" TEXT NOT NULL,
    "machineServiceId" TEXT NOT NULL,
    "maxDeviationOuter_differential" DECIMAL(10,4) NOT NULL,
    "maxDeviationOuter_severity" "AlertSeverity" NOT NULL,
    "maxDeviationInner_differential" DECIMAL(10,4) NOT NULL,
    "maxDeviationInner_severity" "AlertSeverity" NOT NULL,
    "thresholdSnapshot" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alert_slide_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "threshold_slide_blueprintId_key" ON "threshold_slide"("blueprintId");

-- CreateIndex
CREATE UNIQUE INDEX "alert_slide_machineServiceId_key" ON "alert_slide"("machineServiceId");

-- AddForeignKey
ALTER TABLE "threshold_slide" ADD CONSTRAINT "threshold_slide_blueprintId_fkey" FOREIGN KEY ("blueprintId") REFERENCES "blueprints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alert_slide" ADD CONSTRAINT "alert_slide_machineServiceId_fkey" FOREIGN KEY ("machineServiceId") REFERENCES "machine_services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
