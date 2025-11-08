import { IsString, IsArray, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

class MachineFieldDto {
  @IsString()
  @IsNotEmpty()
  fieldSlug: string;

  @IsString()
  @IsNotEmpty()
  value: string;
}

export class CreateMachineDto {
  @IsString()
  @IsNotEmpty()
  blueprintId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MachineFieldDto)
  fields: MachineFieldDto[];
}
