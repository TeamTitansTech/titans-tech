-- CreateTable
CREATE TABLE "threshold_tramming" (
    "id" TEXT NOT NULL,
    "blueprintId" TEXT NOT NULL,
    "greenMin" DECIMAL(10,4) NOT NULL,
    "yellowMin" DECIMAL(10,4) NOT NULL,
    "redMin" DECIMAL(10,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "threshold_tramming_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alert_tramming" (
    "id" TEXT NOT NULL,
    "machineServiceId" TEXT NOT NULL,
    "outer_top_verticalSum" DECIMAL(10,4) NOT NULL,
    "outer_top_verticalSeverity" "AlertSeverity" NOT NULL,
    "outer_top_horizontalSum" DECIMAL(10,4) NOT NULL,
    "outer_top_horizontalSeverity" "AlertSeverity" NOT NULL,
    "outer_bottom_verticalSum" DECIMAL(10,4) NOT NULL,
    "outer_bottom_verticalSeverity" "AlertSeverity" NOT NULL,
    "outer_bottom_horizontalSum" DECIMAL(10,4) NOT NULL,
    "outer_bottom_horizontalSeverity" "AlertSeverity" NOT NULL,
    "outer_left_verticalSum" DECIMAL(10,4) NOT NULL,
    "outer_left_verticalSeverity" "AlertSeverity" NOT NULL,
    "outer_left_horizontalSum" DECIMAL(10,4) NOT NULL,
    "outer_left_horizontalSeverity" "AlertSeverity" NOT NULL,
    "outer_right_verticalSum" DECIMAL(10,4) NOT NULL,
    "outer_right_verticalSeverity" "AlertSeverity" NOT NULL,
    "outer_right_horizontalSum" DECIMAL(10,4) NOT NULL,
    "outer_right_horizontalSeverity" "AlertSeverity" NOT NULL,
    "inner_top_verticalSum" DECIMAL(10,4) NOT NULL,
    "inner_top_verticalSeverity" "AlertSeverity" NOT NULL,
    "inner_top_horizontalSum" DECIMAL(10,4) NOT NULL,
    "inner_top_horizontalSeverity" "AlertSeverity" NOT NULL,
    "inner_bottom_verticalSum" DECIMAL(10,4) NOT NULL,
    "inner_bottom_verticalSeverity" "AlertSeverity" NOT NULL,
    "inner_bottom_horizontalSum" DECIMAL(10,4) NOT NULL,
    "inner_bottom_horizontalSeverity" "AlertSeverity" NOT NULL,
    "inner_left_verticalSum" DECIMAL(10,4) NOT NULL,
    "inner_left_verticalSeverity" "AlertSeverity" NOT NULL,
    "inner_left_horizontalSum" DECIMAL(10,4) NOT NULL,
    "inner_left_horizontalSeverity" "AlertSeverity" NOT NULL,
    "inner_right_verticalSum" DECIMAL(10,4) NOT NULL,
    "inner_right_verticalSeverity" "AlertSeverity" NOT NULL,
    "inner_right_horizontalSum" DECIMAL(10,4) NOT NULL,
    "inner_right_horizontalSeverity" "AlertSeverity" NOT NULL,
    "thresholdSnapshot" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alert_tramming_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "threshold_tramming_blueprintId_key" ON "threshold_tramming"("blueprintId");

-- AddForeignKey
ALTER TABLE "threshold_tramming" ADD CONSTRAINT "threshold_tramming_blueprintId_fkey" FOREIGN KEY ("blueprintId") REFERENCES "blueprints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alert_tramming" ADD CONSTRAINT "alert_tramming_machineServiceId_fkey" FOREIGN KEY ("machineServiceId") REFERENCES "machine_services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
