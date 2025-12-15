-- CreateEnum
CREATE TYPE "YesNoNaDncCantTellType" AS ENUM ('YES', 'NO', 'NA', 'DNC', 'CANT_TELL');

-- AlterEnum
ALTER TYPE "ServiceSection" ADD VALUE 'ELECTRICAL_CONTROL';

-- CreateTable
CREATE TABLE "machine_service_electrical_control" (
    "id" TEXT NOT NULL,
    "machineServiceId" TEXT NOT NULL,
    "hasHourMeter" "YesNoDncType",
    "hourMeterReading" TEXT,
    "isMinsterControl" "YesNoDncType",
    "minsterControlOther" TEXT,
    "controlDoorStop" "YesNoNaDncCantTellType",
    "cabinetTemp" "YesNoNaDncCantTellType",
    "incomingLine" "YesNoNaDncCantTellType",
    "fullVoltage" "YesNoNaDncCantTellType",
    "contactor" "YesNoNaDncCantTellType",
    "overloads" "YesNoNaDncCantTellType",
    "transformers" "YesNoNaDncCantTellType",
    "brakeValve" "YesNoNaDncCantTellType",
    "clutchValve" "YesNoNaDncCantTellType",
    "wiring" "YesNoNaDncCantTellType",
    "terminals" "YesNoNaDncCantTellType",
    "twentyFourVBuss" "YesNoNaDncCantTellType",
    "safetyRelays" "YesNoNaDncCantTellType",
    "notes" TEXT,

    CONSTRAINT "machine_service_electrical_control_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "machine_service_electrical_control" ADD CONSTRAINT "machine_service_electrical_control_machineServiceId_fkey" FOREIGN KEY ("machineServiceId") REFERENCES "machine_services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
