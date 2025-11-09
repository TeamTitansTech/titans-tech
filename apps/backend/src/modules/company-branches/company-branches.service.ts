import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../shared/prisma.service';
import {
  CreateCompanyBranchDto,
  UpdateCompanyBranchDto,
} from '@titans-tech/shared';

@Injectable()
export class CompanyBranchesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(companyId: string) {
    return this.prisma.companyBranch.findMany({
      where: { companyId },
    });
  }

  async findOne(id: string, companyId: string) {
    const branch = await this.prisma.companyBranch.findFirst({
      where: { id, companyId },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    return branch;
  }

  async create(companyId: string, createBranchDto: CreateCompanyBranchDto) {
    return this.prisma.companyBranch.create({
      data: {
        ...createBranchDto,
        companyId,
      },
    });
  }

  async update(
    id: string,
    companyId: string,
    updateBranchDto: UpdateCompanyBranchDto,
  ) {
    const branch = await this.prisma.companyBranch.findFirst({
      where: { id, companyId },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    return this.prisma.companyBranch.update({
      where: { id },
      data: updateBranchDto,
    });
  }

  async remove(id: string, companyId: string) {
    const branch = await this.prisma.companyBranch.findFirst({
      where: { id, companyId },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    await this.prisma.companyBranch.delete({
      where: { id },
    });

    return { success: true };
  }
}
