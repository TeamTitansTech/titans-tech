import { PrismaClient } from '@titans-tech/db';
import { ServiceSection, ServiceType, ServiceStatus } from '@titans-tech/db/enums';
import * as bcrypt from 'bcrypt';

export const TEST_SEED_DATA = {
  SYSADMIN: {
    id: 'test-sysadmin',
    email: 'admin-e2etest@admin.com',
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
    EMPLOYEE_NO_PERMISSIONS: {
      id: 'test-employee-none',
      email: 'nopermissions@test.com',
      name: 'Employee No Permissions',
      password: 'password',
      isCompanyAdmin: false,
    },
  },
  MACHINE: {
    P2H: 'test-machine-p2h',
  },
  BLUEPRINT: {
    P2H: {
      id: 'test-p2h-blueprint',
      name: 'P2H',
      sections: [
        ServiceSection.BEARING_CLEARANCE,
        ServiceSection.CLUTCH,
        ServiceSection.LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER,
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
          fieldName: 'Tonnage',
          fieldSlug: 'tonnage',
          fieldType: 'int',
        },
        {
          fieldName: 'Stroke',
          fieldSlug: 'stroke',
          fieldType: 'string',
        },
      ],
    },
  },
  SERVICES: {
    UPCOMING_INSPECTION: {
      id: 'test-service-upcoming',
      date: (() => {
        const twoDaysFromNow = new Date();
        twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
        return twoDaysFromNow.toISOString();
      })(), // Dynamic date: 2 days from today
      type: ServiceType.INSPECTION,
      status: ServiceStatus.PENDING,
      performedBy: 'test-employee-all',
      completedSections: '[]',
      selectedSections: JSON.stringify([
        ServiceSection.BEARING_CLEARANCE,
        ServiceSection.CLUTCH,
        ServiceSection.LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER,
      ]),
    },
    COMPLETED_INSPECTION: {
      id: 'test-service-completed',
      date: '2025-12-20T14:30:00.000Z', // Past date for completed
      type: ServiceType.INSPECTION,
      status: ServiceStatus.COMPLETED,
      performedBy: 'test-employee-all',
      completedSections: JSON.stringify([
        ServiceSection.BEARING_CLEARANCE,
        ServiceSection.CLUTCH,
        ServiceSection.LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER,
      ]),
      selectedSections: JSON.stringify([
        ServiceSection.BEARING_CLEARANCE,
        ServiceSection.CLUTCH,
        ServiceSection.LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER,
      ]),
    },
  },
};
export class TestSeeder {
  constructor(private db: PrismaClient) {}

  async seed() {
    const hashedPassword = await bcrypt.hash('password', 10);
    const sysAdmin = await this.db.sysAdmin.create({
      data: {
        id: TEST_SEED_DATA.SYSADMIN.id,
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

    const employeeNone = await this.db.user.create({
      data: {
        ...TEST_SEED_DATA.USERS.EMPLOYEE_NO_PERMISSIONS,
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

    await this.db.userBranch.create({
      data: {
        userId: employeeNone.id,
        branchId: branch.id,
        readUsers: false,
        createUsers: false,
        updateUsers: false,
        deleteUsers: false,
        manageUserPermissions: false,
        assignUsersToBranches: false,
        readBranches: false,
        updateBranches: false,
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

    // Create P2H Blueprint
    await this.db.blueprint.create({
      data: {
        ...TEST_SEED_DATA.BLUEPRINT.P2H,
      },
    });

    // Create a test machine for update/delete tests
    const machine = await this.db.machine.create({
      data: {
        id: 'test-machine-p2h',
        name: 'Existing P2H Machine',
        blueprintId: TEST_SEED_DATA.BLUEPRINT.P2H.id,
        branchId: branch.id,
        fields: {
          create: [
            {
              fieldSlug: 'serial_number',
              value: 'EXISTING001',
            },
            {
              fieldSlug: 'model_year',
              value: '2023',
            },
            {
              fieldSlug: 'tonnage',
              value: '150',
            },
            {
              fieldSlug: 'stroke',
              value: '2.0',
            },
          ],
        },
      },
    });

    // Create test services for service permission tests
    await this.db.machineService.create({
      data: {
        ...TEST_SEED_DATA.SERVICES.UPCOMING_INSPECTION,
        machineId: machine.id,
        date: new Date(TEST_SEED_DATA.SERVICES.UPCOMING_INSPECTION.date),
      },
    });

    await this.db.machineService.create({
      data: {
        ...TEST_SEED_DATA.SERVICES.COMPLETED_INSPECTION,
        machineId: machine.id,
        date: new Date(TEST_SEED_DATA.SERVICES.COMPLETED_INSPECTION.date),
      },
    });

    return {
      sysAdmin,
      company,
      branch,
      users: { companyAdmin, employeeSome, employeeAll, employeeNone },
    };
  }

  async cleanup() {
    // Delete in correct order due to foreign key constraints
    // 1. Delete all machine-related data first (most dependent)
    await this.db.machineService.deleteMany({});
    await this.db.machineField.deleteMany({});
    await this.db.machine.deleteMany({});

    // 2. Delete blueprint thresholds (depend on blueprints)
    await this.db.thresholdBearingClearance.deleteMany({});
    await this.db.thresholdBearingClearanceSingleHammer.deleteMany({});
    await this.db.thresholdClutch.deleteMany({});
    await this.db.thresholdSlideSingleHammer.deleteMany({});
    await this.db.thresholdSlideDoubleHammer.deleteMany({});
    await this.db.thresholdGibs.deleteMany({});
    await this.db.thresholdPistons.deleteMany({});
    await this.db.thresholdTramming.deleteMany({});

    // 3. Delete blueprints (referenced by machines)
    await this.db.blueprint.deleteMany({});

    // 4. Delete user-branch relationships
    await this.db.userBranch.deleteMany({});

    // 5. Delete users (depend on company)
    await this.db.user.deleteMany({});

    // 6. Delete company branches (depend on company)
    await this.db.companyBranch.deleteMany({});

    // 7. Delete permission templates (depend on company)
    await this.db.permissionTemplate.deleteMany({});

    // 8. Delete company (referenced by users, branches, permission templates)
    await this.db.company.deleteMany({});

    // 9. Delete sys admin (independent)
    await this.db.sysAdmin.deleteMany({});
  }
}
