-- CreateEnum
CREATE TYPE "ProductionLineDirection" AS ENUM ('LEFT_TO_RIGHT', 'RIGHT_TO_LEFT');

-- AlterTable
ALTER TABLE "production_lines" ADD COLUMN     "direction" "ProductionLineDirection" NOT NULL DEFAULT 'LEFT_TO_RIGHT';
