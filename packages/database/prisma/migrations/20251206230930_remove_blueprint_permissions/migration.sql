/*
  Warnings:

  - You are about to drop the column `createBlueprints` on the `user_branches` table. All the data in the column will be lost.
  - You are about to drop the column `deleteBlueprints` on the `user_branches` table. All the data in the column will be lost.
  - You are about to drop the column `readBlueprints` on the `user_branches` table. All the data in the column will be lost.
  - You are about to drop the column `updateBlueprints` on the `user_branches` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user_branches" DROP COLUMN "createBlueprints",
DROP COLUMN "deleteBlueprints",
DROP COLUMN "readBlueprints",
DROP COLUMN "updateBlueprints";
