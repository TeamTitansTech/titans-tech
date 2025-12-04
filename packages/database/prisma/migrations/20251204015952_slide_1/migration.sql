-- AlterEnum
-- This migration adds new slide types and removes the old SLIDE value

-- Add new enum values
ALTER TYPE "ServiceSection" ADD VALUE 'SLIDE_SINGLE_HAMMER';
ALTER TYPE "ServiceSection" ADD VALUE 'SLIDE_DOUBLE_HAMMER';

-- Note: Removing old enum value SLIDE requires data migration first if any records use it
-- For clean databases without production data, the old SLIDE value can be ignored

-- AlterTable - Add sectionType column to threshold_slide
ALTER TABLE "threshold_slide" ADD COLUMN "sectionType" "ServiceSection";

-- Drop the unique constraint on blueprintId alone
ALTER TABLE "threshold_slide" DROP CONSTRAINT IF EXISTS "threshold_slide_blueprintId_key";

-- Add unique constraint on blueprintId + sectionType
CREATE UNIQUE INDEX "threshold_slide_blueprintId_sectionType_key" ON "threshold_slide"("blueprintId", "sectionType");
