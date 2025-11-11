import { config } from 'dotenv';
import { PrismaClient, InspectionSection } from '../generated/prisma/client';
import * as bcrypt from 'bcryptjs';

// Load environment variables
config();

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Hash the default password
  const defaultPassword = await bcrypt.hash('password123', 10);

  // ========================================
  // 1. Create SysAdmin
  // ========================================
  const sysAdmin = await prisma.sysAdmin.upsert({
    where: { email: 'sysadmin@titans-tech.com' },
    update: {},
    create: {
      email: 'sysadmin@titans-tech.com',
      password: defaultPassword,
      isUsingDefaultPassword: true,
    },
  });
  console.log(`✓ Created/Updated SysAdmin: ${sysAdmin.email}`);

  // ========================================
  // 2. Create Example Company
  // ========================================
  const company = await prisma.company.upsert({
    where: { slug: 'acme-corp' },
    update: {},
    create: {
      name: 'ACME Corporation',
      slug: 'acme-corp',
      brandColor: '#3B82F6',
    },
  });
  console.log(`✓ Created/Updated Company: ${company.name}`);

  // ========================================
  // 3. Create Company Branches
  // ========================================
  const mainBranch = await prisma.companyBranch.upsert({
    where: { id: 'acme-main-branch' },
    update: {},
    create: {
      id: 'acme-main-branch',
      name: 'Headquarters',
      isMainBranch: true,
      location: 'New York, NY',
      companyId: company.id,
    },
  });
  console.log(`✓ Created/Updated Main Branch: ${mainBranch.name}`);

  const secondaryBranch = await prisma.companyBranch.upsert({
    where: { id: 'acme-secondary-branch' },
    update: {},
    create: {
      id: 'acme-secondary-branch',
      name: 'West Coast Facility',
      isMainBranch: false,
      location: 'Los Angeles, CA',
      companyId: company.id,
    },
  });
  console.log(`✓ Created/Updated Secondary Branch: ${secondaryBranch.name}`);

  // ========================================
  // 4. Create Users with Different Roles
  // ========================================

  // Company Admin
  const companyAdmin = await prisma.user.upsert({
    where: { email: 'admin@acme-corp.com' },
    update: {},
    create: {
      name: 'John Admin',
      email: 'admin@acme-corp.com',
      password: defaultPassword,
      isCompanyAdmin: true,
      isCompanyManager: false,
      isUsingDefaultPassword: true,
      companyId: company.id,
    },
  });
  console.log(`✓ Created/Updated Company Admin: ${companyAdmin.email}`);

  // Company Manager
  const companyManager = await prisma.user.upsert({
    where: { email: 'manager@acme-corp.com' },
    update: {},
    create: {
      name: 'Jane Manager',
      email: 'manager@acme-corp.com',
      password: defaultPassword,
      isCompanyAdmin: false,
      isCompanyManager: true,
      isUsingDefaultPassword: true,
      companyId: company.id,
    },
  });
  console.log(`✓ Created/Updated Company Manager: ${companyManager.email}`);

  // Regular User
  const regularUser = await prisma.user.upsert({
    where: { email: 'user@acme-corp.com' },
    update: {},
    create: {
      name: 'Bob User',
      email: 'user@acme-corp.com',
      password: defaultPassword,
      isCompanyAdmin: false,
      isCompanyManager: false,
      isUsingDefaultPassword: true,
      companyId: company.id,
    },
  });
  console.log(`✓ Created/Updated Regular User: ${regularUser.email}`);

  // ========================================
  // 5. Assign Users to Branches with Permissions
  // ========================================

  // Admin with full permissions on main branch
  await prisma.userBranch.upsert({
    where: {
      userId_branchId: {
        userId: companyAdmin.id,
        branchId: mainBranch.id,
      },
    },
    update: {},
    create: {
      userId: companyAdmin.id,
      branchId: mainBranch.id,
      // All permissions
      readUsers: true,
      createUsers: true,
      updateUsers: true,
      deleteUsers: true,
      manageUserPermissions: true,
      assignUsersToBranches: true,
      readBranches: true,
      updateBranches: true,
      readBlueprints: true,
      createBlueprints: true,
      updateBlueprints: true,
      deleteBlueprints: true,
      readMachines: true,
      createMachines: true,
      updateMachines: true,
      deleteMachines: true,
      readInspections: true,
      createInspections: true,
      updateInspections: true,
      deleteInspections: true,
    },
  });
  console.log(`✓ Assigned Admin to Main Branch with full permissions`);

  // Manager with limited permissions on main branch
  await prisma.userBranch.upsert({
    where: {
      userId_branchId: {
        userId: companyManager.id,
        branchId: mainBranch.id,
      },
    },
    update: {},
    create: {
      userId: companyManager.id,
      branchId: mainBranch.id,
      // Limited permissions
      readUsers: true,
      createUsers: true,
      updateUsers: true,
      readBranches: true,
      readBlueprints: true,
      readMachines: true,
      createMachines: true,
      updateMachines: true,
      readInspections: true,
      createInspections: true,
      updateInspections: true,
    },
  });
  console.log(`✓ Assigned Manager to Main Branch with limited permissions`);

  // Regular user with read/create permissions
  await prisma.userBranch.upsert({
    where: {
      userId_branchId: {
        userId: regularUser.id,
        branchId: secondaryBranch.id,
      },
    },
    update: {},
    create: {
      userId: regularUser.id,
      branchId: secondaryBranch.id,
      // Basic permissions
      readBranches: true,
      readBlueprints: true,
      readMachines: true,
      readInspections: true,
      createInspections: true,
    },
  });
  console.log(`✓ Assigned User to Secondary Branch with basic permissions`);

  // ========================================
  // 6. Create Blueprints
  // ========================================
  const bearingBlueprint = await prisma.blueprint.upsert({
    where: { id: 'default-bearing-clearance-blueprint' },
    update: {},
    create: {
      id: 'default-bearing-clearance-blueprint',
      name: 'Standard Bearing Clearance Inspection',
      sections: [InspectionSection.BEARING_CLEARANCE],
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
          fieldName: 'Machine Type',
          fieldSlug: 'machine_type',
          fieldType: 'enum',
          fieldOptions: ['Press', 'Stamping', 'Forming'],
        },
      ],
    },
  });
  console.log(`✓ Created/Updated Bearing Clearance Blueprint`);

  const slideBlueprint = await prisma.blueprint.upsert({
    where: { id: 'default-slide-blueprint' },
    update: {},
    create: {
      id: 'default-slide-blueprint',
      name: 'Standard Slide Inspection',
      sections: [InspectionSection.SLIDE],
      fields: [
        {
          fieldName: 'Serial Number',
          fieldSlug: 'serial_number',
          fieldType: 'string',
        },
        {
          fieldName: 'Slide Type',
          fieldSlug: 'slide_type',
          fieldType: 'enum',
          fieldOptions: ['Single', 'Double', 'Triple'],
        },
      ],
    },
  });
  console.log(`✓ Created/Updated Slide Blueprint`);

  // ========================================
  // 7. Create Example Machines
  // ========================================
  const machine1 = await prisma.machine.upsert({
    where: { id: 'example-machine-1' },
    update: {},
    create: {
      id: 'example-machine-1',
      name: 'Press Machine #001',
      blueprintId: bearingBlueprint.id,
      branchId: mainBranch.id,
      fields: {
        create: [
          { fieldSlug: 'serial_number', value: 'SN-12345' },
          { fieldSlug: 'model_year', value: '2020' },
          { fieldSlug: 'machine_type', value: 'Press' },
        ],
      },
    },
  });
  console.log(`✓ Created/Updated Machine: ${machine1.name}`);

  const machine2 = await prisma.machine.upsert({
    where: { id: 'example-machine-2' },
    update: {},
    create: {
      id: 'example-machine-2',
      name: 'Stamping Machine #002',
      blueprintId: bearingBlueprint.id,
      branchId: mainBranch.id,
      fields: {
        create: [
          { fieldSlug: 'serial_number', value: 'SN-67890' },
          { fieldSlug: 'model_year', value: '2021' },
          { fieldSlug: 'machine_type', value: 'Stamping' },
        ],
      },
    },
  });
  console.log(`✓ Created/Updated Machine: ${machine2.name}`);

  const machine3 = await prisma.machine.upsert({
    where: { id: 'example-machine-3' },
    update: {},
    create: {
      id: 'example-machine-3',
      name: 'Slide Press #003',
      blueprintId: slideBlueprint.id,
      branchId: secondaryBranch.id,
      fields: {
        create: [
          { fieldSlug: 'serial_number', value: 'SN-11111' },
          { fieldSlug: 'slide_type', value: 'Double' },
        ],
      },
    },
  });
  console.log(`✓ Created/Updated Machine: ${machine3.name}`);

  console.log('\n========================================');
  console.log('Seeding completed successfully!');
  console.log('========================================');
  console.log('\n📝 Default Credentials:');
  console.log('  SysAdmin:');
  console.log('    Email: sysadmin@titans-tech.com');
  console.log('    Password: password123');
  console.log('\n  Company Admin:');
  console.log('    Email: admin@acme-corp.com');
  console.log('    Password: password123');
  console.log('\n  Company Manager:');
  console.log('    Email: manager@acme-corp.com');
  console.log('    Password: password123');
  console.log('\n  Regular User:');
  console.log('    Email: user@acme-corp.com');
  console.log('    Password: password123');
  console.log('\n🏢 Company Subdomain: acme-corp');
  console.log('========================================\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
