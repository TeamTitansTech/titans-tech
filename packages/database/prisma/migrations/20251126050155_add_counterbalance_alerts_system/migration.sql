-- CreateEnum
CREATE TYPE "CounterbalanceAlertField" AS ENUM ('AIRBAG_PISTON_SEALS', 'REGULATOR', 'GAUGE', 'PNEUMATICS_PLUMBING', 'ROD_SEALS', 'ROD_BUSHING', 'OIL_WICK');

-- CreateTable
CREATE TABLE "alert_counterbalance_cylinder_airbag" (
    "id" TEXT NOT NULL,
    "machineServiceId" TEXT NOT NULL,
    "fieldName" "CounterbalanceAlertField" NOT NULL,
    "justification" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alert_counterbalance_cylinder_airbag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "alert_counterbalance_cylinder_airbag_machineServiceId_field_key" ON "alert_counterbalance_cylinder_airbag"("machineServiceId", "fieldName");

-- AddForeignKey
ALTER TABLE "alert_counterbalance_cylinder_airbag" ADD CONSTRAINT "alert_counterbalance_cylinder_airbag_machineServiceId_fkey" FOREIGN KEY ("machineServiceId") REFERENCES "machine_services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
