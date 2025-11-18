-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ServiceSection" ADD VALUE 'TRAMMING';
ALTER TYPE "ServiceSection" ADD VALUE 'PISTONS';

-- AlterTable
ALTER TABLE "user_branches" ADD COLUMN     "createProductionLines" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "deleteProductionLines" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "readProductionLines" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updateProductionLines" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "machine_service_tramming" (
    "id" TEXT NOT NULL,
    "machineServiceId" TEXT NOT NULL,
    "outerDataId" TEXT,
    "innerDataId" TEXT,
    "slideTram" "YesNoDncType",
    "notes" TEXT,

    CONSTRAINT "machine_service_tramming_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_data_tramming" (
    "id" TEXT NOT NULL,
    "outerTopTop" DECIMAL(10,4) NOT NULL,
    "outerTopBottom" DECIMAL(10,4) NOT NULL,
    "outerTopLeft" DECIMAL(10,4) NOT NULL,
    "outerTopRight" DECIMAL(10,4) NOT NULL,
    "outerBottomTop" DECIMAL(10,4) NOT NULL,
    "outerBottomBottom" DECIMAL(10,4) NOT NULL,
    "outerBottomLeft" DECIMAL(10,4) NOT NULL,
    "outerBottomRight" DECIMAL(10,4) NOT NULL,
    "outerLeftTop" DECIMAL(10,4) NOT NULL,
    "outerLeftBottom" DECIMAL(10,4) NOT NULL,
    "outerLeftLeft" DECIMAL(10,4) NOT NULL,
    "outerLeftRight" DECIMAL(10,4) NOT NULL,
    "outerRightTop" DECIMAL(10,4) NOT NULL,
    "outerRightBottom" DECIMAL(10,4) NOT NULL,
    "outerRightLeft" DECIMAL(10,4) NOT NULL,
    "outerRightRight" DECIMAL(10,4) NOT NULL,
    "innerTopTop" DECIMAL(10,4) NOT NULL,
    "innerTopBottom" DECIMAL(10,4) NOT NULL,
    "innerTopLeft" DECIMAL(10,4) NOT NULL,
    "innerTopRight" DECIMAL(10,4) NOT NULL,
    "innerBottomTop" DECIMAL(10,4) NOT NULL,
    "innerBottomBottom" DECIMAL(10,4) NOT NULL,
    "innerBottomLeft" DECIMAL(10,4) NOT NULL,
    "innerBottomRight" DECIMAL(10,4) NOT NULL,
    "innerLeftTop" DECIMAL(10,4) NOT NULL,
    "innerLeftBottom" DECIMAL(10,4) NOT NULL,
    "innerLeftLeft" DECIMAL(10,4) NOT NULL,
    "innerLeftRight" DECIMAL(10,4) NOT NULL,
    "innerRightTop" DECIMAL(10,4) NOT NULL,
    "innerRightBottom" DECIMAL(10,4) NOT NULL,
    "innerRightLeft" DECIMAL(10,4) NOT NULL,
    "innerRightRight" DECIMAL(10,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_data_tramming_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "machine_service_pistons" (
    "id" TEXT NOT NULL,
    "machineServiceId" TEXT NOT NULL,
    "outerDataId" TEXT,
    "innerDataId" TEXT,
    "guidSeals" TEXT,
    "pistonSeals" TEXT,
    "vacuumSystem" TEXT,
    "vacuumSystemAirPressureSetting" DECIMAL(10,4),
    "vacuumSystemAirPressureUnit" TEXT DEFAULT 'PSI',
    "unit" TEXT DEFAULT 'inches',
    "notes" TEXT,

    CONSTRAINT "machine_service_pistons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_data_pistons" (
    "id" TEXT NOT NULL,
    "outerLhFrontTop" DECIMAL(10,4) NOT NULL,
    "outerLhFrontBottom" DECIMAL(10,4) NOT NULL,
    "outerLhLeft" DECIMAL(10,4) NOT NULL,
    "outerLhRight" DECIMAL(10,4) NOT NULL,
    "outerRhFrontTop" DECIMAL(10,4) NOT NULL,
    "outerRhFrontBottom" DECIMAL(10,4) NOT NULL,
    "outerRhLeft" DECIMAL(10,4) NOT NULL,
    "outerRhRight" DECIMAL(10,4) NOT NULL,
    "innerLhFrontTop" DECIMAL(10,4) NOT NULL,
    "innerLhFrontBottom" DECIMAL(10,4) NOT NULL,
    "innerLhLeft" DECIMAL(10,4) NOT NULL,
    "innerLhRight" DECIMAL(10,4) NOT NULL,
    "innerRhFrontTop" DECIMAL(10,4) NOT NULL,
    "innerRhFrontBottom" DECIMAL(10,4) NOT NULL,
    "innerRhLeft" DECIMAL(10,4) NOT NULL,
    "innerRhRight" DECIMAL(10,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_data_pistons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production_lines" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "production_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "machine_production_lines" (
    "machineId" TEXT NOT NULL,
    "productionLineId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "machine_production_lines_pkey" PRIMARY KEY ("machineId","productionLineId")
);

-- AddForeignKey
ALTER TABLE "machine_service_tramming" ADD CONSTRAINT "machine_service_tramming_machineServiceId_fkey" FOREIGN KEY ("machineServiceId") REFERENCES "machine_services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_service_tramming" ADD CONSTRAINT "machine_service_tramming_outerDataId_fkey" FOREIGN KEY ("outerDataId") REFERENCES "service_data_tramming"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_service_tramming" ADD CONSTRAINT "machine_service_tramming_innerDataId_fkey" FOREIGN KEY ("innerDataId") REFERENCES "service_data_tramming"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_service_pistons" ADD CONSTRAINT "machine_service_pistons_machineServiceId_fkey" FOREIGN KEY ("machineServiceId") REFERENCES "machine_services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_service_pistons" ADD CONSTRAINT "machine_service_pistons_outerDataId_fkey" FOREIGN KEY ("outerDataId") REFERENCES "service_data_pistons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_service_pistons" ADD CONSTRAINT "machine_service_pistons_innerDataId_fkey" FOREIGN KEY ("innerDataId") REFERENCES "service_data_pistons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_lines" ADD CONSTRAINT "production_lines_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "company_branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_production_lines" ADD CONSTRAINT "machine_production_lines_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "machines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_production_lines" ADD CONSTRAINT "machine_production_lines_productionLineId_fkey" FOREIGN KEY ("productionLineId") REFERENCES "production_lines"("id") ON DELETE CASCADE ON UPDATE CASCADE;
