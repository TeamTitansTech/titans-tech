-- AlterTable
ALTER TABLE "machine_part_items" ADD COLUMN     "customFields" JSONB;

-- AlterTable
ALTER TABLE "machine_parts_subsections" ADD COLUMN     "columnConfig" JSONB;
