import { Exclude, Type } from 'class-transformer';
import type { Permissions } from '../../types/permissions';

export type MeasurementUnit = 'INCHES' | 'MM';

export class CompanyBranchDto {
  id: string;
  name: string;
  isMainBranch: boolean;
  location?: string | null;
  defaultMeasurementUnit: MeasurementUnit;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<CompanyBranchDto>) {
    Object.assign(this, partial);
  }
}

export class UserBranchDto implements Permissions {
  userId: string;
  branchId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;

  // User Management Permissions
  readUsers: boolean;
  createUsers: boolean;
  updateUsers: boolean;
  deleteUsers: boolean;
  manageUserPermissions: boolean;
  assignUsersToBranches: boolean;

  // Branch Management Permissions
  readBranches: boolean;
  updateBranches: boolean;

  // Machine Permissions
  readMachines: boolean;
  createMachines: boolean;
  updateMachines: boolean;
  deleteMachines: boolean;

  // Service Permissions
  readServices: boolean;
  createServices: boolean;
  updateServices: boolean;
  deleteServices: boolean;

  // Production Line Permissions
  readProductionLines: boolean;
  createProductionLines: boolean;
  updateProductionLines: boolean;
  deleteProductionLines: boolean;

  @Type(() => CompanyBranchDto)
  branch: CompanyBranchDto;

  constructor(partial: Partial<UserBranchDto>) {
    Object.assign(this, partial);
    if (partial.branch) {
      this.branch = new CompanyBranchDto(partial.branch);
    }
  }
}

export class UserResponseDto {
  id: string;
  name: string | null;
  email: string;
  isCompanyAdmin: boolean;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  unreadNotifications?: number;
  pendingActivation?: boolean;

  @Exclude()
  password?: string;

  @Type(() => UserBranchDto)
  branches: UserBranchDto[];

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
    if (partial.branches) {
      this.branches = partial.branches.map((branch) => new UserBranchDto(branch));
    }
    // Explicitly remove password
    delete this.password;
  }
}
