import { PrismaClient, Company, CompanyBranch, User } from '../../../generated/prisma/client';
import * as bcrypt from 'bcrypt';

// ============================================================================
// USER DATA FROM: MINSTER PRESS EQUIPMENT INSPECTION DATABASE
// ============================================================================
// Technician: Julio De Souza (performs inspections for both customers)
// Service Center: USA
// Region: Brazil
// ============================================================================

export interface UsersData {
  adminUser: User;
  technicianUser: User;
}

const ALL_PERMISSIONS = {
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
  readProductionLines: true,
  createProductionLines: true,
  updateProductionLines: true,
  deleteProductionLines: true,
};

const TECHNICIAN_PERMISSIONS = {
  readUsers: false,
  createUsers: false,
  updateUsers: false,
  deleteUsers: false,
  manageUserPermissions: false,
  assignUsersToBranches: false,
  readBranches: true,
  updateBranches: false,
  readBlueprints: true,
  createBlueprints: false,
  updateBlueprints: false,
  deleteBlueprints: false,
  readMachines: true,
  createMachines: false,
  updateMachines: false,
  deleteMachines: false,
  readServices: true,
  createServices: true,
  updateServices: true,
  deleteServices: false,
  readProductionLines: true,
  createProductionLines: false,
  updateProductionLines: false,
  deleteProductionLines: false,
};

export async function seedCrownUsers(
  prisma: PrismaClient,
  company: Company,
  mainBranch: CompanyBranch,
): Promise<UsersData> {
  console.log('Creating Crown Cork users...');

  const hashedPassword = await bcrypt.hash('password', 10);

  // Create Company Admin for Crown Cork
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@crown.com' },
    update: {},
    create: {
      id: 'crown-admin',
      name: 'Crown Admin',
      email: 'admin@crown.com',
      password: hashedPassword,
      isCompanyAdmin: true,
      isCompanyManager: false,
      isUsingDefaultPassword: true,
      companyId: company.id,
    },
  });

  console.log(`✓ Created/Updated admin user: ${adminUser.email}`);

  // Create Technician (Julio De Souza from Minster data)
  // Same technician performs inspections for all customers in Brazil region
  const technicianUser = await prisma.user.upsert({
    where: { email: 'julio.souza@crown.com' },
    update: {},
    create: {
      id: 'crown-technician',
      name: 'Julio De Souza',
      email: 'julio.souza@crown.com',
      password: hashedPassword,
      isCompanyAdmin: false,
      isCompanyManager: false,
      isUsingDefaultPassword: true,
      companyId: company.id,
    },
  });

  console.log(`✓ Created/Updated technician user: ${technicianUser.email}`);

  // Assign admin to main branch with full permissions
  await prisma.userBranch.upsert({
    where: {
      userId_branchId: {
        userId: adminUser.id,
        branchId: mainBranch.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      branchId: mainBranch.id,
      ...ALL_PERMISSIONS,
    },
  });

  console.log(`✓ Assigned admin to Ponta Grossa branch with full permissions`);

  // Assign technician to main branch with service permissions
  await prisma.userBranch.upsert({
    where: {
      userId_branchId: {
        userId: technicianUser.id,
        branchId: mainBranch.id,
      },
    },
    update: {},
    create: {
      userId: technicianUser.id,
      branchId: mainBranch.id,
      ...TECHNICIAN_PERMISSIONS,
    },
  });

  console.log(`✓ Assigned technician to Ponta Grossa branch with service permissions`);

  return { adminUser, technicianUser };
}

export async function seedArumaUsers(
  prisma: PrismaClient,
  company: Company,
  mainBranch: CompanyBranch,
): Promise<UsersData> {
  console.log('Creating Aruma users...');

  const hashedPassword = await bcrypt.hash('password', 10);

  // Create Company Admin for Aruma
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@aruma.com' },
    update: {},
    create: {
      id: 'aruma-admin',
      name: 'Aruma Admin',
      email: 'admin@aruma.com',
      password: hashedPassword,
      isCompanyAdmin: true,
      isCompanyManager: false,
      isUsingDefaultPassword: true,
      companyId: company.id,
    },
  });

  console.log(`✓ Created/Updated admin user: ${adminUser.email}`);

  // Create Technician (Julio De Souza from Minster data)
  // Same technician performs inspections for all customers in Brazil region
  const technicianUser = await prisma.user.upsert({
    where: { email: 'julio.souza@aruma.com' },
    update: {},
    create: {
      id: 'aruma-technician',
      name: 'Julio De Souza',
      email: 'julio.souza@aruma.com',
      password: hashedPassword,
      isCompanyAdmin: false,
      isCompanyManager: false,
      isUsingDefaultPassword: true,
      companyId: company.id,
    },
  });

  console.log(`✓ Created/Updated technician user: ${technicianUser.email}`);

  // Assign admin to main branch with full permissions
  await prisma.userBranch.upsert({
    where: {
      userId_branchId: {
        userId: adminUser.id,
        branchId: mainBranch.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      branchId: mainBranch.id,
      ...ALL_PERMISSIONS,
    },
  });

  console.log(`✓ Assigned admin to Estância branch with full permissions`);

  // Assign technician to main branch with service permissions
  await prisma.userBranch.upsert({
    where: {
      userId_branchId: {
        userId: technicianUser.id,
        branchId: mainBranch.id,
      },
    },
    update: {},
    create: {
      userId: technicianUser.id,
      branchId: mainBranch.id,
      ...TECHNICIAN_PERMISSIONS,
    },
  });

  console.log(`✓ Assigned technician to Estância branch with service permissions`);

  return { adminUser, technicianUser };
}
