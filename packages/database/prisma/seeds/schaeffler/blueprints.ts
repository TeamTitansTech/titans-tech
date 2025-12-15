import { PrismaClient, ServiceSection } from '../../../generated/prisma/client';

// ============================================================================
// SCHAEFFLER BRASIL - P2H BLUEPRINT
// ============================================================================
// Model: Minster P2H (Point-of-Operation Press, Double Crank, High-Speed)
// Capacity: 160 tons
// Frame Type: Straight Side
// Clutch: EFHC (Electric Friction Hydraulic Clutch)
//
// Thresholds based on inspection data documentation:
// - Bearing Clearance: Optimal 0.015-0.025, Attention 0.025-0.030, Critical >0.030
// ============================================================================

export async function seedSchaefflerBlueprints(prisma: PrismaClient) {
  console.log('Creating Schaeffler blueprints...');

  // Create P2H Blueprint (based on Minster P2H press)
  const p2hBlueprint = await prisma.blueprint.upsert({
    where: { id: 'schaeffler-p2h-blueprint' },
    update: {
      sections: [
        ServiceSection.BEARING_CLEARANCE,
        ServiceSection.CLUTCH,
        ServiceSection.LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER,
      ],
    },
    create: {
      id: 'schaeffler-p2h-blueprint',
      name: 'P2H',
      sections: [
        ServiceSection.BEARING_CLEARANCE,
        ServiceSection.CLUTCH,
        ServiceSection.LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER,
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
          fieldName: 'Stroke',
          fieldSlug: 'stroke',
          fieldType: 'string',
        },
      ],
    },
  });

  console.log(`✓ Created/Updated P2H blueprint: ${p2hBlueprint.name}`);

  // ========================================================================
  // BEARING CLEARANCE THRESHOLDS FOR P2H
  // ========================================================================
  // Based on documentation:
  // - Optimal Range: 0.015" - 0.025" (Green)
  // - Attention Range: 0.025" - 0.030" (Yellow)
  // - Critical Range: >0.030" (Red - replacement recommended)
  //
  // Note: P2H model has clearance concentrated in main crankshaft bearings.
  // Individual component measurements (main bearings, wrist pin, etc.) may
  // not be applicable for this configuration.
  // ========================================================================
  await prisma.thresholdBearingClearance.upsert({
    where: { blueprintId: p2hBlueprint.id },
    update: {},
    create: {
      blueprintId: p2hBlueprint.id,
      // Total Clearance: Green < 0.025, Yellow 0.025-0.030, Red > 0.030
      totalClearance_greenMin: 0.015,
      totalClearance_yellowMin: 0.025,
      totalClearance_redMin: 0.03,
      // Main Bearings (same ranges as total for P2H)
      mainBearings_greenMin: 0.015,
      mainBearings_yellowMin: 0.025,
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

  console.log(`✓ Created/Updated bearing clearance thresholds for P2H`);

  // ========================================================================
  // CLUTCH THRESHOLDS FOR P2H
  // ========================================================================
  // Based on EFHC (Electric Friction Hydraulic Clutch) specifications
  // Similar to DAC clutch system
  // ========================================================================
  await prisma.thresholdClutch.upsert({
    where: { blueprintId: p2hBlueprint.id },
    update: {},
    create: {
      blueprintId: p2hBlueprint.id,
      // Hyd Clutch Clearance Total
      hydClutchClearanceTotal_greenMin: 0.06,
      hydClutchClearanceTotal_yellowMin: 0.12,
      hydClutchClearanceTotal_redMin: 0.188,
      // Hyd Clutch Clearance Rear
      hydClutchClearanceRear_greenMin: 0.015,
      hydClutchClearanceRear_yellowMin: 0.078,
      hydClutchClearanceRear_redMin: 0.105,
      // F-B (Front-Back) - Brake Anchor Clearance
      fb_greenMin: 0.045,
      fb_yellowMin: 0.052,
      fb_redMin: 0.055,
      // F-TB (Front Top-Bottom) - Brake Anchor Clearance
      fTB_greenMin: 0.005,
      fTB_yellowMin: 0.012,
      fTB_redMin: 0.015,
      // R-TB (Rear Top-Bottom) - Brake Anchor Clearance
      rTB_greenMin: 0.005,
      rTB_yellowMin: 0.012,
      rTB_redMin: 0.015,
    },
  });

  console.log(`✓ Created/Updated clutch thresholds for P2H`);

  return { p2hBlueprint };
}
