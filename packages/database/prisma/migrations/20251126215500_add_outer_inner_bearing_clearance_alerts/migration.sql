-- AlterTable: Restructure alert_bearing_clearance to have separate outer and inner alerts
-- Drop old columns (without outer_/inner_ prefix)
ALTER TABLE "alert_bearing_clearance" DROP COLUMN "totalClearance_differential";
ALTER TABLE "alert_bearing_clearance" DROP COLUMN "totalClearance_severity";
ALTER TABLE "alert_bearing_clearance" DROP COLUMN "mainBearings_differential";
ALTER TABLE "alert_bearing_clearance" DROP COLUMN "mainBearings_severity";
ALTER TABLE "alert_bearing_clearance" DROP COLUMN "upperConnectionBearings_differential";
ALTER TABLE "alert_bearing_clearance" DROP COLUMN "upperConnectionBearings_severity";
ALTER TABLE "alert_bearing_clearance" DROP COLUMN "wristPinToMatingPart_differential";
ALTER TABLE "alert_bearing_clearance" DROP COLUMN "wristPinToMatingPart_severity";
ALTER TABLE "alert_bearing_clearance" DROP COLUMN "wristPinToBushing_differential";
ALTER TABLE "alert_bearing_clearance" DROP COLUMN "wristPinToBushing_severity";
ALTER TABLE "alert_bearing_clearance" DROP COLUMN "slideAdjNutToScrewSleeve_differential";
ALTER TABLE "alert_bearing_clearance" DROP COLUMN "slideAdjNutToScrewSleeve_severity";

-- Add OUTER alert columns
ALTER TABLE "alert_bearing_clearance" ADD COLUMN "outer_totalClearance_differential" DECIMAL(10,4) NOT NULL;
ALTER TABLE "alert_bearing_clearance" ADD COLUMN "outer_totalClearance_severity" "AlertSeverity" NOT NULL;
ALTER TABLE "alert_bearing_clearance" ADD COLUMN "outer_mainBearings_differential" DECIMAL(10,4) NOT NULL;
ALTER TABLE "alert_bearing_clearance" ADD COLUMN "outer_mainBearings_severity" "AlertSeverity" NOT NULL;
ALTER TABLE "alert_bearing_clearance" ADD COLUMN "outer_upperConnectionBearings_differential" DECIMAL(10,4) NOT NULL;
ALTER TABLE "alert_bearing_clearance" ADD COLUMN "outer_upperConnectionBearings_severity" "AlertSeverity" NOT NULL;
ALTER TABLE "alert_bearing_clearance" ADD COLUMN "outer_wristPinToMatingPart_differential" DECIMAL(10,4) NOT NULL;
ALTER TABLE "alert_bearing_clearance" ADD COLUMN "outer_wristPinToMatingPart_severity" "AlertSeverity" NOT NULL;
ALTER TABLE "alert_bearing_clearance" ADD COLUMN "outer_wristPinToBushing_differential" DECIMAL(10,4) NOT NULL;
ALTER TABLE "alert_bearing_clearance" ADD COLUMN "outer_wristPinToBushing_severity" "AlertSeverity" NOT NULL;
ALTER TABLE "alert_bearing_clearance" ADD COLUMN "outer_slideAdjNutToScrewSleeve_differential" DECIMAL(10,4) NOT NULL;
ALTER TABLE "alert_bearing_clearance" ADD COLUMN "outer_slideAdjNutToScrewSleeve_severity" "AlertSeverity" NOT NULL;

-- Add INNER alert columns
ALTER TABLE "alert_bearing_clearance" ADD COLUMN "inner_totalClearance_differential" DECIMAL(10,4) NOT NULL;
ALTER TABLE "alert_bearing_clearance" ADD COLUMN "inner_totalClearance_severity" "AlertSeverity" NOT NULL;
ALTER TABLE "alert_bearing_clearance" ADD COLUMN "inner_mainBearings_differential" DECIMAL(10,4) NOT NULL;
ALTER TABLE "alert_bearing_clearance" ADD COLUMN "inner_mainBearings_severity" "AlertSeverity" NOT NULL;
ALTER TABLE "alert_bearing_clearance" ADD COLUMN "inner_upperConnectionBearings_differential" DECIMAL(10,4) NOT NULL;
ALTER TABLE "alert_bearing_clearance" ADD COLUMN "inner_upperConnectionBearings_severity" "AlertSeverity" NOT NULL;
ALTER TABLE "alert_bearing_clearance" ADD COLUMN "inner_wristPinToMatingPart_differential" DECIMAL(10,4) NOT NULL;
ALTER TABLE "alert_bearing_clearance" ADD COLUMN "inner_wristPinToMatingPart_severity" "AlertSeverity" NOT NULL;
ALTER TABLE "alert_bearing_clearance" ADD COLUMN "inner_wristPinToBushing_differential" DECIMAL(10,4) NOT NULL;
ALTER TABLE "alert_bearing_clearance" ADD COLUMN "inner_wristPinToBushing_severity" "AlertSeverity" NOT NULL;
ALTER TABLE "alert_bearing_clearance" ADD COLUMN "inner_slideAdjNutToScrewSleeve_differential" DECIMAL(10,4) NOT NULL;
ALTER TABLE "alert_bearing_clearance" ADD COLUMN "inner_slideAdjNutToScrewSleeve_severity" "AlertSeverity" NOT NULL;
