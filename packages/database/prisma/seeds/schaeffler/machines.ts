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
// SCHAEFFLER BRASIL - MACHINE INVENTORY
// ============================================================================
// Equipment: Minster P2H (Point-of-Operation Press)
// Capacity: 160 tons
// Stroke: 1.9 inches
//
// FLEET (1 unit, 1 inspection):
//   Sorocaba:
//     • #30576 - 1 inspection (Jan 4, 2023) - Grade A- (91/100)
//
// Equipment Characteristics (P2H Model):
// - "P" = Point-of-Operation Press
// - "2" = Double Crank Drive
// - "H" = High-Speed Configuration
// - Designed for precision stamping and forming operations
// - Typically used in automotive component manufacturing
// ============================================================================

export interface SchaefflerMachinesData {
  machine30576: Machine;
}

// P2H specifications based on inspection data
const MINSTER_P2H_SPECS = {
  manufacturer: 'Minster',
  sizeTonnage: '160',
  stroke: '1.9',
  foundationType: FoundationType.PLANT_FLOOR,
  frameType: FrameType.STRAIGHT_SIDE,
  pressMounting: PressMountingType.ADJUSTABLE,
};

/**
 * Seed Schaeffler machine at Sorocaba facility
 */
export async function seedSchaefflerMachines(
  prisma: PrismaClient,
  p2hBlueprint: Blueprint,
  sorocabaBranch: CompanyBranch,
): Promise<SchaefflerMachinesData> {
  console.log('Creating Schaeffler fleet machines...');

  // ========================================================================
  // FACILITY: SCHAEFFLER SOROCABA - 1 machine
  // ========================================================================
  console.log('\n  SCHAEFFLER SOROCABA:');

  // #30576 - Good condition (1 inspection - Jan 2023)
  const machine30576 = await prisma.machine.upsert({
    where: { id: 'schaeffler-p2h-30576' },
    update: {
      branchId: sorocabaBranch.id,
    },
    create: {
      id: 'schaeffler-p2h-30576',
      name: 'Minster P2H #30576',
      blueprintId: p2hBlueprint.id,
      branchId: sorocabaBranch.id,
      serialNumber: '30576',
      ...MINSTER_P2H_SPECS,
    },
  });
  console.log(`  ✓ ${machine30576.name} - Good condition (A- 91/100)`);

  await upsertMachineFields(prisma, machine30576.id, '30576');

  console.log('\n✓ Created/Updated Schaeffler fleet machine');

  return { machine30576 };
}

// Helper function to upsert machine fields
async function upsertMachineFields(
  prisma: PrismaClient,
  machineId: string,
  serialNumber: string,
): Promise<void> {
  const fields = [
    { fieldSlug: 'serial_number', value: serialNumber },
    { fieldSlug: 'model_year', value: '2020' }, // Estimated - not in inspection data
    { fieldSlug: 'tonnage', value: '160' },
    { fieldSlug: 'stroke', value: '1.9' },
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
