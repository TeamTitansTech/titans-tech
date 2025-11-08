'use server';
import { responseHandler } from '@/data/helpers/responseHandler';
import { SysAdminResponseDto, UpdatePasswordDto } from '@titans-tech/shared';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: SysAdminResponseDto;
}

export const loginSysAdmin = async (credentials: LoginCredentials) => {
  return await responseHandler<LoginResponse>('/auth/admin/login', {
    method: 'POST',
    body: credentials,
  });
};

export const updateSysAdminPassword = async (data: UpdatePasswordDto) => {
  return await responseHandler<void>('/auth/admin/password', {
    method: 'PATCH',
    body: data,
  });
};
