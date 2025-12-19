import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../shared/prisma.service';
import {
  companyBranchesService,
  type GetMachinesResult,
} from '@titans-tech/shared/services';
import {
  CreateCompanyBranchDto,
  UpdateCompanyBranchDto,
  SetUserPermissionsDto,
  UserResponseDto,
} from '@titans-tech/shared/backend-dtos';

@Injectable()
export class CompanyBranchesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all branches across all companies (SysAdmin only)
   */
  async findAll() {
    return companyBranchesService.findAll(this.prisma);
  }

  async findAllByCompany(companyId: string) {
    return companyBranchesService.findAllByCompany(this.prisma, companyId);
  }

  async findOne(id: string) {
    const branch = await companyBranchesService.findOne(this.prisma, id);
    if (!branch) throw new NotFoundException('Branch not found');
    return branch;
  }

  async create(companyId: string, createBranchDto: CreateCompanyBranchDto) {
    return companyBranchesService.create(
      this.prisma,
      companyId,
      createBranchDto,
    );
  }

  async update(id: string, updateBranchDto: UpdateCompanyBranchDto) {
    const result = await companyBranchesService.update(
      this.prisma,
      id,
      updateBranchDto,
    );
    if (!result) throw new NotFoundException('Branch not found');
    return result;
  }

  async remove(id: string) {
    const result = await companyBranchesService.remove(this.prisma, id);
    if (!result) throw new NotFoundException('Branch not found');
    return { success: true };
  }

  async getMachines(branchId: string): Promise<GetMachinesResult> {
    const machines = await companyBranchesService.getMachines(
      this.prisma,
      branchId,
    );
    if (!machines) throw new NotFoundException('Branch not found');
    return machines;
  }

  async setUserPermissions(
    branchId: string,
    userId: string,
    permissionsDto: SetUserPermissionsDto,
  ) {
    const updatedUser = await companyBranchesService.setUserPermissions(
      this.prisma,
      branchId,
      userId,
      permissionsDto,
    );
    if (!updatedUser)
      throw new NotFoundException('User is not assigned to this branch');
    return new UserResponseDto(updatedUser);
  }
}
