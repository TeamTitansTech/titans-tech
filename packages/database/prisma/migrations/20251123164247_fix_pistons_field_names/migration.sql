/*
  Warnings:

  - You are about to drop the column `gauge` on the `lubrication_hydraulics_gauges` table. All the data in the column will be lost.
  - You are about to drop the column `guidSeals` on the `machine_service_pistons` table. All the data in the column will be lost.
  - The `pistonSeals` column on the `machine_service_pistons` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `vacuumSystem` column on the `machine_service_pistons` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `vacuumSystemAirPressureUnit` column on the `machine_service_pistons` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `notes` on the `service_data_lubrication_hydraulics` table. All the data in the column will be lost.
  - You are about to drop the column `oilTemperatureF` on the `service_data_lubrication_hydraulics` table. All the data in the column will be lost.
  - You are about to drop the column `innerLhFrontBottom` on the `service_data_pistons` table. All the data in the column will be lost.
  - You are about to drop the column `innerLhFrontTop` on the `service_data_pistons` table. All the data in the column will be lost.
  - You are about to drop the column `innerRhFrontBottom` on the `service_data_pistons` table. All the data in the column will be lost.
  - You are about to drop the column `innerRhFrontTop` on the `service_data_pistons` table. All the data in the column will be lost.
  - You are about to drop the column `outerLhFrontBottom` on the `service_data_pistons` table. All the data in the column will be lost.
  - You are about to drop the column `outerLhFrontTop` on the `service_data_pistons` table. All the data in the column will be lost.
  - You are about to drop the column `outerRhFrontBottom` on the `service_data_pistons` table. All the data in the column will be lost.
  - You are about to drop the column `outerRhFrontTop` on the `service_data_pistons` table. All the data in the column will be lost.
  - Added the required column `innerLhBottom` to the `service_data_pistons` table without a default value. This is not possible if the table is not empty.
  - Added the required column `innerLhTop` to the `service_data_pistons` table without a default value. This is not possible if the table is not empty.
  - Added the required column `innerRhBottom` to the `service_data_pistons` table without a default value. This is not possible if the table is not empty.
  - Added the required column `innerRhTop` to the `service_data_pistons` table without a default value. This is not possible if the table is not empty.
  - Added the required column `outerLhBottom` to the `service_data_pistons` table without a default value. This is not possible if the table is not empty.
  - Added the required column `outerLhTop` to the `service_data_pistons` table without a default value. This is not possible if the table is not empty.
  - Added the required column `outerRhBottom` to the `service_data_pistons` table without a default value. This is not possible if the table is not empty.
  - Added the required column `outerRhTop` to the `service_data_pistons` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TemperatureUnit" AS ENUM ('FAHRENHEIT', 'CELSIUS');

-- CreateEnum
CREATE TYPE "SealConditionType" AS ENUM ('OK', 'NA', 'DNC', 'LEAKING', 'WORN');

-- CreateEnum
CREATE TYPE "VacuumSystemConditionType" AS ENUM ('OK', 'NA', 'DNC', 'DAMAGED', 'LEAKING');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('URGENT_SERVICE_REQUEST', 'SERVICE_REMINDER', 'SERVICE_OVERDUE', 'SERVICE_COMPLETED');

-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- CreateEnum
CREATE TYPE "EmailProvider" AS ENUM ('SENDGRID', 'AWS_SES');

-- AlterTable
ALTER TABLE "lubrication_hydraulics_gauges" DROP COLUMN "gauge",
ADD COLUMN     "gaugeSwitchIdentifier" TEXT;

-- AlterTable
ALTER TABLE "machine_service_lubrication_hydraulics" ADD COLUMN     "notes" TEXT;

-- AlterTable
ALTER TABLE "machine_service_pistons" DROP COLUMN "guidSeals",
ADD COLUMN     "guideSeals" "SealConditionType",
DROP COLUMN "pistonSeals",
ADD COLUMN     "pistonSeals" "SealConditionType",
DROP COLUMN "vacuumSystem",
ADD COLUMN     "vacuumSystem" "VacuumSystemConditionType",
DROP COLUMN "vacuumSystemAirPressureUnit",
ADD COLUMN     "vacuumSystemAirPressureUnit" "PressureUnit";

-- AlterTable
ALTER TABLE "service_data_lubrication_hydraulics" DROP COLUMN "notes",
DROP COLUMN "oilTemperatureF",
ADD COLUMN     "oilTemperature" INTEGER,
ADD COLUMN     "oilTemperatureUnit" "TemperatureUnit" NOT NULL DEFAULT 'FAHRENHEIT';

-- AlterTable - Rename columns to preserve data
ALTER TABLE "service_data_pistons" RENAME COLUMN "outerLhFrontTop" TO "outerLhTop";
ALTER TABLE "service_data_pistons" RENAME COLUMN "outerLhFrontBottom" TO "outerLhBottom";
ALTER TABLE "service_data_pistons" RENAME COLUMN "outerRhFrontTop" TO "outerRhTop";
ALTER TABLE "service_data_pistons" RENAME COLUMN "outerRhFrontBottom" TO "outerRhBottom";
ALTER TABLE "service_data_pistons" RENAME COLUMN "innerLhFrontTop" TO "innerLhTop";
ALTER TABLE "service_data_pistons" RENAME COLUMN "innerLhFrontBottom" TO "innerLhBottom";
ALTER TABLE "service_data_pistons" RENAME COLUMN "innerRhFrontTop" TO "innerRhTop";
ALTER TABLE "service_data_pistons" RENAME COLUMN "innerRhFrontBottom" TO "innerRhBottom";

-- CreateTable
CREATE TABLE "admin_notifications" (
    "id" TEXT NOT NULL,
    "machineId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "type" "NotificationType" NOT NULL DEFAULT 'URGENT_SERVICE_REQUEST',
    "createdByUserId" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "machineId" TEXT,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "redirectUrl" TEXT,
    "type" "NotificationType" NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emails" (
    "id" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "status" "EmailStatus" NOT NULL DEFAULT 'PENDING',
    "provider" "EmailProvider" NOT NULL,
    "externalId" TEXT,
    "error" TEXT,
    "sentAt" TIMESTAMP(3),
    "machineId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "emails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "admin_notifications_isRead_idx" ON "admin_notifications"("isRead");

-- CreateIndex
CREATE INDEX "admin_notifications_createdAt_idx" ON "admin_notifications"("createdAt");

-- CreateIndex
CREATE INDEX "client_notifications_userId_isRead_idx" ON "client_notifications"("userId", "isRead");

-- CreateIndex
CREATE INDEX "client_notifications_createdAt_idx" ON "client_notifications"("createdAt");

-- CreateIndex
CREATE INDEX "emails_status_idx" ON "emails"("status");

-- CreateIndex
CREATE INDEX "emails_type_idx" ON "emails"("type");

-- CreateIndex
CREATE INDEX "emails_createdAt_idx" ON "emails"("createdAt");

-- AddForeignKey
ALTER TABLE "admin_notifications" ADD CONSTRAINT "admin_notifications_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "machines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_notifications" ADD CONSTRAINT "admin_notifications_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_notifications" ADD CONSTRAINT "client_notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_notifications" ADD CONSTRAINT "client_notifications_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "machines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emails" ADD CONSTRAINT "emails_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "machines"("id") ON DELETE SET NULL ON UPDATE CASCADE;
