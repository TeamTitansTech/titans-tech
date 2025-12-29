/*
  Warnings:

  - You are about to drop the column `fTB_severity` on the `alert_clutch_cevolani` table. All the data in the column will be lost.
  - You are about to drop the column `fTB_value` on the `alert_clutch_cevolani` table. All the data in the column will be lost.
  - You are about to drop the column `fb_severity` on the `alert_clutch_cevolani` table. All the data in the column will be lost.
  - You are about to drop the column `fb_value` on the `alert_clutch_cevolani` table. All the data in the column will be lost.
  - You are about to drop the column `hydClutchClearanceRear_severity` on the `alert_clutch_cevolani` table. All the data in the column will be lost.
  - You are about to drop the column `hydClutchClearanceRear_value` on the `alert_clutch_cevolani` table. All the data in the column will be lost.
  - You are about to drop the column `hydClutchClearanceTotal_severity` on the `alert_clutch_cevolani` table. All the data in the column will be lost.
  - You are about to drop the column `hydClutchClearanceTotal_value` on the `alert_clutch_cevolani` table. All the data in the column will be lost.
  - You are about to drop the column `rTB_severity` on the `alert_clutch_cevolani` table. All the data in the column will be lost.
  - You are about to drop the column `rTB_value` on the `alert_clutch_cevolani` table. All the data in the column will be lost.
  - You are about to drop the column `fTB_greenMin` on the `threshold_clutch_cevolani` table. All the data in the column will be lost.
  - You are about to drop the column `fTB_redMin` on the `threshold_clutch_cevolani` table. All the data in the column will be lost.
  - You are about to drop the column `fTB_yellowMin` on the `threshold_clutch_cevolani` table. All the data in the column will be lost.
  - You are about to drop the column `fb_greenMin` on the `threshold_clutch_cevolani` table. All the data in the column will be lost.
  - You are about to drop the column `fb_redMin` on the `threshold_clutch_cevolani` table. All the data in the column will be lost.
  - You are about to drop the column `fb_yellowMin` on the `threshold_clutch_cevolani` table. All the data in the column will be lost.
  - You are about to drop the column `hydClutchClearanceRear_greenMin` on the `threshold_clutch_cevolani` table. All the data in the column will be lost.
  - You are about to drop the column `hydClutchClearanceRear_redMin` on the `threshold_clutch_cevolani` table. All the data in the column will be lost.
  - You are about to drop the column `hydClutchClearanceRear_yellowMin` on the `threshold_clutch_cevolani` table. All the data in the column will be lost.
  - You are about to drop the column `hydClutchClearanceTotal_greenMin` on the `threshold_clutch_cevolani` table. All the data in the column will be lost.
  - You are about to drop the column `hydClutchClearanceTotal_redMin` on the `threshold_clutch_cevolani` table. All the data in the column will be lost.
  - You are about to drop the column `hydClutchClearanceTotal_yellowMin` on the `threshold_clutch_cevolani` table. All the data in the column will be lost.
  - You are about to drop the column `rTB_greenMin` on the `threshold_clutch_cevolani` table. All the data in the column will be lost.
  - You are about to drop the column `rTB_redMin` on the `threshold_clutch_cevolani` table. All the data in the column will be lost.
  - You are about to drop the column `rTB_yellowMin` on the `threshold_clutch_cevolani` table. All the data in the column will be lost.
  - Added the required column `pneumaticClutchClearanceTotal_severity` to the `alert_clutch_cevolani` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pneumaticClutchClearanceTotal_value` to the `alert_clutch_cevolani` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pneumaticClutchClearanceTotal_greenMin` to the `threshold_clutch_cevolani` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pneumaticClutchClearanceTotal_redMin` to the `threshold_clutch_cevolani` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pneumaticClutchClearanceTotal_yellowMin` to the `threshold_clutch_cevolani` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "alert_clutch_cevolani" DROP COLUMN "fTB_severity",
DROP COLUMN "fTB_value",
DROP COLUMN "fb_severity",
DROP COLUMN "fb_value",
DROP COLUMN "hydClutchClearanceRear_severity",
DROP COLUMN "hydClutchClearanceRear_value",
DROP COLUMN "hydClutchClearanceTotal_severity",
DROP COLUMN "hydClutchClearanceTotal_value",
DROP COLUMN "rTB_severity",
DROP COLUMN "rTB_value",
ADD COLUMN     "pneumaticClutchClearanceTotal_severity" "AlertSeverity" NOT NULL,
ADD COLUMN     "pneumaticClutchClearanceTotal_value" DECIMAL(10,4) NOT NULL;

-- AlterTable
ALTER TABLE "service_data_clutch" ADD COLUMN     "pneumaticClutchClearanceTotal" DECIMAL(10,4);

-- AlterTable
ALTER TABLE "threshold_clutch_cevolani" DROP COLUMN "fTB_greenMin",
DROP COLUMN "fTB_redMin",
DROP COLUMN "fTB_yellowMin",
DROP COLUMN "fb_greenMin",
DROP COLUMN "fb_redMin",
DROP COLUMN "fb_yellowMin",
DROP COLUMN "hydClutchClearanceRear_greenMin",
DROP COLUMN "hydClutchClearanceRear_redMin",
DROP COLUMN "hydClutchClearanceRear_yellowMin",
DROP COLUMN "hydClutchClearanceTotal_greenMin",
DROP COLUMN "hydClutchClearanceTotal_redMin",
DROP COLUMN "hydClutchClearanceTotal_yellowMin",
DROP COLUMN "rTB_greenMin",
DROP COLUMN "rTB_redMin",
DROP COLUMN "rTB_yellowMin",
ADD COLUMN     "pneumaticClutchClearanceTotal_greenMin" DECIMAL(10,4) NOT NULL,
ADD COLUMN     "pneumaticClutchClearanceTotal_redMin" DECIMAL(10,4) NOT NULL,
ADD COLUMN     "pneumaticClutchClearanceTotal_yellowMin" DECIMAL(10,4) NOT NULL;
