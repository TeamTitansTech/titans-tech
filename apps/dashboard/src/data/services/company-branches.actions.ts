'use server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { responseHandler } from '@/data/helpers/responseHandler';
import { CreateCompanyBranchDto, UpdateCompanyBranchDto } from '@titans-tech/shared/backend-dtos';
import { CompanyBranch } from './company-branches.api';

export const createBranch = async (args: { companyId: string; data: CreateCompanyBranchDto }) => {
  const result = await responseHandler<CompanyBranch>(`/companies/${args.companyId}/branches`, {
    method: 'POST',
    body: args.data,
  });

  if (!result.errors) {
    revalidateTag(`branches-${args.companyId}`, 'max');
    revalidatePath('/admin/companies', 'page');
    revalidatePath('/s/[subdomain]/settings', 'page');
  }

  return result;
};

export const updateBranch = async (args: { branchId: string; data: UpdateCompanyBranchDto }) => {
  const result = await responseHandler<CompanyBranch>(`/company-branches/${args.branchId}`, {
    method: 'PATCH',
    body: args.data,
  });

  if (!result.errors && result.data) {
    revalidateTag(`branches-${result.data.companyId}`, 'max');
    revalidatePath('/s/[subdomain]/settings', 'page');
  }

  return result;
};

export const deleteBranch = async (args: { branchId: string; companyId: string }) => {
  const result = await responseHandler<void>(`/company-branches/${args.branchId}`, {
    method: 'DELETE',
  });

  if (!result.errors) {
    revalidateTag(`branches-${args.companyId}`, 'max');
    revalidatePath('/admin/companies', 'page');
    revalidatePath('/s/[subdomain]/settings', 'page');
  }

  return result;
};
