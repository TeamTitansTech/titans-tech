import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../shared/prisma.service';
import { companiesService } from '@titans-tech/shared/services';
import {
  CreateCompanyDto,
  UpdateCompanyDto,
  AdminManagerUserResponseDto,
} from '@titans-tech/shared/backend-dtos';
import { FieldsErr } from '../../errors/err';

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return companiesService.findAll(this.prisma);
  }

  async findOne(id: string) {
    const company = await companiesService.findOne(this.prisma, id);
    if (!company) throw new NotFoundException('Company not found');
    return company;
  }

  async getCompanyPublicInfo(companySlug: string) {
    const company = await companiesService.getCompanyPublicInfo(
      this.prisma,
      companySlug,
    );
    if (!company) throw new NotFoundException('Company not found');
    return company;
  }

  async create(createCompanyDto: CreateCompanyDto) {
    try {
      return await companiesService.create(
        this.prisma,
        createCompanyDto as any,
      );
    } catch (err: any) {
      if (err?.type === 'FIELDS_ERR') {
        throw FieldsErr(err.payload);
      }
      throw err;
    }
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto) {
    try {
      const result = await companiesService.update(
        this.prisma,
        id,
        updateCompanyDto as any,
      );
      if (!result) throw new NotFoundException('Company not found');
      return result;
    } catch (err: any) {
      if (err?.type === 'FIELDS_ERR') throw FieldsErr(err.payload);
      throw err;
    }
  }

  async remove(id: string) {
    const result = await companiesService.remove(this.prisma, id);
    if (!result) throw new NotFoundException('Company not found');
    return { success: true };
  }

  async getAdminManagerUsers(
    companyId: string,
  ): Promise<AdminManagerUserResponseDto[]> {
    return companiesService.getAdminManagerUsers(
      this.prisma,
      companyId,
    ) as Promise<AdminManagerUserResponseDto[]>;
  }
}
