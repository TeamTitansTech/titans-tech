-- AlterTable
ALTER TABLE "machine_service_angularity" ADD COLUMN     "attachments" JSONB DEFAULT '[]';

-- AlterTable
ALTER TABLE "machine_service_die_cushion" ADD COLUMN     "attachments" JSONB DEFAULT '[]';

-- AlterTable
ALTER TABLE "machine_service_electrical_control" ADD COLUMN     "attachments" JSONB DEFAULT '[]';

-- AlterTable
ALTER TABLE "machine_service_perpendicularity" ADD COLUMN     "attachments" JSONB DEFAULT '[]';

-- AlterTable
ALTER TABLE "machine_service_shim_thickness" ADD COLUMN     "attachments" JSONB DEFAULT '[]';
