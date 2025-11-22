-- AlterTable
ALTER TABLE "machine_service_counterbalance_cylinder_airbag" ADD COLUMN     "notes" TEXT;

-- AlterTable
ALTER TABLE "service_data_counterbalance_cylinder_airbag" DROP COLUMN "notes";
