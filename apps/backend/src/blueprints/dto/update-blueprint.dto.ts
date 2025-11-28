import {
  IsString,
  IsArray,
  ValidateNested,
  IsEnum,
  IsOptional,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ServiceSection } from '@titans-tech/db';

class BlueprintFieldDto {
  @IsString()
  fieldName: string;

  @IsString()
  fieldSlug: string;

  @IsString()
  fieldType: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  fieldOptions?: string[];
}

export class UpdateBlueprintDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BlueprintFieldDto)
  fields?: BlueprintFieldDto[];

  @IsOptional()
  @IsArray()
  @IsEnum(ServiceSection, { each: true })
  sections?: ServiceSection[];
}
