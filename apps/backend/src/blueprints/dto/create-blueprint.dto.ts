import {
  IsString,
  IsArray,
  IsNotEmpty,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ServiceSection } from '@titans-tech/db';

class BlueprintFieldDto {
  @IsString()
  @IsNotEmpty()
  fieldName: string;

  @IsString()
  @IsNotEmpty()
  fieldSlug: string;

  @IsString()
  @IsNotEmpty()
  fieldType: string; // 'string', 'int', 'enum'

  @IsArray()
  @IsString({ each: true })
  fieldOptions?: string[]; // Required if fieldType is 'enum'
}

export class CreateBlueprintDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BlueprintFieldDto)
  fields: BlueprintFieldDto[];

  @IsArray()
  @IsEnum(ServiceSection, { each: true })
  sections: ServiceSection[];
}
