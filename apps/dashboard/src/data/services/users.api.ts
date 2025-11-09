'use server';
import { responseHandler } from '@/data/helpers/responseHandler';
import { SysAdminCreateUserDto, UpdateUserDto, UserResponseDto } from '@titans-tech/shared';

export const getAllUsers = async (args: { companyId: string }) => {
  return await responseHandler<UserResponseDto[]>(`/companies/${args.companyId}/users`, {
    method: 'GET',
  });
};

export const createUser = async (args: { companyId: string; data: SysAdminCreateUserDto }) => {
  return await responseHandler<UserResponseDto>(`/companies/${args.companyId}/users`, {
    method: 'POST',
    body: args.data,
  });
};

export const updateUser = async (args: {
  companyId: string;
  userId: string;
  data: UpdateUserDto;
}) => {
  return await responseHandler<UserResponseDto>(
    `/companies/${args.companyId}/users/${args.userId}`,
    {
      method: 'PATCH',
      body: args.data,
    },
  );
};

export const deleteUser = async (args: { companyId: string; userId: string }) => {
  return await responseHandler<void>(`/companies/${args.companyId}/users/${args.userId}`, {
    method: 'DELETE',
  });
};
