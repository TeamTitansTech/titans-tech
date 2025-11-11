import { PrismaClient, ServiceSection } from '../generated/prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as bcrypt from 'bcrypt';

// Load environment variables from the database package .env file
dotenv.config({ path: path.join(__dirname, '../.env') });

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

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

  // Create main branch for the company
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

  // Hash the default password
  const hashedPassword = await bcrypt.hash('password', 10);

  // Create company admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Admin User',
      companyId: company.id,
      isCompanyAdmin: true,
      isCompanyManager: false,
      isUsingDefaultPassword: true,
    },
  });

  console.log(`Created/Updated admin user: ${adminUser.email}`);

  // Create company manager user
  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@example.com' },
    update: {},
    create: {
      email: 'manager@example.com',
      password: hashedPassword,
      name: 'Manager User',
      companyId: company.id,
      isCompanyAdmin: false,
      isCompanyManager: true,
      isUsingDefaultPassword: true,
    },
  });

  console.log(`Created/Updated manager user: ${managerUser.email}`);

  // Create normal user with full permissions on main branch
  const normalUser = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
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
      }
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
    },
  });

  console.log(`Assigned normal user to main branch with full permissions`);

  // Create example blueprint for bearing clearance inspection
  const blueprint = await prisma.blueprint.upsert({
    where: { id: 'default-bearing-clearance-blueprint' },
    update: {},
    create: {
      id: 'default-bearing-clearance-blueprint',
      name: 'Standard Bearing Clearance Inspection',
      sections: [ServiceSection.BEARING_CLEARANCE, ServiceSection.CLUTCH, ServiceSection.COUNTERBALANCE_CYLINDER_AIRBAG, ServiceSection.GIBS, ServiceSection.LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER, ServiceSection.SLIDE],
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
          fieldOptions: ['Type A', 'Type B', 'Type C'],
        },
      ],
    },
  });

  console.log(`Created/Updated blueprint with id: ${blueprint.id}`);

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
