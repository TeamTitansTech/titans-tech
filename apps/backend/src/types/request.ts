import { Request } from 'express';

export interface UserJwtPayload {
  id: string;
  companyId: string;
  isSysAdmin: false;
}

export interface SysAdminJwtPayload {
  id: string;
  isSysAdmin: true;
}

export type JwtPayload = UserJwtPayload | SysAdminJwtPayload;

export function isRegularUser(payload: JwtPayload): payload is UserJwtPayload {
  return !payload.isSysAdmin;
}

export function isSysAdmin(payload: JwtPayload): payload is SysAdminJwtPayload {
  return payload.isSysAdmin === true;
}

export interface PasswordResetUserPayload {
  userId: string;
  companyId: string;
  email: string;
  tokenId: string;
  type: 'USER';
}

export interface PasswordResetSysAdminPayload {
  sysAdminId: string;
  email: string;
  tokenId: string;
  type: 'SYSADMIN';
}

export type PasswordResetPayload =
  | PasswordResetUserPayload
  | PasswordResetSysAdminPayload;

export function isPasswordResetUser(
  payload: PasswordResetPayload,
): payload is PasswordResetUserPayload {
  return payload.type === 'USER';
}

export function isPasswordResetSysAdmin(
  payload: PasswordResetPayload,
): payload is PasswordResetSysAdminPayload {
  return payload.type === 'SYSADMIN';
}

export interface ActivationUserPayload {
  userId: string;
  companyId: string;
  email: string;
  tokenId: string;
  type: 'USER_ACTIVATION';
}

export interface ActivationSysAdminPayload {
  sysAdminId: string;
  email: string;
  tokenId: string;
  type: 'SYSADMIN_ACTIVATION';
}

export type ActivationPayload =
  | ActivationUserPayload
  | ActivationSysAdminPayload;

export function isActivationUser(
  payload: ActivationPayload,
): payload is ActivationUserPayload {
  return payload.type === 'USER_ACTIVATION';
}

export function isActivationSysAdmin(
  payload: ActivationPayload,
): payload is ActivationSysAdminPayload {
  return payload.type === 'SYSADMIN_ACTIVATION';
}

export interface ReqWithAuthUser extends Request {
  user: JwtPayload;
  /** Branch ID resolved from resource by @ResourcePermission decorator */
  resolvedBranchId?: string;
}
