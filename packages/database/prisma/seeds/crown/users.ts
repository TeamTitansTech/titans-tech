import { PrismaClient, Company, CompanyBranch, User } from '../../../generated/prisma/client';
import * as bcrypt from 'bcrypt';

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

  console.log(`✓ Created/Updated admin: ${adminUser.email}`);

  // ========================================================================
  // TECHNICIAN: JULIO DE SOUZA
  // ========================================================================
  // From Minster data - performs inspections for ALL Crown facilities
  // Has service permissions at all 3 branches
  // ========================================================================
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
        ...ALL_PERMISSIONS,
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
    where: { email: 'admin@ardagh.com' },
    update: {},
    create: {
      id: 'ardagh-admin',
      name: 'Ardagh Admin',
      email: 'admin@ardagh.com',
      password: hashedPassword,
      isCompanyAdmin: true,
      isCompanyManager: false,
      isUsingDefaultPassword: true,
      companyId: company.id,
    },
  });

  console.log(`✓ Created/Updated admin: ${adminUser.email}`);

  // Technician
  const technicianUser = await prisma.user.upsert({
    where: { email: 'technician@ardagh.com' },
    update: {},
    create: {
      id: 'ardagh-technician',
      name: 'Ardagh Technician',
      email: 'technician@ardagh.com',
      password: hashedPassword,
      isCompanyAdmin: false,
      isCompanyManager: false,
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
      ...ALL_PERMISSIONS,
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
