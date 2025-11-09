import { Exclude } from 'class-transformer';

export class SysAdminResponseDto {
  id: string;
  email: string;
  isUsingDefaultPassword: boolean;
  createdAt: Date;
  updatedAt: Date;

  @Exclude()
  password: string;

  constructor(partial: Partial<SysAdminResponseDto>) {
    Object.assign(this, partial);
  }
}
