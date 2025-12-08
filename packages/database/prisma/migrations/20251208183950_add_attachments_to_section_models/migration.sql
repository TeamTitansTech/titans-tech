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
ALTER TABLE "machine_service_slide_double_hammer" ADD COLUMN "attachments" JSONB DEFAULT '[]';

-- AlterTable
ALTER TABLE "machine_service_slide_single_hammer" ADD COLUMN "attachments" JSONB DEFAULT '[]';

-- AlterTable
ALTER TABLE "machine_service_tramming" ADD COLUMN "attachments" JSONB DEFAULT '[]';
