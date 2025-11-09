'use server';
import { responseHandler } from '@/data/helpers/responseHandler';
import { SysAdminCreateUserDto, UpdateUserDto, UserResponseDto } from '@titans-tech/shared';

export const getAllUsers = async (args?: { companyId?: string }) => {
  return await responseHandler<UserResponseDto[]>('/companies/users', {
    method: 'GET',
    companyId: args?.companyId,
  });
};

export const createUser = async (args: { companyId?: string; data: SysAdminCreateUserDto }) => {
  return await responseHandler<UserResponseDto>('/companies/users', {
    method: 'POST',
    body: args.data,
    companyId: args.companyId,
  });
};

export const updateUser = async (args: {
  companyId?: string;
  userId: string;
  data: UpdateUserDto;
}) => {
  return await responseHandler<UserResponseDto>(`/companies/users/${args.userId}`, {
    method: 'PATCH',
    body: args.data,
    companyId: args.companyId,
  });
};

export const deleteUser = async (args: { companyId?: string; userId: string }) => {
  return await responseHandler<void>(`/companies/users/${args.userId}`, {
    method: 'DELETE',
    companyId: args.companyId,
  });
};
