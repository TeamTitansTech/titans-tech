-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('INSPECTION', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "ServiceStatus" AS ENUM ('PENDING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "MatingPartType" AS ENUM ('BUSHING', 'CONNECTION', 'NUT_SCREW_SLEEVE');

-- CreateEnum
CREATE TYPE "ParallelismType" AS ENUM ('DNC', 'TO_BED', 'TO_BOLSTER');

-- CreateEnum
CREATE TYPE "MeasurementUnit" AS ENUM ('INCHES', 'MM');

-- CreateEnum
CREATE TYPE "ServiceSection" AS ENUM ('BEARING_CLEARANCE', 'SLIDE', 'GIBS', 'LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER', 'CLUTCH', 'COUNTERBALANCE_CYLINDER_AIRBAG');

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
CREATE TABLE "machines" (
    "id" TEXT NOT NULL,
    "blueprintId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "machine_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "machine_service_bearing_clearance" (
    "id" TEXT NOT NULL,
    "machineServiceId" TEXT NOT NULL,
    "outerBeforeId" TEXT,
    "outerAfterId" TEXT,
    "innerBeforeId" TEXT,
    "innerAfterId" TEXT,

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
    "hasBeenAdjusted" BOOLEAN NOT NULL DEFAULT false,
    "combinedWith" TEXT,
    "matingPart" "MatingPartType",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_data_bearing_clearance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "machine_service_slide" (
    "id" TEXT NOT NULL,
    "machineServiceId" TEXT NOT NULL,
    "outerBeforeId" TEXT,
    "outerAfterId" TEXT,
    "innerBeforeId" TEXT,
    "innerAfterId" TEXT,

    CONSTRAINT "machine_service_slide_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_data_slide" (
    "id" TEXT NOT NULL,
    "parallelism" "ParallelismType" NOT NULL,
    "hasBeenAdjusted" BOOLEAN NOT NULL DEFAULT false,
    "position1" DECIMAL(10,4) NOT NULL,
    "position2" DECIMAL(10,4) NOT NULL,
    "position3" DECIMAL(10,4) NOT NULL,
    "position4" DECIMAL(10,4) NOT NULL,
    "shutheightChecked" BOOLEAN NOT NULL DEFAULT false,
    "actualSH" TEXT,
    "overloadsOnMonitor" TEXT,
    "indicatorReading" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_data_slide_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "machine_service_gibs" (
    "id" TEXT NOT NULL,
    "machineServiceId" TEXT NOT NULL,
    "outerBeforeId" TEXT,
    "outerAfterId" TEXT,
    "innerBeforeId" TEXT,
    "innerAfterId" TEXT,

    CONSTRAINT "machine_service_gibs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_data_gibs" (
    "id" TEXT NOT NULL,
    "hasBeenAdjusted" BOOLEAN NOT NULL DEFAULT false,
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
    "lubePSI" DECIMAL(10,2),
    "monitorflowPSI" DECIMAL(10,2),
    "hydPSI" DECIMAL(10,2),
    "pressSWPSI" DECIMAL(10,2),
    "otherGauges" TEXT,
    "changedOil" BOOLEAN NOT NULL DEFAULT false,
    "oilTemperatureF" DECIMAL(10,2),
    "oilMfgType" TEXT,
    "changedFilter" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_data_lubrication_hydraulics_pkey" PRIMARY KEY ("id")
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
    "clutchType" TEXT,
    "clutchLocation" TEXT,
    "brakeSpringBrake" DECIMAL(10,4),
    "brakeSpringClutch" DECIMAL(10,4),
    "brakeSpringStudBolt" TEXT,
    "brakeAnchorClearanceFB" DECIMAL(10,4),
    "brakeAnchorClearanceFTB" DECIMAL(10,4),
    "brakeAnchorClearanceRTB" DECIMAL(10,4),
    "brakeStoppingTime" DECIMAL(10,2),
    "brakeLining" TEXT,
    "brakeClearing" DECIMAL(10,4),
    "brakeClearanceTotal" DECIMAL(10,4),
    "brakeClearanceRear" DECIMAL(10,4),
    "flywheelStoppingTime" DECIMAL(10,2),
    "flywheelBearings" TEXT,
    "flywheelBrake" TEXT,
    "clutchEngagements" INTEGER,
    "clutchLining" TEXT,
    "clutchSeals" TEXT,
    "gearBacklashBefore" DECIMAL(10,4),
    "gearBacklashAfter" DECIMAL(10,4),
    "crankEndplayBefore" DECIMAL(10,4),
    "crankEndplayAfter" DECIMAL(10,4),
    "airRegulatorPSI" DECIMAL(10,2),
    "airClutchTravel" DECIMAL(10,4),
    "airLineOilerSetting" TEXT,
    "hydClutchClearanceTotal" DECIMAL(10,4),
    "hydClutchClearanceRear" DECIMAL(10,4),
    "hydraulicPressurePSI" DECIMAL(10,2),
    "accumulatorPSI" DECIMAL(10,2),
    "rotaryUnion" TEXT,
    "splinesDriveRingDisc" TEXT,
    "adjustingNutLockSecure" TEXT,
    "separateBrakeSeals" TEXT,
    "flexDisc" TEXT,
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
    "counterbalanceType" TEXT,
    "airbagPistonSeals" TEXT,
    "airbagPistonSealsLeakLocation" TEXT,
    "regulator" TEXT,
    "gaugePSI" DECIMAL(10,2),
    "pneumaticsPlumbing" TEXT,
    "rodSeals" TEXT,
    "rodBushing" TEXT,
    "oilWick" TEXT,
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
CREATE UNIQUE INDEX "machine_fields_machineId_fieldSlug_key" ON "machine_fields"("machineId", "fieldSlug");

-- AddForeignKey
ALTER TABLE "company_branches" ADD CONSTRAINT "company_branches_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_branches" ADD CONSTRAINT "user_branches_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_branches" ADD CONSTRAINT "user_branches_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "company_branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machines" ADD CONSTRAINT "machines_blueprintId_fkey" FOREIGN KEY ("blueprintId") REFERENCES "blueprints"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machines" ADD CONSTRAINT "machines_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "company_branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_fields" ADD CONSTRAINT "machine_fields_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "machines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_services" ADD CONSTRAINT "machine_services_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "machines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_service_bearing_clearance" ADD CONSTRAINT "machine_service_bearing_clearance_machineServiceId_fkey" FOREIGN KEY ("machineServiceId") REFERENCES "machine_services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_service_bearing_clearance" ADD CONSTRAINT "machine_service_bearing_clearance_outerBeforeId_fkey" FOREIGN KEY ("outerBeforeId") REFERENCES "service_data_bearing_clearance"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_service_bearing_clearance" ADD CONSTRAINT "machine_service_bearing_clearance_outerAfterId_fkey" FOREIGN KEY ("outerAfterId") REFERENCES "service_data_bearing_clearance"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_service_bearing_clearance" ADD CONSTRAINT "machine_service_bearing_clearance_innerBeforeId_fkey" FOREIGN KEY ("innerBeforeId") REFERENCES "service_data_bearing_clearance"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_service_bearing_clearance" ADD CONSTRAINT "machine_service_bearing_clearance_innerAfterId_fkey" FOREIGN KEY ("innerAfterId") REFERENCES "service_data_bearing_clearance"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_service_slide" ADD CONSTRAINT "machine_service_slide_machineServiceId_fkey" FOREIGN KEY ("machineServiceId") REFERENCES "machine_services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_service_slide" ADD CONSTRAINT "machine_service_slide_outerBeforeId_fkey" FOREIGN KEY ("outerBeforeId") REFERENCES "service_data_slide"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_service_slide" ADD CONSTRAINT "machine_service_slide_outerAfterId_fkey" FOREIGN KEY ("outerAfterId") REFERENCES "service_data_slide"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_service_slide" ADD CONSTRAINT "machine_service_slide_innerBeforeId_fkey" FOREIGN KEY ("innerBeforeId") REFERENCES "service_data_slide"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_service_slide" ADD CONSTRAINT "machine_service_slide_innerAfterId_fkey" FOREIGN KEY ("innerAfterId") REFERENCES "service_data_slide"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_service_gibs" ADD CONSTRAINT "machine_service_gibs_machineServiceId_fkey" FOREIGN KEY ("machineServiceId") REFERENCES "machine_services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_service_gibs" ADD CONSTRAINT "machine_service_gibs_outerBeforeId_fkey" FOREIGN KEY ("outerBeforeId") REFERENCES "service_data_gibs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_service_gibs" ADD CONSTRAINT "machine_service_gibs_outerAfterId_fkey" FOREIGN KEY ("outerAfterId") REFERENCES "service_data_gibs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_service_gibs" ADD CONSTRAINT "machine_service_gibs_innerBeforeId_fkey" FOREIGN KEY ("innerBeforeId") REFERENCES "service_data_gibs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_service_gibs" ADD CONSTRAINT "machine_service_gibs_innerAfterId_fkey" FOREIGN KEY ("innerAfterId") REFERENCES "service_data_gibs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_service_lubrication_hydraulics" ADD CONSTRAINT "machine_service_lubrication_hydraulics_machineServiceId_fkey" FOREIGN KEY ("machineServiceId") REFERENCES "machine_services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_service_lubrication_hydraulics" ADD CONSTRAINT "machine_service_lubrication_hydraulics_dataId_fkey" FOREIGN KEY ("dataId") REFERENCES "service_data_lubrication_hydraulics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

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
