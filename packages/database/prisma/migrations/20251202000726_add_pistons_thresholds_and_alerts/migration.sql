-- AlterTable
ALTER TABLE "companies" ADD COLUMN     "accentColor" TEXT,
ADD COLUMN     "loginLogo" TEXT;

-- CreateTable
CREATE TABLE "threshold_pistons" (
    "id" TEXT NOT NULL,
    "blueprintId" TEXT NOT NULL,
    "clearance_greenMin" DECIMAL(10,4) NOT NULL,
    "clearance_yellowMin" DECIMAL(10,4) NOT NULL,
    "clearance_redMin" DECIMAL(10,4) NOT NULL,
    "difference_greenMin" DECIMAL(10,4) NOT NULL,
    "difference_yellowMin" DECIMAL(10,4) NOT NULL,
    "difference_redMin" DECIMAL(10,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "threshold_pistons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alert_pistons" (
    "id" TEXT NOT NULL,
    "machineServiceId" TEXT NOT NULL,
    "outer_lhTop_severity" "AlertSeverity" NOT NULL DEFAULT 'NONE',
    "outer_lhBottom_severity" "AlertSeverity" NOT NULL DEFAULT 'NONE',
    "outer_lhLeft_severity" "AlertSeverity" NOT NULL DEFAULT 'NONE',
    "outer_lhRight_severity" "AlertSeverity" NOT NULL DEFAULT 'NONE',
    "outer_rhTop_severity" "AlertSeverity" NOT NULL DEFAULT 'NONE',
    "outer_rhBottom_severity" "AlertSeverity" NOT NULL DEFAULT 'NONE',
    "outer_rhLeft_severity" "AlertSeverity" NOT NULL DEFAULT 'NONE',
    "outer_rhRight_severity" "AlertSeverity" NOT NULL DEFAULT 'NONE',
    "outer_lhLeftRight_diff" DECIMAL(10,4),
    "outer_lhLeftRight_severity" "AlertSeverity" NOT NULL DEFAULT 'NONE',
    "outer_lhTopBottom_diff" DECIMAL(10,4),
    "outer_lhTopBottom_severity" "AlertSeverity" NOT NULL DEFAULT 'NONE',
    "outer_rhLeftRight_diff" DECIMAL(10,4),
    "outer_rhLeftRight_severity" "AlertSeverity" NOT NULL DEFAULT 'NONE',
    "outer_rhTopBottom_diff" DECIMAL(10,4),
    "outer_rhTopBottom_severity" "AlertSeverity" NOT NULL DEFAULT 'NONE',
    "inner_lhTop_severity" "AlertSeverity" NOT NULL DEFAULT 'NONE',
    "inner_lhBottom_severity" "AlertSeverity" NOT NULL DEFAULT 'NONE',
    "inner_lhLeft_severity" "AlertSeverity" NOT NULL DEFAULT 'NONE',
    "inner_lhRight_severity" "AlertSeverity" NOT NULL DEFAULT 'NONE',
    "inner_rhTop_severity" "AlertSeverity" NOT NULL DEFAULT 'NONE',
    "inner_rhBottom_severity" "AlertSeverity" NOT NULL DEFAULT 'NONE',
    "inner_rhLeft_severity" "AlertSeverity" NOT NULL DEFAULT 'NONE',
    "inner_rhRight_severity" "AlertSeverity" NOT NULL DEFAULT 'NONE',
    "inner_lhLeftRight_diff" DECIMAL(10,4),
    "inner_lhLeftRight_severity" "AlertSeverity" NOT NULL DEFAULT 'NONE',
    "inner_lhTopBottom_diff" DECIMAL(10,4),
    "inner_lhTopBottom_severity" "AlertSeverity" NOT NULL DEFAULT 'NONE',
    "inner_rhLeftRight_diff" DECIMAL(10,4),
    "inner_rhLeftRight_severity" "AlertSeverity" NOT NULL DEFAULT 'NONE',
    "inner_rhTopBottom_diff" DECIMAL(10,4),
    "inner_rhTopBottom_severity" "AlertSeverity" NOT NULL DEFAULT 'NONE',
    "thresholdSnapshot" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alert_pistons_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "threshold_pistons_blueprintId_key" ON "threshold_pistons"("blueprintId");

-- CreateIndex
CREATE UNIQUE INDEX "alert_pistons_machineServiceId_key" ON "alert_pistons"("machineServiceId");

-- AddForeignKey
ALTER TABLE "threshold_pistons" ADD CONSTRAINT "threshold_pistons_blueprintId_fkey" FOREIGN KEY ("blueprintId") REFERENCES "blueprints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alert_pistons" ADD CONSTRAINT "alert_pistons_machineServiceId_fkey" FOREIGN KEY ("machineServiceId") REFERENCES "machine_services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
