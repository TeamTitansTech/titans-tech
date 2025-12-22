-- AlterTable
ALTER TABLE "companies" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "permission_templates" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "service_data_slide" ALTER COLUMN "position2" DROP NOT NULL,
ALTER COLUMN "position5" DROP NOT NULL;

-- AlterTable
ALTER TABLE "service_data_slide_double_hammer" ALTER COLUMN "position2" DROP NOT NULL,
ALTER COLUMN "position5" DROP NOT NULL;

-- AlterTable
ALTER TABLE "service_data_slide_single_hammer" ALTER COLUMN "position2" DROP NOT NULL,
ALTER COLUMN "position5" DROP NOT NULL;
