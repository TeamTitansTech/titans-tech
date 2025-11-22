import { IsString, IsArray, IsOptional, IsNotEmpty } from 'class-validator';

export class UpdateProductionLineDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  machineIds?: string[];
}
