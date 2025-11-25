import { PrismaClient, ServiceSection } from '../generated/prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as bcrypt from 'bcrypt';

// Load environment variables from the database package .env file
dotenv.config({ path: path.join(__dirname, '../.env') });

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Hash the default password
  const hashedPassword = await bcrypt.hash('password', 10);

  // ========================================
  // 1. Create SysAdmin
  // ========================================
  const sysAdmin = await prisma.sysAdmin.upsert({
    where: { email: 'admin@admin.com' },
    update: {},
    create: {
      email: 'admin@admin.com',
      password: hashedPassword,
      isUsingDefaultPassword: true,
    },
  });

  console.log(`Created/Updated system admin: ${sysAdmin.email}`);

  // ========================================
  // 2. Create Companies
  // ========================================

  // Create a company with subdomain "subdomain"
  const company = await prisma.company.upsert({
    where: { slug: 'subdomain' },
    update: {},
    create: {
      name: 'Example Company',
      slug: 'subdomain',
      logo: null,
      brandColor: '#1e40af',
    },
  });

  console.log(`Created/Updated company with slug: ${company.slug}`);

  // Create ACME Corporation
  const acmeCompany = await prisma.company.upsert({
    where: { slug: 'acme-corp' },
    update: {},
    create: {
      name: 'ACME Corporation',
      slug: 'acme-corp',
      brandColor: '#3B82F6',
    },
  });
  console.log(`Created/Updated Company: ${acmeCompany.name}`);

  // ========================================
  // 3. Create Company Branches
  // ========================================

  // Main branch for subdomain company
  let mainBranch = await prisma.companyBranch.findFirst({
    where: {
      companyId: company.id,
      name: 'Main Branch',
    },
  });

  if (!mainBranch) {
    mainBranch = await prisma.companyBranch.create({
      data: {
        companyId: company.id,
        name: 'Main Branch',
        isMainBranch: true,
      },
    });
  }

  console.log(`Created/Updated main branch with id: ${mainBranch.id}`);

  // ACME Corp branches
  const acmeMainBranch = await prisma.companyBranch.upsert({
    where: { id: 'acme-main-branch' },
    update: {},
    create: {
      id: 'acme-main-branch',
      name: 'Headquarters',
      isMainBranch: true,
      location: 'New York, NY',
      companyId: acmeCompany.id,
    },
  });
  console.log(`Created/Updated Main Branch: ${acmeMainBranch.name}`);

  const acmeSecondaryBranch = await prisma.companyBranch.upsert({
    where: { id: 'acme-secondary-branch' },
    update: {},
    create: {
      id: 'acme-secondary-branch',
      name: 'West Coast Facility',
      isMainBranch: false,
      location: 'Los Angeles, CA',
      companyId: acmeCompany.id,
    },
  });
  console.log(`Created/Updated Secondary Branch: ${acmeSecondaryBranch.name}`);

  // ========================================
  // 4. Create Users for Subdomain Company
  // ========================================

  // Company admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@company.com' },
    update: {},
    create: {
      email: 'admin@company.com',
      password: hashedPassword,
      name: 'Admin User',
      companyId: company.id,
      isCompanyAdmin: true,
      isCompanyManager: false,
      isUsingDefaultPassword: true,
    },
  });

  console.log(`Created/Updated admin user: ${adminUser.email}`);

  // Company manager user
  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@company.com' },
    update: {},
    create: {
      email: 'manager@company.com',
      password: hashedPassword,
      name: 'Manager User',
      companyId: company.id,
      isCompanyAdmin: false,
      isCompanyManager: true,
      isUsingDefaultPassword: true,
    },
  });

  console.log(`Created/Updated manager user: ${managerUser.email}`);

  // Normal user with full permissions on main branch
  const normalUser = await prisma.user.upsert({
    where: { email: 'user@company.com' },
    update: {},
    create: {
      email: 'user@company.com',
      password: hashedPassword,
      name: 'Normal User',
      companyId: company.id,
      isCompanyAdmin: false,
      isCompanyManager: false,
      isUsingDefaultPassword: true,
    },
  });

  console.log(`Created/Updated normal user: ${normalUser.email}`);

  // Assign normal user to main branch with full permissions
  await prisma.userBranch.upsert({
    where: {
      userId_branchId: {
        userId: normalUser.id,
        branchId: mainBranch.id,
      },
    },
    update: {},
    create: {
      userId: normalUser.id,
      branchId: mainBranch.id,
      // User Management Permissions
      readUsers: true,
      createUsers: true,
      updateUsers: true,
      deleteUsers: true,
      manageUserPermissions: true,
      assignUsersToBranches: true,
      // Branch Management Permissions
      readBranches: true,
      updateBranches: true,
      // Blueprint Permissions
      readBlueprints: true,
      createBlueprints: true,
      updateBlueprints: true,
      deleteBlueprints: true,
      // Machine Permissions
      readMachines: true,
      createMachines: true,
      updateMachines: true,
      deleteMachines: true,
      // Service Permissions
      readServices: true,
      createServices: true,
      updateServices: true,
      deleteServices: true,
      // Production Line Permissions
      readProductionLines: true,
      createProductionLines: true,
      updateProductionLines: true,
      deleteProductionLines: true,
    },
  });

  console.log(`Assigned normal user to main branch with full permissions`);

  // ========================================
  // 5. Create Users for ACME Corporation
  // ========================================

  // Company Admin
  const companyAdmin = await prisma.user.upsert({
    where: { email: 'admin@acme-corp.com' },
    update: {},
    create: {
      name: 'John Admin',
      email: 'admin@acme-corp.com',
      password: hashedPassword,
      isCompanyAdmin: true,
      isCompanyManager: false,
      isUsingDefaultPassword: true,
      companyId: acmeCompany.id,
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
      password: hashedPassword,
      isCompanyAdmin: false,
      isCompanyManager: true,
      isUsingDefaultPassword: true,
      companyId: acmeCompany.id,
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
      password: hashedPassword,
      isCompanyAdmin: false,
      isCompanyManager: false,
      isUsingDefaultPassword: true,
      companyId: acmeCompany.id,
    },
  });
  console.log(`✓ Created/Updated Regular User: ${regularUser.email}`);

  // ========================================
  // 6. Assign ACME Users to Branches with Permissions
  // ========================================

  // Admin with full permissions on main branch
  await prisma.userBranch.upsert({
    where: {
      userId_branchId: {
        userId: companyAdmin.id,
        branchId: acmeMainBranch.id,
      },
    },
    update: {},
    create: {
      userId: companyAdmin.id,
      branchId: acmeMainBranch.id,
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
      readServices: true,
      createServices: true,
      updateServices: true,
      deleteServices: true,
      // Production Line Permissions
      readProductionLines: true,
      createProductionLines: true,
      updateProductionLines: true,
      deleteProductionLines: true,
    },
  });
  console.log(`✓ Assigned Admin to Main Branch with full permissions`);

  // Manager with limited permissions on main branch
  await prisma.userBranch.upsert({
    where: {
      userId_branchId: {
        userId: companyManager.id,
        branchId: acmeMainBranch.id,
      },
    },
    update: {},
    create: {
      userId: companyManager.id,
      branchId: acmeMainBranch.id,
      // Limited permissions
      readUsers: true,
      createUsers: true,
      updateUsers: true,
      readBranches: true,
      readBlueprints: true,
      readMachines: true,
      createMachines: true,
      updateMachines: true,
      readServices: true,
      createServices: true,
      updateServices: true,
      // Production Line Permissions
      readProductionLines: true,
      createProductionLines: true,
      updateProductionLines: true,
    },
  });
  console.log(`✓ Assigned Manager to Main Branch with limited permissions`);

  // Regular user with NO permissions
  await prisma.userBranch.upsert({
    where: {
      userId_branchId: {
        userId: regularUser.id,
        branchId: acmeSecondaryBranch.id,
      },
    },
    update: {},
    create: {
      userId: regularUser.id,
      branchId: acmeSecondaryBranch.id,
      // NO permissions - all false by default
      readUsers: false,
      createUsers: false,
      updateUsers: false,
      deleteUsers: false,
      manageUserPermissions: false,
      assignUsersToBranches: false,
      readBranches: false,
      updateBranches: false,
      readBlueprints: false,
      createBlueprints: false,
      updateBlueprints: false,
      deleteBlueprints: false,
      readMachines: false,
      createMachines: false,
      updateMachines: false,
      deleteMachines: false,
      readServices: false,
      createServices: false,
      updateServices: false,
      deleteServices: false,
      readProductionLines: false,
      createProductionLines: false,
      updateProductionLines: false,
      deleteProductionLines: false,
    },
  });
  console.log(`✓ Assigned User to Secondary Branch with NO permissions`);

  // Also assign regular user to Main Branch with NO permissions
  await prisma.userBranch.upsert({
    where: {
      userId_branchId: {
        userId: regularUser.id,
        branchId: acmeMainBranch.id,
      },
    },
    update: {},
    create: {
      userId: regularUser.id,
      branchId: acmeMainBranch.id,
      // NO permissions - all false by default
      readUsers: false,
      createUsers: false,
      updateUsers: false,
      deleteUsers: false,
      manageUserPermissions: false,
      assignUsersToBranches: false,
      readBranches: false,
      updateBranches: false,
      readBlueprints: false,
      createBlueprints: false,
      updateBlueprints: false,
      deleteBlueprints: false,
      readMachines: false,
      createMachines: false,
      updateMachines: false,
      deleteMachines: false,
      readServices: false,
      createServices: false,
      updateServices: false,
      deleteServices: false,
      readProductionLines: false,
      createProductionLines: false,
      updateProductionLines: false,
      deleteProductionLines: false,
    },
  });
  console.log(`✓ Assigned User to Main Branch with NO permissions`);

  // Test User with NO permissions
  const testUser = await prisma.user.upsert({
    where: { email: 'test@acme-corp.com' },
    update: {},
    create: {
      name: 'Test User',
      email: 'test@acme-corp.com',
      password: hashedPassword,
      isCompanyAdmin: false,
      isCompanyManager: false,
      isUsingDefaultPassword: true,
      companyId: acmeCompany.id,
    },
  });
  console.log(`✓ Created/Updated Test User: ${testUser.email}`);

  // Assign test user to Main Branch with NO permissions
  await prisma.userBranch.upsert({
    where: {
      userId_branchId: {
        userId: testUser.id,
        branchId: acmeMainBranch.id,
      },
    },
    update: {},
    create: {
      userId: testUser.id,
      branchId: acmeMainBranch.id,
      // NO permissions - all false by default
      readUsers: false,
      createUsers: false,
      updateUsers: false,
      deleteUsers: false,
      manageUserPermissions: false,
      assignUsersToBranches: false,
      readBranches: false,
      updateBranches: false,
      readBlueprints: false,
      createBlueprints: false,
      updateBlueprints: false,
      deleteBlueprints: false,
      readMachines: false,
      createMachines: false,
      updateMachines: false,
      deleteMachines: false,
      readServices: false,
      createServices: false,
      updateServices: false,
      deleteServices: false,
      readProductionLines: false,
      createProductionLines: false,
      updateProductionLines: false,
      deleteProductionLines: false,
    },
  });
  console.log(`✓ Assigned Test User to Main Branch with NO permissions`);

  // ========================================
  // 7. Create Blueprints
  // ========================================
  const bearingBlueprint = await prisma.blueprint.upsert({
    where: { id: 'default-bearing-clearance-blueprint' },
    update: {
      sections: [
        ServiceSection.BEARING_CLEARANCE,
        ServiceSection.CLUTCH,
        ServiceSection.COUNTERBALANCE_CYLINDER_AIRBAG,
        ServiceSection.GIBS,
        ServiceSection.LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER,
        ServiceSection.SLIDE,
        ServiceSection.TRAMMING,
      ],
    },
    create: {
      id: 'default-bearing-clearance-blueprint',
      name: 'Standard Bearing Clearance Service',
      sections: [
        ServiceSection.BEARING_CLEARANCE,
        ServiceSection.CLUTCH,
        ServiceSection.COUNTERBALANCE_CYLINDER_AIRBAG,
        ServiceSection.GIBS,
        ServiceSection.LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER,
        ServiceSection.SLIDE,
        ServiceSection.TRAMMING,
      ],
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
      name: 'Standard Slide Service',
      sections: [ServiceSection.SLIDE],
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
  // 8. Create Example Machines
  // ========================================
  const machine1 = await prisma.machine.upsert({
    where: { id: 'example-machine-1' },
    update: {},
    create: {
      id: 'example-machine-1',
      name: 'Press Machine #001',
      blueprintId: bearingBlueprint.id,
      branchId: acmeMainBranch.id,
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
      branchId: acmeMainBranch.id,
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
      branchId: acmeSecondaryBranch.id,
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
  console.log('    Email: admin@admin.com');
  console.log('    Password: password');
  console.log('\n  Subdomain Company Admin:');
  console.log('    Email: admin@company.com');
  console.log('    Password: password');
  console.log('\n  Subdomain Company Manager:');
  console.log('    Email: manager@company.com');
  console.log('    Password: password');
  console.log('\n  Subdomain Company User:');
  console.log('    Email: user@company.com');
  console.log('    Password: password');
  console.log('\n  ACME Company Admin:');
  console.log('    Email: admin@acme-corp.com');
  console.log('    Password: password');
  console.log('\n  ACME Company Manager:');
  console.log('    Email: manager@acme-corp.com');
  console.log('    Password: password');
  console.log('\n  ACME Regular User (0 permissions):');
  console.log('    Email: user@acme-corp.com');
  console.log('    Password: password');
  console.log('\n  ACME Test User (0 permissions):');
  console.log('    Email: test@acme-corp.com');
  console.log('    Password: password');
  console.log('\n🏢 Company Subdomains: subdomain, acme-corp');
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
