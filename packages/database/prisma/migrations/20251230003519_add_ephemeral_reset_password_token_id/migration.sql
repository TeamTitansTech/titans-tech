/*
  Warnings:

  - You are about to drop the column `isUsingDefaultPassword` on the `sys_admins` table. All the data in the column will be lost.
  - You are about to drop the column `isUsingDefaultPassword` on the `users` table. All the data in the column will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'PASSWORD_ACTIVATION';
ALTER TYPE "NotificationType" ADD VALUE 'PASSWORD_RESET';

-- AlterTable
ALTER TABLE "sys_admins" DROP COLUMN "isUsingDefaultPassword",
ADD COLUMN     "ephemeralResetPasswordTokenId" TEXT;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "isUsingDefaultPassword",
ADD COLUMN     "ephemeralResetPasswordTokenId" TEXT;
