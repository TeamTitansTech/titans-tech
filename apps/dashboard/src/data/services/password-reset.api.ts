'use server';
import { responseHandler } from '@/data/helpers/responseHandler';

export interface ForgotPasswordRequest {
  email: string;
  companyId?: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface SetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ValidateTokenResponse {
  valid: boolean;
  userId?: string;
  sysAdminId?: string;
}

export const forgotPassword = async (data: ForgotPasswordRequest) => {
  return await responseHandler<{ message: string }>('/password-reset/forgot-password', {
    method: 'POST',
    body: data,
  });
};

export const resetPassword = async (data: ResetPasswordRequest) => {
  return await responseHandler<{ message: string }>('/password-reset/reset-password', {
    method: 'POST',
    body: data,
  });
};

export const validateToken = async (token: string) => {
  return await responseHandler<ValidateTokenResponse>(`/password-reset/validate/${token}`, {
    method: 'GET',
  });
};

export const setPassword = async (data: SetPasswordRequest) => {
  return await responseHandler<{ message: string }>('/password-reset/set-password', {
    method: 'POST',
    body: data,
  });
};

export const resendActivation = async (userId: string) => {
  return await responseHandler<{ message: string }>(`/password-reset/resend-activation/${userId}`, {
    method: 'POST',
  });
};
