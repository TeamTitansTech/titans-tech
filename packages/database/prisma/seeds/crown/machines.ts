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
// MINSTER PRESS EQUIPMENT - MACHINE INVENTORY
// ============================================================================
// All equipment is Minster DAC (Straight-Side Press)
// Standard specs: 150 ton, Stroke 2-5.75", Hyd clutch, Counterbalance pneumatic
//
// CROWN FLEET (5 units, 8 inspections):
//   Aruma (Estancia):
//     • #30645 - 3 inspections (trend data) - Flywheel bearing noise
//     • #30530 - 1 inspection - Excellent condition
//   Crown Cork & Seal (Ponta Grossa):
//     • #30935 - 2 inspections (trend data) - Very good condition
//     • #30634 - 1 inspection - BEST IN FLEET (Gold Standard)
//   Crown Cork (Teresina-PI):
//     • #30692 - 1 inspection (2017 - OUTDATED)
//
// ARDAGH FLEET (5 units, templates only):
//     • #31153 - Template 2023-06-09
//     • #31206 - Template 2020-09-16
//     • #31254 - Template 2021-09-22
//     • #31255 - Template 2023-07-07
//     • #31412 - Template 2021-11-07
//
// FLEET RANKING (Crown):
//   1. #30634 (Ponta Grossa) - A+ (98/100) - GOLD STANDARD
//   2. #30692 (Teresina)     - A- (90/100) - Historical 2017
//   3. #30530 (Estancia)     - A  (95/100)
//   4. #30935 (Ponta Grossa) - A  (94/100)
//   5. #30645 (Estancia)     - B+ (87/100) - Flywheel attention
// ============================================================================

export interface CrownMachinesData {
  // Aruma (Estancia)
  machine30645: Machine;
  machine30530: Machine;
  // Crown Cork & Seal (Ponta Grossa)
  machine30634: Machine;
  machine30935: Machine;
  // Crown Cork (Teresina)
  machine30692: Machine;
}

