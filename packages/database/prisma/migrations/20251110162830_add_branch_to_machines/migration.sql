-- CreateEnum
CREATE TYPE "MatingPartType" AS ENUM ('BUSHING', 'CONNECTION', 'NUT_SCREW_SLEEVE');

-- CreateEnum
CREATE TYPE "InspectionSection" AS ENUM ('BEARING_CLEARANCE', 'SLIDE', 'GIBS', 'LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER', 'CLUTCH', 'COUNTERBALANCE_CYLINDER_AIRBAG');

-- CreateTable
CREATE TABLE "blueprints" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fields" JSONB NOT NULL,
    "sections" "InspectionSection"[],
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
CREATE TABLE "machine_inspections" (
    "id" TEXT NOT NULL,
    "machineId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "isMaintenance" BOOLEAN NOT NULL DEFAULT false,
    "performedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "machine_inspections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "machine_inspection_bearing_clearance" (
    "id" TEXT NOT NULL,
    "machineInspectionId" TEXT NOT NULL,
    "beforeId" TEXT,
    "afterId" TEXT,

    CONSTRAINT "machine_inspection_bearing_clearance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bearing_clearances" (
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
    "slide_adj_nut_to_screw_sleeve_RH" DECIMAL(10,4) NOT NULL,
    "slide_adj_nut_to_screw_sleeve_LH" DECIMAL(10,4) NOT NULL,
    "extra_double_lockOpen_RH" DECIMAL(10,4) NOT NULL,
    "extra_double_lockOpen_LH" DECIMAL(10,4) NOT NULL,
    "ball_box_area_RH" DECIMAL(10,4) NOT NULL,
    "ball_box_area_LH" DECIMAL(10,4) NOT NULL,
    "innerTotalClearance_RH" DECIMAL(10,4) NOT NULL,
    "innerTotalClearance_LH" DECIMAL(10,4) NOT NULL,
    "innerMainBearings_RH" DECIMAL(10,4) NOT NULL,
    "innerMainBearings_LH" DECIMAL(10,4) NOT NULL,
    "innerUpperConnectionBearings_RH" DECIMAL(10,4) NOT NULL,
    "innerUpperConnectionBearings_LH" DECIMAL(10,4) NOT NULL,
    "innerWristPinToMatingPart_RH" DECIMAL(10,4) NOT NULL,
    "innerWristPinToMatingPart_LH" DECIMAL(10,4) NOT NULL,
    "innerWristPinToBushing_RH" DECIMAL(10,4) NOT NULL,
    "innerWristPinToBushing_LH" DECIMAL(10,4) NOT NULL,
    "innerSlide_adj_nut_to_screw_sleeve_RH" DECIMAL(10,4) NOT NULL,
    "innerSlide_adj_nut_to_screw_sleeve_LH" DECIMAL(10,4) NOT NULL,
    "innerExtra_double_lockOpen_RH" DECIMAL(10,4) NOT NULL,
    "innerExtra_double_lockOpen_LH" DECIMAL(10,4) NOT NULL,
    "innerBall_box_area_RH" DECIMAL(10,4) NOT NULL,
    "innerBall_box_area_LH" DECIMAL(10,4) NOT NULL,
    "combined_with" TEXT NOT NULL,
    "mating_part" "MatingPartType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bearing_clearances_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "machine_fields_machineId_fieldSlug_key" ON "machine_fields"("machineId", "fieldSlug");

-- AddForeignKey
ALTER TABLE "machines" ADD CONSTRAINT "machines_blueprintId_fkey" FOREIGN KEY ("blueprintId") REFERENCES "blueprints"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machines" ADD CONSTRAINT "machines_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "company_branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_fields" ADD CONSTRAINT "machine_fields_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "machines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_inspections" ADD CONSTRAINT "machine_inspections_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "machines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_inspection_bearing_clearance" ADD CONSTRAINT "machine_inspection_bearing_clearance_machineInspectionId_fkey" FOREIGN KEY ("machineInspectionId") REFERENCES "machine_inspections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_inspection_bearing_clearance" ADD CONSTRAINT "machine_inspection_bearing_clearance_beforeId_fkey" FOREIGN KEY ("beforeId") REFERENCES "bearing_clearances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_inspection_bearing_clearance" ADD CONSTRAINT "machine_inspection_bearing_clearance_afterId_fkey" FOREIGN KEY ("afterId") REFERENCES "bearing_clearances"("id") ON DELETE SET NULL ON UPDATE CASCADE;
