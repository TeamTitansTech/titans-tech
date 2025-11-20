import { UserResponseDto, SysAdminResponseDto } from '@titans-tech/shared/backend-dtos';

export interface CompanyUserContextType {
  companyUser: UserResponseDto | null;
  setCompanyUser: (user: UserResponseDto | null) => void;
}

export interface SysAdminContextType {
  sysAdminUser: SysAdminResponseDto | null;
  setSysAdminUser: (user: SysAdminResponseDto | null) => void;
}
