/*
  Warnings:

  - You are about to alter the column `difference_greenMin` on the `threshold_pistons` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,6)` to `Decimal(10,4)`.
  - You are about to alter the column `difference_yellowMin` on the `threshold_pistons` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,6)` to `Decimal(10,4)`.
  - You are about to alter the column `difference_redMin` on the `threshold_pistons` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,6)` to `Decimal(10,4)`.
  - Made the column `serialNumber` on table `machines` required. This step will fail if there are existing NULL values in that column.

*/
-- Update existing machines with NULL serialNumber to use machine ID as default
UPDATE "machines" SET "serialNumber" = CONCAT('SN-', id) WHERE "serialNumber" IS NULL;

-- AlterTable
ALTER TABLE "machines" ALTER COLUMN "serialNumber" SET NOT NULL;
