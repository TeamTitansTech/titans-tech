import { IsString, IsArray, IsNotEmpty, IsOptional, IsInt } from 'class-validator';

export class CreateProductionLineDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  branchId: string;

  @IsArray()
  @IsString({ each: true })
  machineIds: string[];

  @IsOptional()
  @IsString()
  createdBy?: string;
}
