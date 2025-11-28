import { PrismaClient, Company, CompanyBranch } from '../../../generated/prisma/client';
import * as bcrypt from 'bcrypt';

export async function seedCrownUsers(
  prisma: PrismaClient,
  company: Company,
  mainBranch: CompanyBranch,
) {
  console.log('Creating Crown users...');

  const hashedPassword = await bcrypt.hash('password', 10);

  // Create Company Admin
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
      readProductionLines: true,
      createProductionLines: true,
      updateProductionLines: true,
      deleteProductionLines: true,
    },
  });

  console.log(`✓ Assigned admin to main branch with full permissions`);

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
      // Read-only for most, full for services
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
    },
  });

  console.log(`✓ Assigned technician to main branch with service permissions`);

  return { adminUser, technicianUser };
}
