import { PrismaClient } from '@titans-tech/db';
import * as bcrypt from 'bcrypt';

export const TEST_SEED_DATA = {
  SYSADMIN: {
    email: 'admin@admin.com',
    password: 'password',
  },
  COMPANY: {
    id: 'test-company',
    name: 'Test Company',
    slug: 'test-company',
    brandColor: '#1e40af',
  },
  BRANCH: {
    id: 'test-branch',
    name: 'Test Branch',
    location: 'Test Location',
    isMainBranch: true,
  },
  USERS: {
    COMPANY_ADMIN: {
      id: 'test-company-admin',
      email: 'admin@test.com',
      name: 'Company Admin',
      password: 'password',
      isCompanyAdmin: true,
    },
    EMPLOYEE_SOME_PERMISSIONS: {
      id: 'test-employee-some',
      email: 'employee@test.com',
      name: 'Employee Some Permissions',
      password: 'password',
      isCompanyAdmin: false,
    },
    EMPLOYEE_ALL_PERMISSIONS: {
      id: 'test-employee-all',
      email: 'manager@test.com',
      name: 'Manager All Permissions',
      password: 'password',
      isCompanyAdmin: false,
    },
  },
} as const;
export class TestSeeder {
  constructor(private db: PrismaClient) {}

  async seed() {
    const hashedPassword = await bcrypt.hash('password', 10);

    const sysAdmin = await this.db.sysAdmin.create({
      data: {
        email: TEST_SEED_DATA.SYSADMIN.email,
        password: hashedPassword,
        isUsingDefaultPassword: true,
      },
    });

    const company = await this.db.company.create({
      data: {
        ...TEST_SEED_DATA.COMPANY,
      },
    });

    const branch = await this.db.companyBranch.create({
      data: {
        ...TEST_SEED_DATA.BRANCH,
        companyId: company.id,
      },
    });

    const companyAdmin = await this.db.user.create({
      data: {
        ...TEST_SEED_DATA.USERS.COMPANY_ADMIN,
        password: hashedPassword,
        companyId: company.id,
        isUsingDefaultPassword: true,
      },
    });

    const employeeSome = await this.db.user.create({
      data: {
        ...TEST_SEED_DATA.USERS.EMPLOYEE_SOME_PERMISSIONS,
        password: hashedPassword,
        companyId: company.id,
        isUsingDefaultPassword: true,
      },
    });

    const employeeAll = await this.db.user.create({
      data: {
        ...TEST_SEED_DATA.USERS.EMPLOYEE_ALL_PERMISSIONS,
        password: hashedPassword,
        companyId: company.id,
        isUsingDefaultPassword: true,
      },
    });

    await this.db.userBranch.create({
      data: {
        userId: employeeSome.id,
        branchId: branch.id,
        readUsers: true,
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
        createServices: false,
        updateServices: false,
        deleteServices: false,
        readProductionLines: true,
        createProductionLines: false,
        updateProductionLines: false,
        deleteProductionLines: false,
      },
    });

    await this.db.userBranch.create({
      data: {
        userId: employeeAll.id,
        branchId: branch.id,
        readUsers: true,
        createUsers: true,
        updateUsers: true,
        deleteUsers: true,
        manageUserPermissions: true,
        assignUsersToBranches: true,
        readBranches: true,
        updateBranches: true,
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

    return {
      sysAdmin,
      company,
      branch,
      users: { companyAdmin, employeeSome, employeeAll },
    };
  }

  async cleanup() {
    await this.db.userBranch.deleteMany({});
    await this.db.user.deleteMany({});
    await this.db.companyBranch.deleteMany({});
    await this.db.company.deleteMany({});
    await this.db.sysAdmin.deleteMany({});
  }
}
