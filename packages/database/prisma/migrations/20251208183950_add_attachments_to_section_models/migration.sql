-- AlterTable
ALTER TABLE "machine_service_bearing_clearance" ADD COLUMN "attachments" JSONB DEFAULT '[]';

-- AlterTable
ALTER TABLE "machine_service_clutch" ADD COLUMN "attachments" JSONB DEFAULT '[]';

-- AlterTable
ALTER TABLE "machine_service_counterbalance_cylinder_airbag" ADD COLUMN "attachments" JSONB DEFAULT '[]';

-- AlterTable
ALTER TABLE "machine_service_gibs" ADD COLUMN "attachments" JSONB DEFAULT '[]';

-- AlterTable
ALTER TABLE "machine_service_lubrication_hydraulics" ADD COLUMN "attachments" JSONB DEFAULT '[]';

-- AlterTable
ALTER TABLE "machine_service_pistons" ADD COLUMN "attachments" JSONB DEFAULT '[]';

-- AlterTable
ALTER TABLE "machine_service_tramming" ADD COLUMN "attachments" JSONB DEFAULT '[]';

-- Note: slide_single_hammer and slide_double_hammer tables are created with attachments column
-- in migration 20251209195219_add_slide_hammer_data_tables
