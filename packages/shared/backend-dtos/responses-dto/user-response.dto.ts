import { Exclude, Type } from 'class-transformer';

export class CompanyBranchDto {
  id: string;
  name: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<CompanyBranchDto>) {
    Object.assign(this, partial);
  }
}

export class UserBranchDto {
  userId: string;
  branchId: string;
  createdAt: Date;
  updatedAt: Date;

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

  // Blueprint Permissions
  readBlueprints: boolean;
  createBlueprints: boolean;
  updateBlueprints: boolean;
  deleteBlueprints: boolean;

  // Machine Permissions
  readMachines: boolean;
  createMachines: boolean;
  updateMachines: boolean;
  deleteMachines: boolean;

  // Inspection Permissions
  readInspections: boolean;
  createInspections: boolean;
  updateInspections: boolean;
  deleteInspections: boolean;

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
  isCompanyManager: boolean;
  isUsingDefaultPassword: boolean;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;

  @Exclude()
  password: string;

  @Type(() => UserBranchDto)
  branches: UserBranchDto[];

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
    if (partial.branches) {
      this.branches = partial.branches.map((branch) => new UserBranchDto(branch));
    }
  }
}
