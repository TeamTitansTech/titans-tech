'use server';
import { responseHandler } from '@/data/helpers/responseHandler';
import { SysAdminResponseDto } from '@titans-tech/shared';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: SysAdminResponseDto;
}

export const loginSysAdmin = async (credentials: LoginCredentials) => {
  return await responseHandler<LoginResponse>('/auth/login', {
    method: 'POST',
    body: credentials,
  });
};