export interface ArdaghMachinesData {
  machine31153: Machine;
  machine31206: Machine;
  machine31254: Machine;
  machine31255: Machine;
  machine31412: Machine;
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
 * Seed all Crown machines across all THREE facilities
 */
export async function seedCrownMachines(
  prisma: PrismaClient,
  dacBlueprint: Blueprint,
  arumaBranch: CompanyBranch,
  pontaGrossaBranch: CompanyBranch,
  teresinaBranch: CompanyBranch,
): Promise<CrownMachinesData> {
  console.log('Creating Crown fleet machines...');

  // ========================================================================
  // FACILITY #1: ARUMA (Estancia) - 2 machines
  // ========================================================================
  console.log('\n  ARUMA (Estancia):');

  // #30645 - Flywheel bearing noise (3 inspections)
  const machine30645 = await prisma.machine.upsert({
    where: { id: 'crown-dac-30645' },
    update: {
      branchId: arumaBranch.id,
      imageUrl:
        'https://titechjf-bucket.s3.us-east-2.amazonaws.com/blueprints/3RT4yhr6b2xS85r1V9pkJ-1764421989599.webp',
    },
    create: {
      id: 'crown-dac-30645',
      name: 'Minster DAC #30645',
      blueprintId: dacBlueprint.id,
      branchId: arumaBranch.id,
      imageUrl:
        'https://titechjf-bucket.s3.us-east-2.amazonaws.com/blueprints/3RT4yhr6b2xS85r1V9pkJ-1764421989599.webp',
      serialNumber: '30645',
      ...MINSTER_DAC_SPECS,
    },
  });
  console.log(`  ✓ ${machine30645.name} - Flywheel bearing attention needed`);

  await upsertMachineFields(prisma, machine30645.id, '30645');

  // #30530 - Excellent condition (1 inspection)
  const machine30530 = await prisma.machine.upsert({
    where: { id: 'crown-dac-30530' },
    update: {
      branchId: arumaBranch.id,
      imageUrl:
        'https://titechjf-bucket.s3.us-east-2.amazonaws.com/blueprints/3RT4yhr6b2xS85r1V9pkJ-1764421989599.webp',
    },
    create: {
      id: 'crown-dac-30530',
      name: 'Minster DAC #30530',
      blueprintId: dacBlueprint.id,
      branchId: arumaBranch.id,
      imageUrl:
        'https://titechjf-bucket.s3.us-east-2.amazonaws.com/blueprints/3RT4yhr6b2xS85r1V9pkJ-1764421989599.webp',
      serialNumber: '30530',
      ...MINSTER_DAC_SPECS,
    },
  });
  console.log(`  ✓ ${machine30530.name} - Excellent condition`);

  await upsertMachineFields(prisma, machine30530.id, '30530');

  // ========================================================================
  // FACILITY #2: CROWN CORK & SEAL (Ponta Grossa) - 2 machines
  // ========================================================================
  console.log('\n  CROWN CORK & SEAL (Ponta Grossa):');

  // #30935 - Very good condition (2 inspections)
  const machine30935 = await prisma.machine.upsert({
    where: { id: 'crown-dac-30935' },
    update: {
      branchId: pontaGrossaBranch.id,
      imageUrl:
        'https://titechjf-bucket.s3.us-east-2.amazonaws.com/blueprints/3RT4yhr6b2xS85r1V9pkJ-1764421989599.webp',
    },
    create: {
      id: 'crown-dac-30935',
      name: 'Minster DAC #30935',
      blueprintId: dacBlueprint.id,
      branchId: pontaGrossaBranch.id,
      imageUrl:
        'https://titechjf-bucket.s3.us-east-2.amazonaws.com/blueprints/3RT4yhr6b2xS85r1V9pkJ-1764421989599.webp',
      serialNumber: '30935',
      ...MINSTER_DAC_SPECS,
    },
  });
  console.log(`  ✓ ${machine30935.name} - Very good condition`);

  await upsertMachineFields(prisma, machine30935.id, '30935');

  // #30634 - BEST IN FLEET (1 inspection)
  const machine30634 = await prisma.machine.upsert({
    where: { id: 'crown-dac-30634' },
    update: {
      branchId: pontaGrossaBranch.id,
      imageUrl:
        'https://titechjf-bucket.s3.us-east-2.amazonaws.com/blueprints/3RT4yhr6b2xS85r1V9pkJ-1764421989599.webp',
    },
    create: {
      id: 'crown-dac-30634',
      name: 'Minster DAC #30634',
      blueprintId: dacBlueprint.id,
      branchId: pontaGrossaBranch.id,
      imageUrl:
        'https://titechjf-bucket.s3.us-east-2.amazonaws.com/blueprints/3RT4yhr6b2xS85r1V9pkJ-1764421989599.webp',
      serialNumber: '30634',
      ...MINSTER_DAC_SPECS,
    },
  });
  console.log(`  ✓ ${machine30634.name} - BEST IN FLEET (Gold Standard)`);

  await upsertMachineFields(prisma, machine30634.id, '30634');

  // ========================================================================
  // FACILITY #3: CROWN CORK (Teresina-PI) - 1 machine
  // ========================================================================
  console.log('\n  CROWN CORK (Teresina-PI):');

  // #30692 - Historical data 2017 (1 inspection - OUTDATED)
  const machine30692 = await prisma.machine.upsert({
    where: { id: 'crown-dac-30692' },
    update: {
      branchId: teresinaBranch.id,
      imageUrl:
        'https://titechjf-bucket.s3.us-east-2.amazonaws.com/blueprints/3RT4yhr6b2xS85r1V9pkJ-1764421989599.webp',
    },
    create: {
      id: 'crown-dac-30692',
      name: 'Minster DAC #30692',
      blueprintId: dacBlueprint.id,
      branchId: teresinaBranch.id,
      imageUrl:
        'https://titechjf-bucket.s3.us-east-2.amazonaws.com/blueprints/3RT4yhr6b2xS85r1V9pkJ-1764421989599.webp',
      serialNumber: '30692',
      ...MINSTER_DAC_SPECS,
    },
  });
  console.log(`  ✓ ${machine30692.name} - 2017 data (INSPECTION OVERDUE)`);

  await upsertMachineFields(prisma, machine30692.id, '30692');

  console.log('\n✓ Created/Updated all 5 Crown fleet machines');

  return { machine30645, machine30530, machine30935, machine30634, machine30692 };
}

/**
 * Seed all Ardagh machines
 * Note: Template files only - awaiting actual inspection data
 */
export async function seedArdaghMachines(
  prisma: PrismaClient,
  dacBlueprint: Blueprint,
  mainBranch: CompanyBranch,
): Promise<ArdaghMachinesData> {
  console.log('Creating Ardagh fleet machines (templates only)...');

  // ========================================================================
  // ARDAGH MACHINES (5 units - awaiting inspection data)
  // ========================================================================

  // #31153 - Template 2023-06-09
  const machine31153 = await prisma.machine.upsert({
    where: { id: 'ardagh-dac-31153' },
    update: { branchId: mainBranch.id },
    create: {
      id: 'ardagh-dac-31153',
      name: 'Minster DAC #31153',
      blueprintId: dacBlueprint.id,
      branchId: mainBranch.id,
      serialNumber: '31153',
      ...MINSTER_DAC_SPECS,
    },
  });
  console.log(`  ✓ ${machine31153.name} - Template (awaiting data)`);

  await upsertMachineFields(prisma, machine31153.id, '31153');

  // #31206 - Template 2020-09-16
  const machine31206 = await prisma.machine.upsert({
    where: { id: 'ardagh-dac-31206' },
    update: { branchId: mainBranch.id },
    create: {
      id: 'ardagh-dac-31206',
      name: 'Minster DAC #31206',
      blueprintId: dacBlueprint.id,
      branchId: mainBranch.id,
      serialNumber: '31206',
      ...MINSTER_DAC_SPECS,
    },
  });
  console.log(`  ✓ ${machine31206.name} - Template (awaiting data)`);

  await upsertMachineFields(prisma, machine31206.id, '31206');

  // #31254 - Template 2021-09-22
  const machine31254 = await prisma.machine.upsert({
    where: { id: 'ardagh-dac-31254' },
    update: { branchId: mainBranch.id },
    create: {
      id: 'ardagh-dac-31254',
      name: 'Minster DAC #31254',
      blueprintId: dacBlueprint.id,
      branchId: mainBranch.id,
      serialNumber: '31254',
      ...MINSTER_DAC_SPECS,
    },
  });
  console.log(`  ✓ ${machine31254.name} - Template (awaiting data)`);

  await upsertMachineFields(prisma, machine31254.id, '31254');

  // #31255 - Template 2023-07-07
  const machine31255 = await prisma.machine.upsert({
    where: { id: 'ardagh-dac-31255' },
    update: { branchId: mainBranch.id },
    create: {
      id: 'ardagh-dac-31255',
      name: 'Minster DAC #31255',
      blueprintId: dacBlueprint.id,
      branchId: mainBranch.id,
      serialNumber: '31255',
      ...MINSTER_DAC_SPECS,
    },
  });
  console.log(`  ✓ ${machine31255.name} - Template (awaiting data)`);

  await upsertMachineFields(prisma, machine31255.id, '31255');

  // #31412 - Template 2021-11-07
  const machine31412 = await prisma.machine.upsert({
    where: { id: 'ardagh-dac-31412' },
    update: { branchId: mainBranch.id },
    create: {
      id: 'ardagh-dac-31412',
      name: 'Minster DAC #31412',
      blueprintId: dacBlueprint.id,
      branchId: mainBranch.id,
      serialNumber: '31412',
      ...MINSTER_DAC_SPECS,
    },
  });
  console.log(`  ✓ ${machine31412.name} - Template (awaiting data)`);

  await upsertMachineFields(prisma, machine31412.id, '31412');

  console.log('\n✓ Created/Updated all 5 Ardagh fleet machines (templates only)');

  return { machine31153, machine31206, machine31254, machine31255, machine31412 };
}

// Helper function to upsert machine fields
async function upsertMachineFields(
  prisma: PrismaClient,
  machineId: string,
  serialNumber: string,
): Promise<void> {
  const fields = [
    { fieldSlug: 'serial_number', value: serialNumber },
    { fieldSlug: 'model_year', value: '2020' },
    { fieldSlug: 'tonnage', value: '150' },
  ];

  for (const field of fields) {
    await prisma.machineField.upsert({
      where: {
        machineId_fieldSlug: {
          machineId,
          fieldSlug: field.fieldSlug,
        },
      },
      update: { value: field.value },
      create: {
        machineId,
        fieldSlug: field.fieldSlug,
        value: field.value,
      },
    });
  }
}
