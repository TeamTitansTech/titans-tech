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

export interface ReqWithAuthUser extends Request {
  user: JwtPayload;
  /** Branch ID resolved from resource by @ResourcePermission decorator */
  resolvedBranchId?: string;
}
