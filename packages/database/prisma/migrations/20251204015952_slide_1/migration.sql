-- AlterEnum
-- Add new enum values for slide types
ALTER TYPE "ServiceSection" ADD VALUE 'SLIDE_SINGLE_HAMMER';
ALTER TYPE "ServiceSection" ADD VALUE 'SLIDE_DOUBLE_HAMMER';

-- CreateTable for ThresholdSlideSingleHammer
CREATE TABLE "threshold_slide_single_hammer" (
    "id" TEXT NOT NULL,
    "blueprintId" TEXT NOT NULL,
    "maxDeviation_greenMin" DECIMAL(10,4) NOT NULL,
    "maxDeviation_yellowMin" DECIMAL(10,4) NOT NULL,
    "maxDeviation_redMin" DECIMAL(10,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "threshold_slide_single_hammer_pkey" PRIMARY KEY ("id")
);

-- CreateTable for ThresholdSlideDoubleHammer
CREATE TABLE "threshold_slide_double_hammer" (
    "id" TEXT NOT NULL,
    "blueprintId" TEXT NOT NULL,
    "maxDeviation_greenMin" DECIMAL(10,4) NOT NULL,
    "maxDeviation_yellowMin" DECIMAL(10,4) NOT NULL,
    "maxDeviation_redMin" DECIMAL(10,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "threshold_slide_double_hammer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex for unique blueprintId on single hammer
CREATE UNIQUE INDEX "threshold_slide_single_hammer_blueprintId_key" ON "threshold_slide_single_hammer"("blueprintId");

-- CreateIndex for unique blueprintId on double hammer
CREATE UNIQUE INDEX "threshold_slide_double_hammer_blueprintId_key" ON "threshold_slide_double_hammer"("blueprintId");

-- AddForeignKey for single hammer
ALTER TABLE "threshold_slide_single_hammer" ADD CONSTRAINT "threshold_slide_single_hammer_blueprintId_fkey" FOREIGN KEY ("blueprintId") REFERENCES "blueprints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey for double hammer
ALTER TABLE "threshold_slide_double_hammer" ADD CONSTRAINT "threshold_slide_double_hammer_blueprintId_fkey" FOREIGN KEY ("blueprintId") REFERENCES "blueprints"("id") ON DELETE CASCADE ON UPDATE CASCADE;
