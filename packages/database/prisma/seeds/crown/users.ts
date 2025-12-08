import { PrismaClient, Company, CompanyBranch, User } from '../../../generated/prisma/client';
import * as bcrypt from 'bcrypt';
import { MANAGER_PERMISSIONS, Permissions } from '@titans-tech/shared/types/permissions';

// ============================================================================
// USER DATA - MINSTER PRESS FLEET
// ============================================================================
// Technician: Julio De Souza (performs inspections for all facilities)
// Service Center: USA
// Region: Brazil
// ============================================================================

export interface UsersData {
  adminUser: User;
  technicianUser: User;
}

const TECHNICIAN_PERMISSIONS: Permissions = {
  readUsers: false,
  createUsers: false,
  updateUsers: false,
  deleteUsers: false,
  manageUserPermissions: false,
  assignUsersToBranches: false,
  readBranches: true,
  updateBranches: false,
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

/**
 * Seed Crown users with access to all THREE facilities
 */
export async function seedCrownUsers(
  prisma: PrismaClient,
  company: Company,
  arumaBranch: CompanyBranch,
  pontaGrossaBranch: CompanyBranch,
  teresinaBranch: CompanyBranch,
): Promise<UsersData> {
  console.log('Creating Crown users...');

  const hashedPassword = await bcrypt.hash('password', 10);

  // ========================================================================
  // COMPANY ADMIN - Full access to all 3 facilities
  // ========================================================================
  const adminUser = await prisma.user.upsert({
    where: { id: 'crown-admin' },
    update: {
      name: 'Crown Admin',
      email: 'admin@dev-crown.com',
      isCompanyAdmin: true,
      isCompanyManager: false,
      companyId: company.id,
    },
    create: {
      id: 'crown-admin',
      name: 'Crown Admin',
      email: 'admin@dev-crown.com',
      password: hashedPassword,
      isCompanyAdmin: true,
      isUsingDefaultPassword: true,
      companyId: company.id,
    },
  });

  console.log(`✓ Created/Updated admin: ${adminUser.email}`);

  // ========================================================================
  // TECHNICIAN: JULIO DE SOUZA
  // ========================================================================
  // From Minster data - performs inspections for ALL Crown facilities
  // Has service permissions at all 3 branches
  // ========================================================================
  const technicianUser = await prisma.user.upsert({
    where: { id: 'crown-technician' },
    update: {
      name: 'Julio De Souza',
      email: 'julio.souza@dev-crown.com',
      isCompanyAdmin: false,
      isCompanyManager: false,
      companyId: company.id,
    },
    create: {
      id: 'crown-technician',
      name: 'Julio De Souza',
      email: 'julio.souza@dev-crown.com',
      password: hashedPassword,
      isCompanyAdmin: false,
      isUsingDefaultPassword: true,
      companyId: company.id,
    },
  });

  console.log(`✓ Created/Updated technician: ${technicianUser.email}`);

  // Assign users to all 3 branches
  const branches = [
    { branch: arumaBranch, name: 'Aruma (Estancia)' },
    { branch: pontaGrossaBranch, name: 'Crown Cork & Seal (Ponta Grossa)' },
    { branch: teresinaBranch, name: 'Crown Cork (Teresina)' },
  ];

  for (const { branch, name } of branches) {
    // Admin - full permissions
    await prisma.userBranch.upsert({
      where: {
        userId_branchId: {
          userId: adminUser.id,
          branchId: branch.id,
        },
      },
      update: {},
      create: {
        userId: adminUser.id,
        branchId: branch.id,
        ...MANAGER_PERMISSIONS,
      },
    });

    // Technician - service permissions
    await prisma.userBranch.upsert({
      where: {
        userId_branchId: {
          userId: technicianUser.id,
          branchId: branch.id,
        },
      },
      update: {},
      create: {
        userId: technicianUser.id,
        branchId: branch.id,
        ...TECHNICIAN_PERMISSIONS,
      },
    });
  }

  console.log(`✓ Assigned users to all 3 Crown branches`);

  return { adminUser, technicianUser };
}

/**
 * Seed Ardagh users
 * Note: Template files only - awaiting actual inspection data
 */
export async function seedArdaghUsers(
  prisma: PrismaClient,
  company: Company,
  mainBranch: CompanyBranch,
): Promise<UsersData> {
  console.log('Creating Ardagh users...');

  const hashedPassword = await bcrypt.hash('password', 10);

  // Company Admin
  const adminUser = await prisma.user.upsert({
    where: { id: 'ardagh-admin' },
    update: {
      name: 'Ardagh Admin',
      email: 'admin@dev-ardagh.com',
      isCompanyAdmin: true,
      isCompanyManager: false,
      companyId: company.id,
    },
    create: {
      id: 'ardagh-admin',
      name: 'Ardagh Admin',
      email: 'admin@dev-ardagh.com',
      password: hashedPassword,
      isCompanyAdmin: true,
      isUsingDefaultPassword: true,
      companyId: company.id,
    },
  });

  console.log(`✓ Created/Updated admin: ${adminUser.email}`);

  // Technician
  const technicianUser = await prisma.user.upsert({
    where: { id: 'ardagh-technician' },
    update: {
      name: 'Ardagh Technician',
      email: 'technician@dev-ardagh.com',
      isCompanyAdmin: false,
      isCompanyManager: false,
      companyId: company.id,
    },
    create: {
      id: 'ardagh-technician',
      name: 'Ardagh Technician',
      email: 'technician@dev-ardagh.com',
      password: hashedPassword,
      isCompanyAdmin: false,
      isUsingDefaultPassword: true,
      companyId: company.id,
    },
  });

  console.log(`✓ Created/Updated technician: ${technicianUser.email}`);

  // Assign admin to branch
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
      ...MANAGER_PERMISSIONS,
    },
  });

  // Assign technician to branch
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

  console.log(`✓ Assigned users to Ardagh Brazil branch`);

  return { adminUser, technicianUser };
}
