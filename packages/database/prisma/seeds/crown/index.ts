import { PrismaClient } from '../../../generated/prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

import { seedCrownCompany, seedArdaghCompany } from './company';
import { seedCrownUsers, seedArdaghUsers } from './users';
import { seedCrownBlueprints } from './blueprints';
import { seedCrownMachines, seedArdaghMachines } from './machines';
import { seedCrownServices, seedArumaServices, seedTeresinaServices } from './services';

// Load environment variables from the database package .env file
dotenv.config({ path: path.join(__dirname, '../../../.env') });

// ============================================================================
// MINSTER PRESS EQUIPMENT INSPECTION DATABASE - SEED
// ============================================================================
// Service Provider: Minster (240 West Fifth St, Minster, OH 45865, USA)
// Technician: Julio De Souza
// Service Center: USA
// Region: Brazil
// Analysis Period: 2017-2025 (8 years)
//
// COMPANIES: 2
// EQUIPMENT: 10 press units (5 Crown, 5 Ardagh)
// INSPECTIONS: 7 records (Crown only - Ardagh has templates)
//
// CROWN (3 facilities, 5 equipment, 7 inspections):
//   • Aruma (Estancia): #30645, #30530 - 3 inspections
//   • Crown Cork & Seal (Ponta Grossa): #30634, #30935 - 3 inspections
//   • Crown Cork (Teresina-PI): #30692 - 1 inspection (2017)
//
// ARDAGH (1 facility, 5 equipment, templates only):
//   • Ardagh Brazil: #31153, #31206, #31254, #31255, #31412
// ============================================================================

/**
 * Seed Crown company data (3 branches, 5 machines, 7 inspections)
 */
async function seedCrownData(
  prisma: PrismaClient,
  dacBlueprint: Awaited<ReturnType<typeof seedCrownBlueprints>>['dacBlueprint'],
) {
  console.log('\n========================================');
  console.log('CROWN COMPANY (3 facilities)');
  console.log('========================================');

  // 1. Create Crown company with 3 branches
  const { company, arumaBranch, pontaGrossaBranch, teresinaBranch } =
    await seedCrownCompany(prisma);

  // 2. Create Crown users (with access to all 3 branches)
  const { technicianUser: crownTechnician } = await seedCrownUsers(
    prisma,
    company,
    arumaBranch,
    pontaGrossaBranch,
    teresinaBranch,
  );

  // 3. Create Crown machines across all 3 branches
  const { machine30645, machine30530, machine30935, machine30634, machine30692 } =
    await seedCrownMachines(prisma, dacBlueprint, arumaBranch, pontaGrossaBranch, teresinaBranch);

  // 4. Create services for all 3 facilities

  // Ponta Grossa: #30935 (2 inspections), #30634 (1 inspection)
  console.log('\n  ----------------------------------------');
  console.log('  CROWN CORK & SEAL (Ponta Grossa)');
  console.log('  ----------------------------------------');
  await seedCrownServices(prisma, machine30935!, machine30634!, crownTechnician);

  // Aruma (Estancia): #30645 (2 inspections), #30530 (1 inspection)
  console.log('\n  ----------------------------------------');
  console.log('  ARUMA (Estancia)');
  console.log('  ----------------------------------------');
  await seedArumaServices(prisma, machine30645!, machine30530!, crownTechnician);

  // Teresina: #30692 (1 inspection - 2017)
  console.log('\n  ----------------------------------------');
  console.log('  CROWN CORK (Teresina-PI)');
  console.log('  ----------------------------------------');
  await seedTeresinaServices(prisma, machine30692!, crownTechnician);

  return {
    company,
    arumaBranch,
    pontaGrossaBranch,
    teresinaBranch,
    crownTechnician,
    machine30645,
    machine30530,
    machine30935,
    machine30634,
    machine30692,
  };
}

/**
 * Seed Ardagh company data (1 branch, 5 machines, templates only)
 */
