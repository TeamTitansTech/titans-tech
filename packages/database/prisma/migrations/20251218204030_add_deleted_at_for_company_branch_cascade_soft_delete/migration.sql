-- AlterTable
ALTER TABLE "company_branches" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "production_lines" ADD COLUMN     "deletedAt" TIMESTAMP(3);
