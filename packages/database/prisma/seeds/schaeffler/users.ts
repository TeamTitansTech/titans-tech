import { PrismaClient, Company, CompanyBranch, User } from '../../../generated/prisma/client';
import * as bcrypt from 'bcrypt';
import { MANAGER_PERMISSIONS, Permissions } from '@titans-tech/shared/types/permissions';

// ============================================================================
// USER DATA - SCHAEFFLER BRASIL
// ============================================================================
// Admin: Full access to Sorocaba facility
// User: Technician permissions for service creation
// ============================================================================

export interface SchaefflerUsersData {
  adminUser: User;
  regularUser: User;
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
 * Seed Schaeffler users with access to Sorocaba facility
 */
export async function seedSchaefflerUsers(
  prisma: PrismaClient,
  company: Company,
  sorocabaBranch: CompanyBranch,
): Promise<SchaefflerUsersData> {
  console.log('Creating Schaeffler users...');

  const hashedPassword = await bcrypt.hash('password', 10);

  // ========================================================================
  // COMPANY ADMIN - Full access to Sorocaba facility
  // ========================================================================
  const adminUser = await prisma.user.upsert({
    where: { id: 'schaeffler-admin' },
    update: {
      name: 'Schaeffler Admin',
      email: 'admin@dev-schaeffler.com',
      isCompanyAdmin: true,
      companyId: company.id,
    },
    create: {
      id: 'schaeffler-admin',
      name: 'Schaeffler Admin',
      email: 'admin@dev-schaeffler.com',
      password: hashedPassword,
      isCompanyAdmin: true,
      companyId: company.id,
    },
  });

  console.log(`✓ Created/Updated admin: ${adminUser.email}`);

  // ========================================================================
  // REGULAR USER - Technician permissions
  // ========================================================================
  const regularUser = await prisma.user.upsert({
    where: { id: 'schaeffler-user' },
    update: {
      name: 'Schaeffler User',
      email: 'user@dev-schaeffler.com',
      isCompanyAdmin: false,
      companyId: company.id,
    },
    create: {
      id: 'schaeffler-user',
      name: 'Schaeffler User',
      email: 'user@dev-schaeffler.com',
      password: hashedPassword,
      isCompanyAdmin: false,
      companyId: company.id,
    },
  });

  console.log(`✓ Created/Updated user: ${regularUser.email}`);

  // Assign users to Sorocaba branch

  // Admin - full permissions
  await prisma.userBranch.upsert({
    where: {
      userId_branchId: {
        userId: adminUser.id,
        branchId: sorocabaBranch.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      branchId: sorocabaBranch.id,
      ...MANAGER_PERMISSIONS,
    },
  });

  // Regular user - technician permissions
  await prisma.userBranch.upsert({
    where: {
      userId_branchId: {
        userId: regularUser.id,
        branchId: sorocabaBranch.id,
      },
    },
    update: {},
    create: {
      userId: regularUser.id,
      branchId: sorocabaBranch.id,
      ...TECHNICIAN_PERMISSIONS,
    },
  });

  console.log(`✓ Assigned users to Schaeffler Sorocaba branch`);

  return { adminUser, regularUser };
}
