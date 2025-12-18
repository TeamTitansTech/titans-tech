/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `companies` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `company_branches` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `machine_services` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `machines` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `permission_templates` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `production_lines` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "companies" DROP COLUMN "deletedAt";

-- AlterTable
ALTER TABLE "company_branches" DROP COLUMN "deletedAt";

-- AlterTable
ALTER TABLE "machine_services" DROP COLUMN "deletedAt";

-- AlterTable
ALTER TABLE "machines" DROP COLUMN "deletedAt";

-- AlterTable
ALTER TABLE "permission_templates" DROP COLUMN "deletedAt";

-- AlterTable
ALTER TABLE "production_lines" DROP COLUMN "deletedAt";
