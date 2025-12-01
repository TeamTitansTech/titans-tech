import { PrismaClient } from '../../../generated/prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

import { seedCrownCompany, seedArumaCompany } from './company';
import { seedCrownUsers, seedArumaUsers } from './users';
import { seedCrownBlueprints } from './blueprints';
import { seedCrownMachines, seedArumaMachines } from './machines';
import { seedCrownServices, seedArumaServices } from './services';

// Load environment variables from the database package .env file
dotenv.config({ path: path.join(__dirname, '../../../.env') });

// ============================================================================
// MINSTER PRESS EQUIPMENT INSPECTION DATABASE - SEED
// ============================================================================
// Service Provider: Minster (240 West Fifth St, Minster, OH 45865, USA)
// Technician: Julio De Souza
// Service Center: USA
// Region: Brazil
//
// Total Customers: 2
// Total Equipment: 4 press units
// Total Inspections: 6 inspection records
// Date Range: February 2022 - July 2025 (3.5 years)
//
// CUSTOMERS:
//   1. Crown Cork & Seal (Ponta Grossa, Brazil)
//      Equipment: #30634, #30935 | Inspections: 3
//
//   2. Aruma Produtora De Embalagens (Estância, Brazil)
//      Equipment: #30530, #30645 | Inspections: 3
// ============================================================================

/**
 * Seed Crown Cork data
 */
async function seedCrownData(
  prisma: PrismaClient,
  dacBlueprint: Awaited<ReturnType<typeof seedCrownBlueprints>>['dacBlueprint'],
) {
  console.log('\n----------------------------------------');
  console.log('CROWN CORK & SEAL (Ponta Grossa, Brazil)');
  console.log('----------------------------------------');

  // 1. Create Crown company and branch
  const { company: crownCompany, mainBranch: crownBranch } = await seedCrownCompany(prisma);

  // 2. Create Crown users
  const { technicianUser: crownTechnician } = await seedCrownUsers(
    prisma,
    crownCompany,
    crownBranch,
  );

  // 3. Create Crown machines (#30634, #30935)
  const { machine30634, machine30935 } = await seedCrownMachines(prisma, dacBlueprint, crownBranch);

  // 4. Create Crown services (3 inspections)
  await seedCrownServices(prisma, machine30935!, machine30634!, crownTechnician);

  return { crownCompany, crownBranch, crownTechnician, machine30634, machine30935 };
}

/**
 * Seed Aruma data
 */
async function seedArumaData(
  prisma: PrismaClient,
  dacBlueprint: Awaited<ReturnType<typeof seedCrownBlueprints>>['dacBlueprint'],
) {
  console.log('\n----------------------------------------');
  console.log('ARUMA PRODUTORA DE EMBALAGENS (Estância, Brazil)');
  console.log('----------------------------------------');

  // 1. Create Aruma company and branch
  const { company: arumaCompany, mainBranch: arumaBranch } = await seedArumaCompany(prisma);

  // 2. Create Aruma users
  const { technicianUser: arumaTechnician } = await seedArumaUsers(
    prisma,
    arumaCompany,
    arumaBranch,
  );

  // 3. Create Aruma machines (#30530, #30645)
  const { machine30530, machine30645 } = await seedArumaMachines(prisma, dacBlueprint, arumaBranch);

  // 4. Create Aruma services (3 inspections)
  await seedArumaServices(prisma, machine30645!, machine30530!, arumaTechnician);

  return { arumaCompany, arumaBranch, arumaTechnician, machine30530, machine30645 };
}

/**
 * Seed all Minster data - Crown Cork and Aruma
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
  console.log('');
  console.log('Customers: 2 | Equipment: 4 units | Inspections: 6');
  console.log('========================================\n');

  // Create shared DAC blueprint with thresholds (used by both companies)
  console.log('Creating shared DAC blueprint...');
  const { dacBlueprint } = await seedCrownBlueprints(prisma);

  // Seed Crown Cork data
  await seedCrownData(prisma, dacBlueprint);

  // Seed Aruma data
  await seedArumaData(prisma, dacBlueprint);

  // Summary
  console.log('\n========================================');
  console.log('SEED COMPLETED SUCCESSFULLY');
  console.log('========================================');
  console.log('');
  console.log('CROWN CORK & SEAL (Ponta Grossa):');
  console.log('  Admin:      admin@crown.com / password');
  console.log('  Technician: julio.souza@crown.com / password');
  console.log('  Subdomain:  crown');
  console.log('  Machines:   #30634, #30935');
  console.log('  Services:   3 inspections (Jul 2024 - Jul 2025)');
  console.log('');
  console.log('ARUMA (Estância):');
  console.log('  Admin:      admin@aruma.com / password');
  console.log('  Technician: julio.souza@aruma.com / password');
  console.log('  Subdomain:  aruma');
  console.log('  Machines:   #30530, #30645');
  console.log('  Services:   3 inspections (Feb 2022 - Sep 2024)');
  console.log('');
  console.log('FLEET HEALTH SCORECARD:');
  console.log('  Best in fleet: #30634 (Crown Cork) - Outstanding');
  console.log('  Needs attention: #30645 (Aruma) - Flywheel bearing noise');
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
