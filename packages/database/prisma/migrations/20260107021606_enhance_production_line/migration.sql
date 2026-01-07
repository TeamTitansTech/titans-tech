/*
  Warnings:

  - You are about to alter the column `difference_greenMin` on the `threshold_pistons` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,6)` to `Decimal(10,4)`.
  - You are about to alter the column `difference_yellowMin` on the `threshold_pistons` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,6)` to `Decimal(10,4)`.
  - You are about to alter the column `difference_redMin` on the `threshold_pistons` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,6)` to `Decimal(10,4)`.

*/
-- AlterTable
ALTER TABLE "machine_production_lines" ADD COLUMN     "positionX" DOUBLE PRECISION,
ADD COLUMN     "positionY" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "threshold_pistons" ALTER COLUMN "difference_greenMin" SET DATA TYPE DECIMAL(10,4),
ALTER COLUMN "difference_yellowMin" SET DATA TYPE DECIMAL(10,4),
ALTER COLUMN "difference_redMin" SET DATA TYPE DECIMAL(10,4);

-- CreateTable
CREATE TABLE "production_line_edges" (
    "id" TEXT NOT NULL,
    "productionLineId" TEXT NOT NULL,
    "sourceNodeId" TEXT NOT NULL,
    "targetNodeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "production_line_edges_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "production_line_edges_productionLineId_sourceNodeId_targetN_key" ON "production_line_edges"("productionLineId", "sourceNodeId", "targetNodeId");

-- AddForeignKey
ALTER TABLE "production_line_edges" ADD CONSTRAINT "production_line_edges_productionLineId_fkey" FOREIGN KEY ("productionLineId") REFERENCES "production_lines"("id") ON DELETE CASCADE ON UPDATE CASCADE;
