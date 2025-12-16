import { PrismaClient } from '../../../generated/prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

import { seedSchaefflerCompany } from './company';
import { seedSchaefflerUsers } from './users';
import { seedSchaefflerBlueprints } from './blueprints';
import { seedSchaefflerMachines } from './machines';
import { seedSchaefflerServices } from './services';

// Load environment variables from the database package .env file
dotenv.config({ path: path.join(__dirname, '../../../.env') });

// ============================================================================
// SCHAEFFLER BRASIL LTDA - SEED
// ============================================================================
// Company: Schaeffler Brasil Ltda
// Industry: Precision Components & Bearings Manufacturing
// Parent Company: Schaeffler Group (Germany)
// Location: Sorocaba, São Paulo, Brazil
//
// EQUIPMENT: 1 press unit
// - Minster P2H #30576 (160 ton)
//
// INSPECTIONS: 1 record
// - January 4, 2023 (Grade: A- 91/100)
//
// KEY FINDINGS:
// ✓ Excellent bearing clearances (0.019")
// ✓ All safety systems functional
// ⚠️ Filter replacement needed
// ⚠️ Oil change recommended
// ============================================================================

/**
 * Seed Schaeffler company data (1 branch, 1 machine, 1 inspection)
 */
async function seedSchaefflerData(
  prisma: PrismaClient,
  p2hBlueprint: Awaited<ReturnType<typeof seedSchaefflerBlueprints>>['p2hBlueprint'],
) {
  console.log('\n========================================');
  console.log('SCHAEFFLER BRASIL LTDA (1 facility)');
  console.log('========================================');

  // 1. Create Schaeffler company with 1 branch
  const { company, sorocabaBranch } = await seedSchaefflerCompany(prisma);

  // 2. Create Schaeffler users
  const { adminUser, regularUser } = await seedSchaefflerUsers(prisma, company, sorocabaBranch);

  // 3. Create Schaeffler machine
  const { machine30576 } = await seedSchaefflerMachines(prisma, p2hBlueprint, sorocabaBranch);

  // 4. Create services for the machine
  console.log('\n  ----------------------------------------');
  console.log('  SCHAEFFLER SOROCABA');
  console.log('  ----------------------------------------');
  await seedSchaefflerServices(prisma, machine30576, regularUser);

  return {
    company,
    sorocabaBranch,
    adminUser,
    regularUser,
    machine30576,
  };
}

/**
 * Seed all Schaeffler data
 * Can be called from main seed or run standalone
 */
export async function seedSchaeffler(prisma: PrismaClient) {
  console.log('========================================');
  console.log('SCHAEFFLER BRASIL EQUIPMENT INSPECTION DATA');
  console.log('========================================');
  console.log('');
  console.log('Company: Schaeffler Brasil Ltda');
  console.log('Location: Sorocaba, São Paulo, Brazil');
  console.log('Equipment: Minster P2H 160-ton press');
  console.log('Inspection: January 4, 2023');
  console.log('');
  console.log('Equipment: 1 unit | Inspections: 1');
  console.log('========================================');

  // Create P2H blueprint with thresholds
  console.log('\nCreating P2H blueprint...');
  const { p2hBlueprint } = await seedSchaefflerBlueprints(prisma);

  // Seed Schaeffler data (1 branch, 1 machine, 1 inspection)
  await seedSchaefflerData(prisma, p2hBlueprint);

  // Summary
  console.log('\n========================================');
  console.log('SCHAEFFLER SEED COMPLETED SUCCESSFULLY');
  console.log('========================================');
  console.log('');
  console.log('SCHAEFFLER BRASIL LTDA (1 facility, 1 machine, 1 inspection):');
  console.log('  Subdomain:  schaeffler');
  console.log('  Admin:      admin@dev-schaeffler.com / password');
  console.log('  User:       user@dev-schaeffler.com / password');
  console.log('');
  console.log('  SCHAEFFLER SOROCABA:');
  console.log('    • P2H #30576 (1 inspection) - Good condition (A- 91/100)');
  console.log('');
  console.log('EQUIPMENT HEALTH:');
  console.log('  • Bearing Clearance: 0.019" LH / 0.0195" RH (Excellent - A+)');
  console.log('  • Clutch System: All components OK');
  console.log('  • Maintenance: Filter replacement needed');
  console.log('========================================\n');
}

// Allow running as standalone script
if (require.main === module) {
  const prisma = new PrismaClient();
  seedSchaeffler(prisma)
    .catch((e) => {
      console.error('❌ Seed failed:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
