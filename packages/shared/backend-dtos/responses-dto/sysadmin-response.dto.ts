import { Exclude } from 'class-transformer';

export class SysAdminResponseDto {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  unreadNotifications?: number;

  @Exclude()
  password: string;

  constructor(partial: Partial<SysAdminResponseDto>) {
    Object.assign(this, partial);
  }
}
