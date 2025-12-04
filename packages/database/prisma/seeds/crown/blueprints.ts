import { PrismaClient, ServiceSection } from '../../../generated/prisma/client';

export async function seedCrownBlueprints(prisma: PrismaClient) {
  console.log('Creating Crown blueprints...');

  // Create DAC Blueprint (based on Minster DAC press)
  const dacBlueprint = await prisma.blueprint.upsert({
    where: { id: 'crown-dac-blueprint' },
    update: {
      sections: [
        ServiceSection.BEARING_CLEARANCE,
        ServiceSection.CLUTCH,
        ServiceSection.SLIDE_DOUBLE_HAMMER,
        ServiceSection.GIBS,
        ServiceSection.LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER,
        ServiceSection.COUNTERBALANCE_CYLINDER_AIRBAG,
      ],
    },
    create: {
      id: 'crown-dac-blueprint',
      name: 'DAC',
      sections: [
        ServiceSection.BEARING_CLEARANCE,
        ServiceSection.CLUTCH,
        ServiceSection.SLIDE_DOUBLE_HAMMER,
        ServiceSection.GIBS,
        ServiceSection.LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER,
        ServiceSection.COUNTERBALANCE_CYLINDER_AIRBAG,
      ],
      fields: [
        {
          fieldName: 'Serial Number',
          fieldSlug: 'serial_number',
          fieldType: 'string',
        },
        {
          fieldName: 'Model Year',
          fieldSlug: 'model_year',
          fieldType: 'int',
        },
        {
          fieldName: 'Tonnage',
          fieldSlug: 'tonnage',
          fieldType: 'int',
        },
        {
          fieldName: 'Work Order Number',
          fieldSlug: 'work_order_number',
          fieldType: 'string',
        },
      ],
    },
  });

  console.log(`✓ Created/Updated DAC blueprint: ${dacBlueprint.name}`);

  // Create Bearing Clearance Thresholds for DAC
  // Based on typical press bearing clearance tolerances (in inches)
  await prisma.thresholdBearingClearance.upsert({
    where: { blueprintId: dacBlueprint.id },
    update: {},
    create: {
      blueprintId: dacBlueprint.id,
      // Total Clearance: Green < 0.025, Yellow 0.025-0.035, Red > 0.035
      totalClearance_greenMin: 0.015,
      totalClearance_yellowMin: 0.025,
      totalClearance_redMin: 0.035,
      // Main Bearings
      mainBearings_greenMin: 0.01,
      mainBearings_yellowMin: 0.02,
      mainBearings_redMin: 0.03,
      // Upper Connection Bearings
      upperConnectionBearings_greenMin: 0.008,
      upperConnectionBearings_yellowMin: 0.015,
      upperConnectionBearings_redMin: 0.025,
      // Wrist Pin to Mating Part
      wristPinToMatingPart_greenMin: 0.005,
      wristPinToMatingPart_yellowMin: 0.012,
      wristPinToMatingPart_redMin: 0.02,
      // Wrist Pin to Bushing
      wristPinToBushing_greenMin: 0.004,
      wristPinToBushing_yellowMin: 0.01,
      wristPinToBushing_redMin: 0.018,
      // Slide Adj Nut to Screw/Sleeve
      slideAdjNutToScrewSleeve_greenMin: 0.003,
      slideAdjNutToScrewSleeve_yellowMin: 0.008,
      slideAdjNutToScrewSleeve_redMin: 0.015,
    },
  });

  console.log(`✓ Created/Updated bearing clearance thresholds for DAC`);

  // Create Clutch Thresholds for DAC
  await prisma.thresholdClutch.upsert({
    where: { blueprintId: dacBlueprint.id },
    update: {},
    create: {
      blueprintId: dacBlueprint.id,
      // Hyd Clutch Clearance Total
      hydClutchClearanceTotal_greenMin: 0.06,
      hydClutchClearanceTotal_yellowMin: 0.12,
      hydClutchClearanceTotal_redMin: 0.188,
      // Hyd Clutch Clearance Rear
      hydClutchClearanceRear_greenMin: 0.015,
      hydClutchClearanceRear_yellowMin: 0.078,
      hydClutchClearanceRear_redMin: 0.105,
      // F-B (Front-Back)
      fb_greenMin: 0.045,
      fb_yellowMin: 0.052,
      fb_redMin: 0.055,
      // F-TB (Front Top-Bottom)
      fTB_greenMin: 0.005,
      fTB_yellowMin: 0.012,
      fTB_redMin: 0.015,
      // R-TB (Rear Top-Bottom)
      rTB_greenMin: 0.005,
      rTB_yellowMin: 0.012,
      rTB_redMin: 0.015,
    },
  });

  console.log(`✓ Created/Updated clutch thresholds for DAC`);

  // Create Slide Thresholds for DAC (Double Hammer)
  await prisma.thresholdSlide.upsert({
    where: {
      blueprintId_sectionType: {
        blueprintId: dacBlueprint.id,
        sectionType: ServiceSection.SLIDE_DOUBLE_HAMMER,
      },
    },
    update: {},
    create: {
      blueprintId: dacBlueprint.id,
      sectionType: ServiceSection.SLIDE_DOUBLE_HAMMER,
      // Max Deviation thresholds
      maxDeviation_greenMin: 0.001,
      maxDeviation_yellowMin: 0.003,
      maxDeviation_redMin: 0.005,
    },
  });

  console.log(`✓ Created/Updated slide thresholds for DAC`);

  // Create Gibs Thresholds for DAC
  await prisma.thresholdGibs.upsert({
    where: { blueprintId: dacBlueprint.id },
    update: {},
    create: {
      blueprintId: dacBlueprint.id,
      // Usable thresholds
      usable_greenMin: 0.002,
      usable_yellowMin: 0.004,
      usable_redMin: 0.006,
    },
  });

  console.log(`✓ Created/Updated gibs thresholds for DAC`);

  return { dacBlueprint };
}
