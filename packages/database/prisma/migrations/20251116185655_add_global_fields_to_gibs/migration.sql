/*
  Warnings:

  - You are about to drop the column `hasBeenAdjusted` on the `service_data_gibs` table. All the data in the column will be lost.
  - You are about to drop the column `usable` on the `service_data_gibs` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "machine_service_gibs" ADD COLUMN     "hasBeenAdjusted" "YesNoDncType",
ADD COLUMN     "notes" TEXT;

-- AlterTable
ALTER TABLE "service_data_gibs" DROP COLUMN "hasBeenAdjusted",
DROP COLUMN "usable";