async function seedArdaghData(
  prisma: PrismaClient,
  dacBlueprint: Awaited<ReturnType<typeof seedCrownBlueprints>>['dacBlueprint'],
) {
  console.log('\n========================================');
  console.log('ARDAGH GROUP (1 facility - templates only)');
  console.log('========================================');

  // 1. Create Ardagh company with 1 branch
  const { company, mainBranch } = await seedArdaghCompany(prisma);

  // 2. Create Ardagh users
  await seedArdaghUsers(prisma, company, mainBranch);

  // 3. Create Ardagh machines (5 units - templates only)
  const machines = await seedArdaghMachines(prisma, dacBlueprint, mainBranch);

  // Note: No services for Ardagh - templates only, awaiting inspection data
  console.log('\n  ⚠️ Ardagh has templates only - no inspection data yet');

  return { company, mainBranch, machines };
}

/**
 * Seed all Minster data - Crown and Ardagh companies
 * Can be called from main seed or run standalone
 */
export async function seedCrown(prisma: PrismaClient) {
  console.log('========================================');
  console.log('MINSTER PRESS EQUIPMENT INSPECTION DATA');
  console.log('========================================');
  console.log('');
  console.log('Service Provider: Minster (Minster, OH, USA)');
  console.log('Technician: Julio De Souza');
  console.log('Region: Brazil');
  console.log('Date Range: 2017-2025 (8 years)');
  console.log('');
  console.log('Companies: 2 | Equipment: 10 units | Inspections: 7');
  console.log('========================================');

  // Create shared DAC blueprint with thresholds (used by both companies)
  console.log('\nCreating shared DAC blueprint...');
  const { dacBlueprint } = await seedCrownBlueprints(prisma);

  // Seed Crown data (3 branches, 5 machines, 8 inspections)
  await seedCrownData(prisma, dacBlueprint);

  // Seed Ardagh data (1 branch, 5 machines, templates only)
  await seedArdaghData(prisma, dacBlueprint);

  // Summary
  console.log('\n========================================');
  console.log('SEED COMPLETED SUCCESSFULLY');
  console.log('========================================');
  console.log('');
  console.log('CROWN (3 facilities, 5 machines, 7 inspections):');
  console.log('  Subdomain:  crown');
  console.log('  Admin:      admin@crown.com / password');
  console.log('  Technician: julio.souza@crown.com / password');
  console.log('');
  console.log('  ARUMA (Estancia):');
  console.log('    • #30645 (2 inspections) - Flywheel bearing noise');
  console.log('    • #30530 (1 inspection) - Excellent condition');
  console.log('');
  console.log('  CROWN CORK & SEAL (Ponta Grossa):');
  console.log('    • #30935 (2 inspections) - Very good condition');
  console.log('    • #30634 (1 inspection) - BEST IN FLEET (Gold Standard)');
  console.log('');
  console.log('  CROWN CORK (Teresina-PI):');
  console.log('    • #30692 (1 inspection - 2017) - INSPECTION OVERDUE');
  console.log('');
  console.log('ARDAGH GROUP (1 facility, 5 machines, templates only):');
  console.log('  Subdomain:  ardagh');
  console.log('  Admin:      admin@ardagh.com / password');
  console.log('  Technician: technician@ardagh.com / password');
  console.log('  Machines:   #31153, #31206, #31254, #31255, #31412');
  console.log('  Status:     ⚠️ Awaiting inspection data');
  console.log('');
  console.log('FLEET HEALTH SCORECARD (Crown):');
  console.log('  1. #30634 (Ponta Grossa) - A+ (98/100) - GOLD STANDARD');
  console.log('  2. #30530 (Estancia)     - A  (95/100)');
  console.log('  3. #30935 (Ponta Grossa) - A  (94/100)');
  console.log('  4. #30692 (Teresina)     - A- (90/100) - 2017 data');
  console.log('  5. #30645 (Estancia)     - B+ (87/100) - Flywheel attention');
  console.log('========================================\n');
}

// Allow running as standalone script
if (require.main === module) {
  const prisma = new PrismaClient();
  seedCrown(prisma)
    .catch((e) => {
      console.error('❌ Seed failed:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
