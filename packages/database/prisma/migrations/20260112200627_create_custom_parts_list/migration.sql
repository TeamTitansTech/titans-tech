/*
  Warnings:

  - You are about to alter the column `difference_greenMin` on the `threshold_pistons` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,6)` to `Decimal(10,4)`.
  - You are about to alter the column `difference_yellowMin` on the `threshold_pistons` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,6)` to `Decimal(10,4)`.
  - You are about to alter the column `difference_redMin` on the `threshold_pistons` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,6)` to `Decimal(10,4)`.

*/
-- AlterTable
ALTER TABLE "threshold_pistons" ALTER COLUMN "difference_greenMin" SET DATA TYPE DECIMAL(10,4),
ALTER COLUMN "difference_yellowMin" SET DATA TYPE DECIMAL(10,4),
ALTER COLUMN "difference_redMin" SET DATA TYPE DECIMAL(10,4);

-- CreateTable
CREATE TABLE "machine_parts_configs" (
    "id" TEXT NOT NULL,
    "machineId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "machine_parts_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "machine_parts_subsections" (
    "id" TEXT NOT NULL,
    "configId" TEXT NOT NULL,
    "sectionKey" TEXT NOT NULL,
    "subsectionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "figureReference" TEXT,
    "description" TEXT,
    "diagramImageUrl" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "machine_parts_subsections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "machine_part_items" (
    "id" TEXT NOT NULL,
    "subsectionId" TEXT NOT NULL,
    "partNumber" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "location" TEXT,
    "notes" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "machine_part_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "machine_parts_configs_machineId_key" ON "machine_parts_configs"("machineId");

-- CreateIndex
CREATE INDEX "machine_parts_subsections_configId_sectionKey_idx" ON "machine_parts_subsections"("configId", "sectionKey");

-- CreateIndex
CREATE UNIQUE INDEX "machine_parts_subsections_configId_sectionKey_subsectionId_key" ON "machine_parts_subsections"("configId", "sectionKey", "subsectionId");

-- CreateIndex
CREATE INDEX "machine_part_items_subsectionId_idx" ON "machine_part_items"("subsectionId");

-- AddForeignKey
ALTER TABLE "machine_parts_configs" ADD CONSTRAINT "machine_parts_configs_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "machines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_parts_subsections" ADD CONSTRAINT "machine_parts_subsections_configId_fkey" FOREIGN KEY ("configId") REFERENCES "machine_parts_configs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_part_items" ADD CONSTRAINT "machine_part_items_subsectionId_fkey" FOREIGN KEY ("subsectionId") REFERENCES "machine_parts_subsections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
