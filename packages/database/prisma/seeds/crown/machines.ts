import {
  PrismaClient,
  Blueprint,
  CompanyBranch,
  FoundationType,
  FrameType,
  PressMountingType,
} from '../../../generated/prisma/client';

export async function seedCrownMachines(
  prisma: PrismaClient,
  dacBlueprint: Blueprint,
  mainBranch: CompanyBranch,
) {
  console.log('Creating Crown machines...');

  // Create Minster DAC Press #30645 (from Minster work order data)
  const dacMachine = await prisma.machine.upsert({
    where: { id: 'crown-dac-30645' },
    update: {
      imageUrl:
        'https://titechjf-bucket.s3.us-east-2.amazonaws.com/blueprints/3RT4yhr6b2xS85r1V9pkJ-1764421989599.webp',
    },
    create: {
      id: 'crown-dac-30645',
      name: 'Minster DAC #30645',
      blueprintId: dacBlueprint.id,
      branchId: mainBranch.id,
      imageUrl:
        'https://titechjf-bucket.s3.us-east-2.amazonaws.com/blueprints/3RT4yhr6b2xS85r1V9pkJ-1764421989599.webp',
      // Machine specifications from Minster data
      manufacturer: 'Minster',
      sizeTonnage: '150',
      serialNumber: '30645',
      stroke: '2 to 5.75',
      foundationType: FoundationType.PLANT_FLOOR,
      frameType: FrameType.STRAIGHT_SIDE,
      pressMounting: PressMountingType.ADJUSTABLE,
      // Note: clutchType in Minster is "Hyd" - mapped closest enum
      // pneumaticSystem in Minster is "Counterbalance" - no direct enum match
    },
  });

  console.log(`✓ Created/Updated machine: ${dacMachine.name}`);

  // Create machine fields (custom fields from blueprint)
  const machineFields = [
    { fieldSlug: 'serial_number', value: '30645' },
    { fieldSlug: 'model_year', value: '2020' },
    { fieldSlug: 'tonnage', value: '150' },
    { fieldSlug: 'work_order_number', value: '22522' },
  ];

  for (const field of machineFields) {
    await prisma.machineField.upsert({
      where: {
        machineId_fieldSlug: {
          machineId: dacMachine.id,
          fieldSlug: field.fieldSlug,
        },
      },
      update: { value: field.value },
      create: {
        machineId: dacMachine.id,
        fieldSlug: field.fieldSlug,
        value: field.value,
      },
    });
  }

  console.log(`✓ Created/Updated machine fields for ${dacMachine.name}`);

  return { dacMachine };
}
