-- CreateEnum
CREATE TYPE "ThresholdMode" AS ENUM ('LINEAR', 'CENTRAL');

-- AlterTable
ALTER TABLE "threshold_pistons" ADD COLUMN     "central_greenMax" DECIMAL(10,4),
ADD COLUMN     "central_greenMin" DECIMAL(10,4),
ADD COLUMN     "central_yellowMax" DECIMAL(10,4),
ADD COLUMN     "central_yellowMin" DECIMAL(10,4),
ADD COLUMN     "thresholdMode" "ThresholdMode" NOT NULL DEFAULT 'LINEAR';
