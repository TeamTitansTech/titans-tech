-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('INSPECTION', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "ServiceStatus" AS ENUM ('PENDING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "MatingPartType" AS ENUM ('BUSHING', 'CONNECTION', 'NUT_SCREW_SLEEVE');

-- CreateEnum
CREATE TYPE "ParallelismType" AS ENUM ('DNC', 'TO_BED', 'TO_BOLSTER');

-- CreateEnum
CREATE TYPE "DncToBedToBolsterType" AS ENUM ('DNC', 'TO_BED', 'TO_BOLSTER');

-- CreateEnum
CREATE TYPE "YesNoNaDncType" AS ENUM ('YES', 'NO', 'NA', 'DNC');

-- CreateEnum
CREATE TYPE "YesNoDncType" AS ENUM ('YES', 'NO', 'DNC');

-- CreateEnum
CREATE TYPE "LubeHydMonitorFlowPressSwGibType" AS ENUM ('LUBE', 'HYD', 'MONITORFLOW', 'PRESS_SW', 'GIB');

-- CreateEnum
CREATE TYPE "ConditionOkNaDncBrokenWornType" AS ENUM ('OK', 'NA', 'DNC', 'BROKEN', 'WORN');

-- CreateEnum
CREATE TYPE "ConditionOkNaDncBrokenLooseType" AS ENUM ('OK', 'NA', 'DNC', 'BROKEN', 'LOOSE');

-- CreateEnum
CREATE TYPE "ConditionOkNaDncDamagedType" AS ENUM ('OK', 'NA', 'DNC', 'DAMAGED');

-- CreateEnum
CREATE TYPE "SystemType" AS ENUM ('LUBE', 'HYD', 'MONITORFLOW', 'PRESS_SW', 'GIB');

-- CreateEnum
CREATE TYPE "OkNaDncDamageType" AS ENUM ('OK', 'NA', 'DNC');

-- CreateEnum
CREATE TYPE "MeasurementUnit" AS ENUM ('INCHES', 'MM');

-- CreateEnum
CREATE TYPE "CylinderAirbagType" AS ENUM ('CYLINDER', 'AIRBAG');

-- CreateEnum
CREATE TYPE "OkNaDncLeakingType" AS ENUM ('OK', 'NA', 'DNC', 'LEAKING');

-- CreateEnum
CREATE TYPE "OkNaDncNotOperationalType" AS ENUM ('OK', 'NA', 'DNC', 'NOT_OPERATIONAL');

-- CreateEnum
CREATE TYPE "OkNaDncNotOperationalLeakingType" AS ENUM ('OK', 'NA', 'DNC', 'NOT_OPERATIONAL', 'LEAKING');

-- CreateEnum
CREATE TYPE "OkNaDncDarkOilType" AS ENUM ('OK', 'NA', 'DNC', 'DARK_OIL');

-- CreateEnum
CREATE TYPE "OkNaDncNeedReplacedType" AS ENUM ('OK', 'NA', 'DNC', 'NEEDS_REPLACED');

-- CreateEnum
CREATE TYPE "ClutchType" AS ENUM ('AFC', 'CFC', 'EFHC', 'GC', 'HC', 'MC', 'MDHC', 'MHC', 'MHCC');

-- CreateEnum
CREATE TYPE "ClutchLocation" AS ENUM ('CRANKSHAFT', 'DRIVESHAFT');

-- CreateEnum
CREATE TYPE "BrakeSpringStudBoltType" AS ENUM ('OK', 'NA', 'DNC', 'BROKEN', 'BENT_WORN');

-- CreateEnum
CREATE TYPE "BrakeLiningType" AS ENUM ('OK', 'NA', 'DNC', 'GLAZED', 'OIL_SOAKED', 'MISSING_SEGMENTS');

-- CreateEnum
CREATE TYPE "FlywheelBearingsType" AS ENUM ('OK', 'NA', 'DNC', 'NOISE', 'WOBBLE');

-- CreateEnum
CREATE TYPE "FlywheelBrakeType" AS ENUM ('OK', 'NA', 'DNC', 'LINING_WORN');

-- CreateEnum
CREATE TYPE "RotaryUnionType" AS ENUM ('OK', 'NA', 'DNC', 'AIR_LEAK', 'OIL_LEAK', 'CONCENTRICITY');

-- CreateEnum
CREATE TYPE "ClutchLiningType" AS ENUM ('OK', 'NA', 'DNC', 'GLAZED', 'OIL_SOAKED', 'MISSING_SEGMENTS');

-- CreateEnum
CREATE TYPE "ClutchSealsType" AS ENUM ('OK', 'NA', 'DNC', 'LEAKING', 'SLOW_RESPONSE');

-- CreateEnum
CREATE TYPE "PressureUnit" AS ENUM ('BAR', 'MPA', 'PSI');

-- CreateEnum
CREATE TYPE "SplinesConditionType" AS ENUM ('OK', 'NA', 'DNC', 'BROKEN', 'NOT_VISIBLE', 'WEAR_VISIBLE');

-- CreateEnum
CREATE TYPE "AdjustingNutLockType" AS ENUM ('OK', 'NA', 'DNC');

-- CreateEnum
CREATE TYPE "AirLineOilerSettingType" AS ENUM ('OK', 'NA', 'DNC', 'NEEDS_OIL', 'NEEDS_OIL_RESET', 'NEEDS_RESET');

-- CreateEnum
CREATE TYPE "SeparateBrakeSealsType" AS ENUM ('OK', 'NA', 'DNC', 'LEAKING');

-- CreateEnum
CREATE TYPE "FlexDiscType" AS ENUM ('OK', 'NA', 'DNC', 'BUCKLED', 'CRACKED');

-- CreateEnum
<<<<<<<< HEAD:packages/database/prisma/migrations/20251117170212_init/migration.sql
CREATE TYPE "ServiceSection" AS ENUM ('BEARING_CLEARANCE', 'SLIDE', 'GIBS', 'LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER', 'CLUTCH', 'COUNTERBALANCE_CYLINDER_AIRBAG');
========
CREATE TYPE "FoundationType" AS ENUM ('PLANT_FLOOR', 'ISOLATED_PAD');

-- CreateEnum
CREATE TYPE "FrameType" AS ENUM ('GAP', 'STRAIGHT_SIDE');

-- CreateEnum
CREATE TYPE "MachineClutchType" AS ENUM ('JH5', 'NA');

-- CreateEnum
CREATE TYPE "PneumaticSystemType" AS ENUM ('AIR', 'HYD', 'WET_AIR', 'WET_HYD');

-- CreateEnum
CREATE TYPE "PressMountingType" AS ENUM ('ADJUSTABLE', 'ON_FLOOR', 'SHIMS', 'OTHER');

-- CreateEnum
CREATE TYPE "MachineFeaturesType" AS ENUM ('AIM', 'ADJ_STROKE', 'DOUBLE_LOCKUP', 'NA');

-- CreateEnum
CREATE TYPE "DriveBeltConditionType" AS ENUM ('OK', 'NA', 'LOOSENED', 'TIGHTENED', 'WORN');

-- CreateEnum
CREATE TYPE "ProtectiveCoversStatusType" AS ENUM ('YES', 'NO', 'OK');

-- CreateEnum
CREATE TYPE "ServiceSection" AS ENUM ('BEARING_CLEARANCE', 'SLIDE', 'GIBS', 'LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER', 'CLUTCH', 'COUNTERBALANCE_CYLINDER_AIRBAG', 'TRAMMING', 'PISTONS');
>>>>>>>> main:packages/database/prisma/migrations/20251118175400_initial_setup/migration.sql

-- CreateEnum
CREATE TYPE "AlertSeverity" AS ENUM ('GREEN', 'YELLOW', 'RED', 'NONE');

-- CreateTable
CREATE TABLE "sys_admins" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "isUsingDefaultPassword" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sys_admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo" TEXT,
    "brandColor" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_branches" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isMainBranch" BOOLEAN NOT NULL DEFAULT false,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "company_branches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "isCompanyAdmin" BOOLEAN NOT NULL DEFAULT false,
    "isCompanyManager" BOOLEAN NOT NULL DEFAULT false,
    "isUsingDefaultPassword" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_branches" (
    "userId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "readUsers" BOOLEAN NOT NULL DEFAULT false,
    "createUsers" BOOLEAN NOT NULL DEFAULT false,
    "updateUsers" BOOLEAN NOT NULL DEFAULT false,
    "deleteUsers" BOOLEAN NOT NULL DEFAULT false,
    "manageUserPermissions" BOOLEAN NOT NULL DEFAULT false,
    "assignUsersToBranches" BOOLEAN NOT NULL DEFAULT false,
    "readBranches" BOOLEAN NOT NULL DEFAULT false,
    "updateBranches" BOOLEAN NOT NULL DEFAULT false,
    "readBlueprints" BOOLEAN NOT NULL DEFAULT false,
    "createBlueprints" BOOLEAN NOT NULL DEFAULT false,
    "updateBlueprints" BOOLEAN NOT NULL DEFAULT false,
    "deleteBlueprints" BOOLEAN NOT NULL DEFAULT false,
    "readMachines" BOOLEAN NOT NULL DEFAULT false,
    "createMachines" BOOLEAN NOT NULL DEFAULT false,
    "updateMachines" BOOLEAN NOT NULL DEFAULT false,
    "deleteMachines" BOOLEAN NOT NULL DEFAULT false,
    "readServices" BOOLEAN NOT NULL DEFAULT false,
    "createServices" BOOLEAN NOT NULL DEFAULT false,
    "updateServices" BOOLEAN NOT NULL DEFAULT false,
    "deleteServices" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_branches_pkey" PRIMARY KEY ("userId","branchId")
);

-- CreateTable
CREATE TABLE "blueprints" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fields" JSONB NOT NULL,
    "sections" "ServiceSection"[],
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blueprints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "threshold_bearing_clearance" (
    "id" TEXT NOT NULL,
    "blueprintId" TEXT NOT NULL,
    "totalClearance_greenMin" DECIMAL(10,4) NOT NULL,
    "totalClearance_yellowMin" DECIMAL(10,4) NOT NULL,
    "totalClearance_redMin" DECIMAL(10,4) NOT NULL,
    "mainBearings_greenMin" DECIMAL(10,4) NOT NULL,
    "mainBearings_yellowMin" DECIMAL(10,4) NOT NULL,
    "mainBearings_redMin" DECIMAL(10,4) NOT NULL,
    "upperConnectionBearings_greenMin" DECIMAL(10,4) NOT NULL,
    "upperConnectionBearings_yellowMin" DECIMAL(10,4) NOT NULL,
    "upperConnectionBearings_redMin" DECIMAL(10,4) NOT NULL,
    "wristPinToMatingPart_greenMin" DECIMAL(10,4) NOT NULL,
    "wristPinToMatingPart_yellowMin" DECIMAL(10,4) NOT NULL,
    "wristPinToMatingPart_redMin" DECIMAL(10,4) NOT NULL,
    "wristPinToBushing_greenMin" DECIMAL(10,4) NOT NULL,
    "wristPinToBushing_yellowMin" DECIMAL(10,4) NOT NULL,
    "wristPinToBushing_redMin" DECIMAL(10,4) NOT NULL,
    "slideAdjNutToScrewSleeve_greenMin" DECIMAL(10,4) NOT NULL,
    "slideAdjNutToScrewSleeve_yellowMin" DECIMAL(10,4) NOT NULL,
    "slideAdjNutToScrewSleeve_redMin" DECIMAL(10,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "threshold_bearing_clearance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "machines" (
    "id" TEXT NOT NULL,
    "blueprintId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "manufacturer" TEXT,
    "model" TEXT,
    "sizeTonnage" TEXT,
    "serialNumber" TEXT,
    "stroke" TEXT,
    "foundationType" "FoundationType",
    "frameType" "FrameType",
    "clutchType" "MachineClutchType",
    "pneumaticSystem" "PneumaticSystemType",
    "pressMounting" "PressMountingType",
    "features" "MachineFeaturesType",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "machines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "machine_fields" (
    "id" TEXT NOT NULL,
    "machineId" TEXT NOT NULL,
    "fieldSlug" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "machine_fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "machine_services" (
    "id" TEXT NOT NULL,
    "machineId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" "ServiceType" NOT NULL DEFAULT 'INSPECTION',
    "status" "ServiceStatus" NOT NULL DEFAULT 'PENDING',
    "performedBy" TEXT,
    "completedSections" JSONB DEFAULT '[]',
    "lastSectionSavedAt" TIMESTAMP(3),
    "currentStep" TEXT,
    "currentSectionKey" TEXT,
    "selectedSections" JSONB DEFAULT '[]',
    "isPressLevel" "YesNoNaDncType",
    "driveBeltCondition" "DriveBeltConditionType",
    "areAllProtectiveCovers" "ProtectiveCoversStatusType",
    "protectiveCoversExplanation" TEXT,
    "areCracksVisible" "YesNoDncType",
    "cracksLocation" TEXT,
    "isMainMotorSecure" "YesNoDncType",
    "isMotorPlateSecure" "YesNoDncType",
    "whyNotCovered" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "machine_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alert_bearing_clearance" (
    "id" TEXT NOT NULL,
    "machineServiceId" TEXT NOT NULL,
    "totalClearance_differential" DECIMAL(10,4) NOT NULL,
    "totalClearance_severity" "AlertSeverity" NOT NULL,
    "mainBearings_differential" DECIMAL(10,4) NOT NULL,
    "mainBearings_severity" "AlertSeverity" NOT NULL,
    "upperConnectionBearings_differential" DECIMAL(10,4) NOT NULL,
    "upperConnectionBearings_severity" "AlertSeverity" NOT NULL,
    "wristPinToMatingPart_differential" DECIMAL(10,4) NOT NULL,
    "wristPinToMatingPart_severity" "AlertSeverity" NOT NULL,
    "wristPinToBushing_differential" DECIMAL(10,4) NOT NULL,
    "wristPinToBushing_severity" "AlertSeverity" NOT NULL,
    "slideAdjNutToScrewSleeve_differential" DECIMAL(10,4) NOT NULL,
    "slideAdjNutToScrewSleeve_severity" "AlertSeverity" NOT NULL,
    "thresholdSnapshot" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alert_bearing_clearance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "machine_service_bearing_clearance" (
    "id" TEXT NOT NULL,
    "machineServiceId" TEXT NOT NULL,
    "outerBeforeId" TEXT,
    "outerDataId" TEXT,
    "innerBeforeId" TEXT,
    "innerDataId" TEXT,

    CONSTRAINT "machine_service_bearing_clearance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_data_bearing_clearance" (
    "id" TEXT NOT NULL,
    "totalClearance_RH" DECIMAL(10,4) NOT NULL,
    "totalClearance_LH" DECIMAL(10,4) NOT NULL,
    "mainBearings_RH" DECIMAL(10,4) NOT NULL,
    "mainBearings_LH" DECIMAL(10,4) NOT NULL,
    "upperConnectionBearings_RH" DECIMAL(10,4) NOT NULL,
    "upperConnectionBearings_LH" DECIMAL(10,4) NOT NULL,
    "wristPinToMatingPart_RH" DECIMAL(10,4) NOT NULL,
    "wristPinToMatingPart_LH" DECIMAL(10,4) NOT NULL,
    "wristPinToBushing_RH" DECIMAL(10,4) NOT NULL,
    "wristPinToBushing_LH" DECIMAL(10,4) NOT NULL,
    "slideAdjNutToScrewSleeve_RH" DECIMAL(10,4) NOT NULL,
    "slideAdjNutToScrewSleeve_LH" DECIMAL(10,4) NOT NULL,
    "extraDoubleLockOpen_RH" DECIMAL(10,4) NOT NULL,
    "extraDoubleLockOpen_LH" DECIMAL(10,4) NOT NULL,
    "ballBoxArea_RH" DECIMAL(10,4) NOT NULL,
    "ballBoxArea_LH" DECIMAL(10,4) NOT NULL,
    "hasBeenAdjusted" "YesNoNaDncType",
    "combinedWith" TEXT,
    "matingPart" "MatingPartType",
    "slideMotorMounts" "ConditionOkNaDncBrokenWornType",
    "powerCordHoses" "ConditionOkNaDncDamagedType",
    "chainsGearsSprockets" "ConditionOkNaDncBrokenLooseType",
    "lockingClamps" "ConditionOkNaDncDamagedType",
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_data_bearing_clearance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "machine_service_slide" (
    "id" TEXT NOT NULL,
    "machineServiceId" TEXT NOT NULL,
    "outerBeforeId" TEXT,
    "outerDataId" TEXT,
    "innerBeforeId" TEXT,
    "innerDataId" TEXT,
    "outerParallelism" "ParallelismType",
    "outerHasParallelismBeenAdjusted" "YesNoNaDncType",
    "innerParallelism" "ParallelismType",
    "innerHasParallelismBeenAdjusted" "YesNoNaDncType",
    "outerShutheightIndicatorsChecked" "YesNoDncType",
    "outerOverloadsOnTonnageMonitor" TEXT,
    "outerShutheightActualSh" TEXT,
    "outerIndicatorReading" TEXT,
    "innerShutheightIndicatorsChecked" "YesNoDncType",
    "innerOverloadsOnTonnageMonitor" TEXT,
    "innerShutheightActualSh" TEXT,
    "innerIndicatorReading" TEXT,
    "notes" TEXT,

    CONSTRAINT "machine_service_slide_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_data_slide" (
    "id" TEXT NOT NULL,
    "position1" DECIMAL(10,4) NOT NULL,
    "position2" DECIMAL(10,4) NOT NULL,
    "position3" DECIMAL(10,4) NOT NULL,
    "position4" DECIMAL(10,4) NOT NULL,
    "position5" DECIMAL(10,4) NOT NULL,
    "position6" DECIMAL(10,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_data_slide_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "machine_service_gibs" (
    "id" TEXT NOT NULL,
    "machineServiceId" TEXT NOT NULL,
    "outerBeforeId" TEXT,
    "outerDataId" TEXT,
    "innerBeforeId" TEXT,
    "innerDataId" TEXT,

    CONSTRAINT "machine_service_gibs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_data_gibs" (
    "id" TEXT NOT NULL,
    "hasBeenAdjusted" "YesNoDncType",
    "point1" DECIMAL(10,4) NOT NULL,
    "point2" DECIMAL(10,4) NOT NULL,
    "point3" DECIMAL(10,4) NOT NULL,
    "point4" DECIMAL(10,4) NOT NULL,
    "point5" DECIMAL(10,4) NOT NULL,
    "point6" DECIMAL(10,4) NOT NULL,
    "point7" DECIMAL(10,4) NOT NULL,
    "point8" DECIMAL(10,4) NOT NULL,
    "point9" DECIMAL(10,4) NOT NULL,
    "point10" DECIMAL(10,4) NOT NULL,
    "point11" DECIMAL(10,4) NOT NULL,
    "point12" DECIMAL(10,4) NOT NULL,
    "point13" DECIMAL(10,4) NOT NULL,
    "point14" DECIMAL(10,4) NOT NULL,
    "point15" DECIMAL(10,4) NOT NULL,
    "point16" DECIMAL(10,4) NOT NULL,
    "leftTop" DECIMAL(10,4),
    "leftBottom" DECIMAL(10,4),
    "rightTop" DECIMAL(10,4),
    "rightBottom" DECIMAL(10,4),
    "frontTop" DECIMAL(10,4),
    "frontBottom" DECIMAL(10,4),
    "backTop" DECIMAL(10,4),
    "backBottom" DECIMAL(10,4),
    "usable" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_data_gibs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "machine_service_lubrication_hydraulics" (
    "id" TEXT NOT NULL,
    "machineServiceId" TEXT NOT NULL,
    "dataId" TEXT,

    CONSTRAINT "machine_service_lubrication_hydraulics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_data_lubrication_hydraulics" (
    "id" TEXT NOT NULL,
    "changedOil" "YesNoDncType" NOT NULL DEFAULT 'DNC',
    "oilTemperatureF" INTEGER,
    "oilMfgType" TEXT,
    "changedFilter" "YesNoDncType" NOT NULL DEFAULT 'DNC',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_data_lubrication_hydraulics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lubrication_hydraulics_gauges" (
    "id" TEXT NOT NULL,
    "lubricationHydraulicsDataId" TEXT NOT NULL,
    "system" "LubeHydMonitorFlowPressSwGibType" NOT NULL,
    "gauge" TEXT,
    "psi" "OkNaDncDamageType",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lubrication_hydraulics_gauges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "machine_service_clutch" (
    "id" TEXT NOT NULL,
    "machineServiceId" TEXT NOT NULL,
    "dataId" TEXT,

    CONSTRAINT "machine_service_clutch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_data_clutch" (
    "id" TEXT NOT NULL,
    "clutchType" "ClutchType",
    "clutchLocation" "ClutchLocation",
    "brakeSpringBrake" DECIMAL(10,4),
    "brakeSpringClutch" DECIMAL(10,4),
    "brakeSpringFB" DECIMAL(10,4),
    "brakeSpringFTB" DECIMAL(10,4),
    "brakeSpringRTB" DECIMAL(10,4),
    "brakeSpringStudBolt" "BrakeSpringStudBoltType",
    "brakeStoppingTime" DECIMAL(10,2),
    "brakeLining" "BrakeLiningType",
    "brakeClearing" DECIMAL(10,4),
    "brakeClearanceTotal" DECIMAL(10,4),
    "brakeClearanceRear" DECIMAL(10,4),
    "flywheelStoppingTime" DECIMAL(10,2),
    "flywheelBearings" "FlywheelBearingsType",
    "flywheelBrake" "FlywheelBrakeType",
    "rotaryUnion" "RotaryUnionType",
    "clutchEngagements" INTEGER,
    "clutchLining" "ClutchLiningType",
    "clutchSeals" "ClutchSealsType",
    "gearBacklashBefore" DECIMAL(10,4),
    "gearBacklashAfter" DECIMAL(10,4),
    "crankEndplayBefore" DECIMAL(10,4),
    "crankEndplayAfter" DECIMAL(10,4),
    "airRegulatorValue" DECIMAL(10,2),
    "airRegulatorUnit" "PressureUnit",
    "airClutchTravel" DECIMAL(10,4),
    "airLineOilerSetting" "AirLineOilerSettingType",
    "splinesDriveRingDisc" "SplinesConditionType",
    "adjustingNutLockSecure" "AdjustingNutLockType",
    "hydClutchClearanceTotal" DECIMAL(10,4),
    "hydClutchClearanceRear" DECIMAL(10,4),
    "hydraulicPressureValue" DECIMAL(10,2),
    "hydraulicPressureUnit" "PressureUnit",
    "accumulatorValue" DECIMAL(10,2),
    "accumulatorUnit" "PressureUnit",
    "separateBrakeSeals" "SeparateBrakeSealsType",
    "flexDisc" "FlexDiscType",
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_data_clutch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "machine_service_counterbalance_cylinder_airbag" (
    "id" TEXT NOT NULL,
    "machineServiceId" TEXT NOT NULL,
    "outerDataId" TEXT,
    "innerDataId" TEXT,

    CONSTRAINT "machine_service_counterbalance_cylinder_airbag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_data_counterbalance_cylinder_airbag" (
    "id" TEXT NOT NULL,
    "counterbalanceType" "CylinderAirbagType",
    "airbagPistonSeals" "OkNaDncLeakingType",
    "airbagPistonSealsLeakLocation" TEXT,
    "regulator" "OkNaDncNotOperationalType",
    "gauge" "OkNaDncNotOperationalType",
    "pneumaticsPlumbing" "OkNaDncNotOperationalLeakingType",
    "rodSeals" "OkNaDncLeakingType",
    "rodBushing" "OkNaDncDarkOilType",
    "oilWick" "OkNaDncNeedReplacedType",
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_data_counterbalance_cylinder_airbag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sys_admins_email_key" ON "sys_admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "companies_slug_key" ON "companies"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "threshold_bearing_clearance_blueprintId_key" ON "threshold_bearing_clearance"("blueprintId");

-- CreateIndex
CREATE UNIQUE INDEX "machine_fields_machineId_fieldSlug_key" ON "machine_fields"("machineId", "fieldSlug");

-- CreateIndex
CREATE UNIQUE INDEX "alert_bearing_clearance_machineServiceId_key" ON "alert_bearing_clearance"("machineServiceId");

-- AddForeignKey
ALTER TABLE "company_branches" ADD CONSTRAINT "company_branches_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_branches" ADD CONSTRAINT "user_branches_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_branches" ADD CONSTRAINT "user_branches_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "company_branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "threshold_bearing_clearance" ADD CONSTRAINT "threshold_bearing_clearance_blueprintId_fkey" FOREIGN KEY ("blueprintId") REFERENCES "blueprints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machines" ADD CONSTRAINT "machines_blueprintId_fkey" FOREIGN KEY ("blueprintId") REFERENCES "blueprints"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machines" ADD CONSTRAINT "machines_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "company_branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_fields" ADD CONSTRAINT "machine_fields_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "machines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_services" ADD CONSTRAINT "machine_services_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "machines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alert_bearing_clearance" ADD CONSTRAINT "alert_bearing_clearance_machineServiceId_fkey" FOREIGN KEY ("machineServiceId") REFERENCES "machine_services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_service_bearing_clearance" ADD CONSTRAINT "machine_service_bearing_clearance_machineServiceId_fkey" FOREIGN KEY ("machineServiceId") REFERENCES "machine_services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_service_bearing_clearance" ADD CONSTRAINT "machine_service_bearing_clearance_outerBeforeId_fkey" FOREIGN KEY ("outerBeforeId") REFERENCES "service_data_bearing_clearance"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_service_bearing_clearance" ADD CONSTRAINT "machine_service_bearing_clearance_outerDataId_fkey" FOREIGN KEY ("outerDataId") REFERENCES "service_data_bearing_clearance"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_service_bearing_clearance" ADD CONSTRAINT "machine_service_bearing_clearance_innerBeforeId_fkey" FOREIGN KEY ("innerBeforeId") REFERENCES "service_data_bearing_clearance"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_service_bearing_clearance" ADD CONSTRAINT "machine_service_bearing_clearance_innerDataId_fkey" FOREIGN KEY ("innerDataId") REFERENCES "service_data_bearing_clearance"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_service_slide" ADD CONSTRAINT "machine_service_slide_machineServiceId_fkey" FOREIGN KEY ("machineServiceId") REFERENCES "machine_services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_service_slide" ADD CONSTRAINT "machine_service_slide_outerBeforeId_fkey" FOREIGN KEY ("outerBeforeId") REFERENCES "service_data_slide"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_service_slide" ADD CONSTRAINT "machine_service_slide_outerDataId_fkey" FOREIGN KEY ("outerDataId") REFERENCES "service_data_slide"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_service_slide" ADD CONSTRAINT "machine_service_slide_innerBeforeId_fkey" FOREIGN KEY ("innerBeforeId") REFERENCES "service_data_slide"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_service_slide" ADD CONSTRAINT "machine_service_slide_innerDataId_fkey" FOREIGN KEY ("innerDataId") REFERENCES "service_data_slide"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_service_gibs" ADD CONSTRAINT "machine_service_gibs_machineServiceId_fkey" FOREIGN KEY ("machineServiceId") REFERENCES "machine_services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_service_gibs" ADD CONSTRAINT "machine_service_gibs_outerBeforeId_fkey" FOREIGN KEY ("outerBeforeId") REFERENCES "service_data_gibs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_service_gibs" ADD CONSTRAINT "machine_service_gibs_outerDataId_fkey" FOREIGN KEY ("outerDataId") REFERENCES "service_data_gibs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_service_gibs" ADD CONSTRAINT "machine_service_gibs_innerBeforeId_fkey" FOREIGN KEY ("innerBeforeId") REFERENCES "service_data_gibs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_service_gibs" ADD CONSTRAINT "machine_service_gibs_innerDataId_fkey" FOREIGN KEY ("innerDataId") REFERENCES "service_data_gibs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_service_lubrication_hydraulics" ADD CONSTRAINT "machine_service_lubrication_hydraulics_machineServiceId_fkey" FOREIGN KEY ("machineServiceId") REFERENCES "machine_services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_service_lubrication_hydraulics" ADD CONSTRAINT "machine_service_lubrication_hydraulics_dataId_fkey" FOREIGN KEY ("dataId") REFERENCES "service_data_lubrication_hydraulics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lubrication_hydraulics_gauges" ADD CONSTRAINT "lubrication_hydraulics_gauges_lubricationHydraulicsDataId_fkey" FOREIGN KEY ("lubricationHydraulicsDataId") REFERENCES "service_data_lubrication_hydraulics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_service_clutch" ADD CONSTRAINT "machine_service_clutch_machineServiceId_fkey" FOREIGN KEY ("machineServiceId") REFERENCES "machine_services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_service_clutch" ADD CONSTRAINT "machine_service_clutch_dataId_fkey" FOREIGN KEY ("dataId") REFERENCES "service_data_clutch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_service_counterbalance_cylinder_airbag" ADD CONSTRAINT "machine_service_counterbalance_cylinder_airbag_machineServ_fkey" FOREIGN KEY ("machineServiceId") REFERENCES "machine_services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_service_counterbalance_cylinder_airbag" ADD CONSTRAINT "machine_service_counterbalance_cylinder_airbag_outerDataId_fkey" FOREIGN KEY ("outerDataId") REFERENCES "service_data_counterbalance_cylinder_airbag"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_service_counterbalance_cylinder_airbag" ADD CONSTRAINT "machine_service_counterbalance_cylinder_airbag_innerDataId_fkey" FOREIGN KEY ("innerDataId") REFERENCES "service_data_counterbalance_cylinder_airbag"("id") ON DELETE SET NULL ON UPDATE CASCADE;
