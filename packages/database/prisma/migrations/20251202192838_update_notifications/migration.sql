/*
  Warnings:

  - You are about to drop the column `isRead` on the `admin_notifications` table. All the data in the column will be lost.
  - You are about to drop the column `machineId` on the `admin_notifications` table. All the data in the column will be lost.
  - You are about to drop the column `message` on the `admin_notifications` table. All the data in the column will be lost.
  - You are about to drop the `client_notifications` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "admin_notifications" DROP CONSTRAINT "admin_notifications_machineId_fkey";

-- DropForeignKey
ALTER TABLE "client_notifications" DROP CONSTRAINT "client_notifications_machineId_fkey";

-- DropForeignKey
ALTER TABLE "client_notifications" DROP CONSTRAINT "client_notifications_userId_fkey";

-- DropIndex
DROP INDEX "admin_notifications_isRead_idx";

-- AlterTable
ALTER TABLE "admin_notifications" DROP COLUMN "isRead",
DROP COLUMN "machineId",
DROP COLUMN "message";

-- DropTable
DROP TABLE "client_notifications";

-- CreateTable
CREATE TABLE "admin_notification_recipients" (
    "notificationId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_notification_recipients_pkey" PRIMARY KEY ("notificationId","recipientId")
);

-- CreateIndex
CREATE INDEX "admin_notification_recipients_recipientId_isRead_idx" ON "admin_notification_recipients"("recipientId", "isRead");

-- AddForeignKey
ALTER TABLE "admin_notification_recipients" ADD CONSTRAINT "admin_notification_recipients_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "admin_notifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
