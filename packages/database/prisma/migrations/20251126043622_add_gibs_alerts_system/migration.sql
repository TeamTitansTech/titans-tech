-- CreateTable
CREATE TABLE "threshold_gibs" (
    "id" TEXT NOT NULL,
    "blueprintId" TEXT NOT NULL,
    "usable_greenMin" DECIMAL(10,4) NOT NULL,
    "usable_yellowMin" DECIMAL(10,4) NOT NULL,
    "usable_redMin" DECIMAL(10,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "threshold_gibs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alert_gibs" (
    "id" TEXT NOT NULL,
    "machineServiceId" TEXT NOT NULL,
    "usable_value" DECIMAL(10,4) NOT NULL,
    "usable_severity" "AlertSeverity" NOT NULL,
    "thresholdSnapshot" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alert_gibs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "threshold_gibs_blueprintId_key" ON "threshold_gibs"("blueprintId");

-- CreateIndex
CREATE UNIQUE INDEX "alert_gibs_machineServiceId_key" ON "alert_gibs"("machineServiceId");

-- AddForeignKey
ALTER TABLE "threshold_gibs" ADD CONSTRAINT "threshold_gibs_blueprintId_fkey" FOREIGN KEY ("blueprintId") REFERENCES "blueprints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alert_gibs" ADD CONSTRAINT "alert_gibs_machineServiceId_fkey" FOREIGN KEY ("machineServiceId") REFERENCES "machine_services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
