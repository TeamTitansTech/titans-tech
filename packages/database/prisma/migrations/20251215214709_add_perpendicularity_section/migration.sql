-- AlterEnum
ALTER TYPE "ServiceSection" ADD VALUE 'PERPENDICULARITY';

-- CreateTable
CREATE TABLE "machine_service_perpendicularity" (
    "id" TEXT NOT NULL,
    "machineServiceId" TEXT NOT NULL,
    "hasBeenAdjusted" "YesNoDncType",
    "beforeFR" DECIMAL(10,4),
    "beforeLR" DECIMAL(10,4),
    "afterFR" DECIMAL(10,4),
    "afterLR" DECIMAL(10,4),
    "notes" TEXT,

    CONSTRAINT "machine_service_perpendicularity_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "machine_service_perpendicularity" ADD CONSTRAINT "machine_service_perpendicularity_machineServiceId_fkey" FOREIGN KEY ("machineServiceId") REFERENCES "machine_services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
