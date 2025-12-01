import {
  PrismaClient,
  Blueprint,
  CompanyBranch,
  Machine,
  FoundationType,
  FrameType,
  PressMountingType,
} from '../../../generated/prisma/client';

// ============================================================================
// MACHINE DATA FROM: MINSTER PRESS EQUIPMENT INSPECTION DATABASE
// ============================================================================
// All equipment is Minster DAC (Straight-Side Press)
// Standard specs: 150 ton, Stroke 2-5.75", Hyd clutch, Counterbalance pneumatic
//
// EQUIPMENT INVENTORY:
// Crown Cork (Ponta Grossa):
//   • Serial #30634 - Best in fleet (lowest clearances)
//   • Serial #30935 - 2 inspections (trend data available)
//
// Aruma (Estância):
//   • Serial #30530 - 1 inspection
//   • Serial #30645 - 2 inspections (trend data available)
// ============================================================================

export interface MachinesData {
  machine30634?: Machine;
  machine30935?: Machine;
  machine30530?: Machine;
  machine30645?: Machine;
}

// Standard machine specifications for all Minster DAC presses
const MINSTER_DAC_SPECS = {
  manufacturer: 'Minster',
  sizeTonnage: '150',
  stroke: '2 to 5.75',
  foundationType: FoundationType.PLANT_FLOOR,
  frameType: FrameType.STRAIGHT_SIDE,
  pressMounting: PressMountingType.ADJUSTABLE,
};

/**
 * Seed Crown Cork machines (Ponta Grossa, Brazil)
 * Equipment: Serial #30634, #30935
 */
export async function seedCrownMachines(
  prisma: PrismaClient,
  dacBlueprint: Blueprint,
  mainBranch: CompanyBranch,
): Promise<MachinesData> {
  console.log('Creating Crown Cork machines...');

  // ========================================================================
  // SERIAL #30935 - Minster DAC (Crown Cork)
  // Inspections: 2 (Jul 2024, May 2025) - Trend data available
  // Status: Very Good condition, 8-9% bearing wear over 10 months
  // ========================================================================
  const machine30935 = await prisma.machine.upsert({
    where: { id: 'crown-dac-30935' },
    update: {
      imageUrl:
        'https://titechjf-bucket.s3.us-east-2.amazonaws.com/blueprints/3RT4yhr6b2xS85r1V9pkJ-1764421989599.webp',
    },
    create: {
      id: 'crown-dac-30935',
      name: 'Minster DAC #30935',
      blueprintId: dacBlueprint.id,
      branchId: mainBranch.id,
      imageUrl:
        'https://titechjf-bucket.s3.us-east-2.amazonaws.com/blueprints/3RT4yhr6b2xS85r1V9pkJ-1764421989599.webp',
      serialNumber: '30935',
      ...MINSTER_DAC_SPECS,
    },
  });
  console.log(`✓ Created/Updated machine: ${machine30935.name}`);

  // Machine fields for #30935
  const fields30935 = [
    { fieldSlug: 'serial_number', value: '30935' },
    { fieldSlug: 'model_year', value: '2020' },
    { fieldSlug: 'tonnage', value: '150' },
  ];

  for (const field of fields30935) {
    await prisma.machineField.upsert({
      where: {
        machineId_fieldSlug: {
          machineId: machine30935.id,
          fieldSlug: field.fieldSlug,
        },
      },
      update: { value: field.value },
      create: {
        machineId: machine30935.id,
        fieldSlug: field.fieldSlug,
        value: field.value,
      },
    });
  }
  console.log(`✓ Created/Updated machine fields for ${machine30935.name}`);

  // ========================================================================
  // SERIAL #30634 - Minster DAC (Crown Cork)
  // Inspections: 1 (Jul 2025)
  // Status: OUTSTANDING - Best in fleet (lowest bearing clearances)
  // ========================================================================
  const machine30634 = await prisma.machine.upsert({
    where: { id: 'crown-dac-30634' },
    update: {
      imageUrl:
        'https://titechjf-bucket.s3.us-east-2.amazonaws.com/blueprints/3RT4yhr6b2xS85r1V9pkJ-1764421989599.webp',
    },
    create: {
      id: 'crown-dac-30634',
      name: 'Minster DAC #30634',
      blueprintId: dacBlueprint.id,
      branchId: mainBranch.id,
      imageUrl:
        'https://titechjf-bucket.s3.us-east-2.amazonaws.com/blueprints/3RT4yhr6b2xS85r1V9pkJ-1764421989599.webp',
      serialNumber: '30634',
      ...MINSTER_DAC_SPECS,
    },
  });
  console.log(`✓ Created/Updated machine: ${machine30634.name}`);

  // Machine fields for #30634
  const fields30634 = [
    { fieldSlug: 'serial_number', value: '30634' },
    { fieldSlug: 'model_year', value: '2020' },
    { fieldSlug: 'tonnage', value: '150' },
  ];

  for (const field of fields30634) {
    await prisma.machineField.upsert({
      where: {
        machineId_fieldSlug: {
          machineId: machine30634.id,
          fieldSlug: field.fieldSlug,
        },
      },
      update: { value: field.value },
      create: {
        machineId: machine30634.id,
        fieldSlug: field.fieldSlug,
        value: field.value,
      },
    });
  }
  console.log(`✓ Created/Updated machine fields for ${machine30634.name}`);

  return { machine30634, machine30935 };
}

