import { PrismaClient } from '../../../generated/prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

import { seedCrownCompany } from './company';
import { seedCrownUsers } from './users';
import { seedCrownBlueprints } from './blueprints';
import { seedCrownMachines } from './machines';
import { seedCrownServices } from './services';

// Load environment variables from the database package .env file
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const prisma = new PrismaClient();

async function main() {
  console.log('========================================');
  console.log('🏭 Starting Crown seed data...');
  console.log('========================================\n');

  // 1. Create company and branch
  const { company, mainBranch } = await seedCrownCompany(prisma);

  // 2. Create users
  const { adminUser, technicianUser } = await seedCrownUsers(prisma, company, mainBranch);

  // 3. Create blueprints with thresholds
  const { dacBlueprint } = await seedCrownBlueprints(prisma);

  // 4. Create machines
  const { dacMachine } = await seedCrownMachines(prisma, dacBlueprint, mainBranch);

  // 5. Create historical services with measurements
  await seedCrownServices(prisma, dacMachine, technicianUser);

  console.log('\n========================================');
  console.log('✅ Crown seed completed successfully!');
  console.log('========================================');
  console.log('\n📝 Crown Credentials:');
  console.log('  Admin:');
  console.log('    Email: admin@crown.com');
  console.log('    Password: password');
  console.log('\n  Technician:');
  console.log('    Email: julio.souza@crown.com');
  console.log('    Password: password');
  console.log('\n🏢 Company subdomain: crown');
  console.log('🏭 Machine: Minster DAC #30645 (150 ton)');
  console.log('📊 Services: 6 historical inspections (2022-2024)');
  console.log('========================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Crown seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
