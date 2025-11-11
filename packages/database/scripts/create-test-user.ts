import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const createTestUser = async () => {
  // Create a test company
  const company = await prisma.company.upsert({
    where: { slug: 'test-company' },
    update: {},
    create: {
      name: 'Test Company',
      slug: 'test-company',
      logo: null,
      brandColor: '#FF6B35',
    },
  });

  console.log(`Company created/updated: ${company.name} (${company.slug})`);

  // Create a test branch
  const branch = await prisma.companyBranch.upsert({
    where: { id: 'test-main-branch' },
    update: {},
    create: {
      id: 'test-main-branch',
      name: 'Main Branch',
      isMainBranch: true,
      companyId: company.id,
    },
  });

  console.log(`Branch created/updated: ${branch.name}`);

  // Create a test user (company admin)
  const hashedPassword = await bcrypt.hash('password', 10);

  const user = await prisma.user.upsert({
    where: { email: 'user@company.com' },
    update: {},
    create: {
      email: 'user@company.com',
      name: 'Test User',
      password: hashedPassword,
      isCompanyAdmin: true,
      isCompanyManager: false,
      companyId: company.id,
    },
  });

  console.log(`User created/updated: ${user.email} (password: password)`);

  // Associate user with branch
  const userBranch = await prisma.userBranch.upsert({
    where: {
      userId_branchId: {
        userId: user.id,
        branchId: branch.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      branchId: branch.id,
      // Grant all permissions for testing
      readUsers: true,
      createUsers: true,
      updateUsers: true,
      deleteUsers: true,
      readBlueprints: true,
      createBlueprints: true,
      updateBlueprints: true,
      deleteBlueprints: true,
      readMachines: true,
      createMachines: true,
      updateMachines: true,
      deleteMachines: true,
      readServices: true,
      createServices: true,
      updateServices: true,
      deleteServices: true,
    },
  });

  console.log(`User associated with branch: ${branch.name}`);
  console.log('\n=== Test Credentials ===');
  console.log('Company User Login:');
  console.log('Email: user@company.com');
  console.log('Password: password');
  console.log('\nAdmin Login:');
  console.log('Email: admin@admin.com');
  console.log('Password: password');
};

createTestUser()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