/**
 * Seed Aruma machines (Estância, Brazil)
 * Equipment: Serial #30530, #30645
 */
export async function seedArumaMachines(
  prisma: PrismaClient,
  dacBlueprint: Blueprint,
  mainBranch: CompanyBranch,
): Promise<MachinesData> {
  console.log('Creating Aruma machines...');

  // ========================================================================
  // SERIAL #30645 - Minster DAC (Aruma)
  // Inspections: 2 (Feb 2022, Sep 2024) - Trend data available
  // Status: Moderate wear, flywheel bearing noise persists since 2022
  // Note: 38-63% bearing clearance increase over 2.5 years
  // ========================================================================
  const machine30645 = await prisma.machine.upsert({
    where: { id: 'aruma-dac-30645' },
    update: {
      imageUrl:
        'https://titechjf-bucket.s3.us-east-2.amazonaws.com/blueprints/3RT4yhr6b2xS85r1V9pkJ-1764421989599.webp',
    },
    create: {
      id: 'aruma-dac-30645',
      name: 'Minster DAC #30645',
      blueprintId: dacBlueprint.id,
      branchId: mainBranch.id,
      imageUrl:
        'https://titechjf-bucket.s3.us-east-2.amazonaws.com/blueprints/3RT4yhr6b2xS85r1V9pkJ-1764421989599.webp',
      serialNumber: '30645',
      ...MINSTER_DAC_SPECS,
    },
  });
  console.log(`✓ Created/Updated machine: ${machine30645.name}`);

  // Machine fields for #30645
  const fields30645 = [
    { fieldSlug: 'serial_number', value: '30645' },
    { fieldSlug: 'model_year', value: '2020' },
    { fieldSlug: 'tonnage', value: '150' },
  ];

  for (const field of fields30645) {
    await prisma.machineField.upsert({
      where: {
        machineId_fieldSlug: {
          machineId: machine30645.id,
          fieldSlug: field.fieldSlug,
        },
      },
      update: { value: field.value },
      create: {
        machineId: machine30645.id,
        fieldSlug: field.fieldSlug,
        value: field.value,
      },
    });
  }
  console.log(`✓ Created/Updated machine fields for ${machine30645.name}`);

  // ========================================================================
  // SERIAL #30530 - Minster DAC (Aruma)
  // Inspections: 1 (Aug 2024)
  // Status: Excellent - Similar to #30645's 2022 baseline, no flywheel issues
  // ========================================================================
  const machine30530 = await prisma.machine.upsert({
    where: { id: 'aruma-dac-30530' },
    update: {
      imageUrl:
        'https://titechjf-bucket.s3.us-east-2.amazonaws.com/blueprints/3RT4yhr6b2xS85r1V9pkJ-1764421989599.webp',
    },
    create: {
      id: 'aruma-dac-30530',
      name: 'Minster DAC #30530',
      blueprintId: dacBlueprint.id,
      branchId: mainBranch.id,
      imageUrl:
        'https://titechjf-bucket.s3.us-east-2.amazonaws.com/blueprints/3RT4yhr6b2xS85r1V9pkJ-1764421989599.webp',
      serialNumber: '30530',
      ...MINSTER_DAC_SPECS,
    },
  });
  console.log(`✓ Created/Updated machine: ${machine30530.name}`);

  // Machine fields for #30530
  const fields30530 = [
    { fieldSlug: 'serial_number', value: '30530' },
    { fieldSlug: 'model_year', value: '2020' },
    { fieldSlug: 'tonnage', value: '150' },
  ];

  for (const field of fields30530) {
    await prisma.machineField.upsert({
      where: {
        machineId_fieldSlug: {
          machineId: machine30530.id,
          fieldSlug: field.fieldSlug,
        },
      },
      update: { value: field.value },
      create: {
        machineId: machine30530.id,
        fieldSlug: field.fieldSlug,
        value: field.value,
      },
    });
  }
  console.log(`✓ Created/Updated machine fields for ${machine30530.name}`);

  return { machine30530, machine30645 };
}

// Legacy function for backwards compatibility - redirects to seedArumaMachines
// since the original seed incorrectly had #30645 (Aruma's machine) under Crown
export async function seedCrownMachinesLegacy(
  prisma: PrismaClient,
  dacBlueprint: Blueprint,
  mainBranch: CompanyBranch,
): Promise<{ dacMachine: Machine }> {
  console.log('DEPRECATED: seedCrownMachines - use seedCrownMachines or seedArumaMachines');
  const { machine30935 } = await seedCrownMachines(prisma, dacBlueprint, mainBranch);
  return { dacMachine: machine30935! };
}
