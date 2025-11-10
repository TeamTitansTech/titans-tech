'use server';
import { responseHandler } from '@/data/helpers/responseHandler';
import { SysAdminResponseDto, UpdatePasswordDto, UserResponseDto } from '@titans-tech/shared';
import { deleteCookie } from '@/lib/cookies';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: SysAdminResponseDto;
}

export interface CompanyUserLoginResponse {
  accessToken: string;
  user: UserResponseDto;
}

export const loginSysAdmin = async (credentials: LoginCredentials) => {
  return await responseHandler<LoginResponse>('/auth/admin/login', {
    method: 'POST',
    body: credentials,
  });
};

export const loginCompanyUser = async (credentials: LoginCredentials) => {
  return await responseHandler<CompanyUserLoginResponse>('/users/login', {
    method: 'POST',
    body: credentials,
  });
};

export const updateSysAdminPassword = async (data: UpdatePasswordDto) => {
  return await responseHandler<void>('/auth/admin/update-password', {
    method: 'POST',
    body: data,
  });
};

export const logout = async () => {
  await deleteCookie('auth_token');
};
