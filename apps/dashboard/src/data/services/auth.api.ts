'use server';
import { responseHandler } from '@/data/helpers/responseHandler';
import {
  SysAdminResponseDto,
  UpdatePasswordDto,
  UserResponseDto,
} from '@titans-tech/shared/backend-dtos';
import { deleteCookie } from '@/lib/cookies';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface CompanyUserLoginCredentials {
  email: string;
  password: string;
  companyId: string;
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

export const loginCompanyUser = async (credentials: CompanyUserLoginCredentials) => {
  const { companyId, ...loginData } = credentials;
  return await responseHandler<CompanyUserLoginResponse>(`/companies/${companyId}/login`, {
    method: 'POST',
    body: loginData,
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
  await deleteCookie('is_sys_panel');
};

export const getCurrentUser = async () => {
  return await responseHandler<UserResponseDto>('/users/me', {
    method: 'GET',
  });
};
