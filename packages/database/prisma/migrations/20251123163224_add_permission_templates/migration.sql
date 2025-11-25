/*
  Warnings:

  - You are about to drop the column `model` on the `machines` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "machines" DROP COLUMN "model";

-- CreateTable
CREATE TABLE "permission_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "permissions" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "permission_templates_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "permission_templates" ADD CONSTRAINT "permission_templates_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
