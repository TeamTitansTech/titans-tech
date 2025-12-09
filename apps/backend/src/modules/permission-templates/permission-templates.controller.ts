import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { PermissionTemplatesService } from './permission-templates.service';
import {
  UpdatePermissionTemplateDto,
  PermissionTemplateResponseDto,
  CreatePermissionTemplateBodyDto,
} from '@titans-tech/shared/backend-dtos';
import { CompanyAdmin } from '../auth/auth.decorators';

@Controller('companies/:companyId/permission-templates')
export class PermissionTemplatesController {
  constructor(
    private readonly permissionTemplatesService: PermissionTemplatesService,
  ) {}

  @CompanyAdmin()
  @Post()
  create(
    @Param('companyId') companyId: string,
    @Body() createDto: CreatePermissionTemplateBodyDto,
  ): Promise<PermissionTemplateResponseDto> {
    return this.permissionTemplatesService.create(companyId, createDto);
  }

  @CompanyAdmin()
  @Get()
  findAllByCompany(
    @Param('companyId') companyId: string,
  ): Promise<PermissionTemplateResponseDto[]> {
    return this.permissionTemplatesService.findAllByCompany(companyId);
  }

  @CompanyAdmin()
  @Get(':id')
  findOne(
    @Param('companyId') companyId: string,
    @Param('id') id: string,
  ): Promise<PermissionTemplateResponseDto> {
    return this.permissionTemplatesService.findOne(companyId, id);
  }

  @CompanyAdmin()
  @Patch(':id')
  update(
    @Param('companyId') companyId: string,
    @Param('id') id: string,
    @Body() updateDto: UpdatePermissionTemplateDto,
  ): Promise<PermissionTemplateResponseDto> {
    return this.permissionTemplatesService.update(companyId, id, updateDto);
  }

  @CompanyAdmin()
  @Delete(':id')
  remove(
    @Param('companyId') companyId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.permissionTemplatesService.remove(companyId, id);
  }
}
