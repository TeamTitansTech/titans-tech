import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Request,
  Query,
} from '@nestjs/common';
import { PermissionTemplatesService } from './permission-templates.service';
import {
  CreatePermissionTemplateDto,
  UpdatePermissionTemplateDto,
  PermissionTemplateResponseDto,
} from '@titans-tech/shared/backend-dtos';
import { Authenticated } from '../auth/auth.decorators';
import { ReqWithAuthUser } from '../../types/request';

@Controller('permission-templates')
export class PermissionTemplatesController {
  constructor(
    private readonly permissionTemplatesService: PermissionTemplatesService,
  ) {}

  @Authenticated()
  @Post()
  create(
    @Request() req: ReqWithAuthUser,
    @Body() createDto: CreatePermissionTemplateDto,
  ): Promise<PermissionTemplateResponseDto> {
    return this.permissionTemplatesService.create(req.user, createDto);
  }

  @Authenticated()
  @Get()
  findAllByCompany(
    @Request() req: ReqWithAuthUser,
    @Query('companyId') companyId: string,
  ): Promise<PermissionTemplateResponseDto[]> {
    return this.permissionTemplatesService.findAllByCompany(
      req.user,
      companyId,
    );
  }

  @Authenticated()
  @Get(':id')
  findOne(
    @Request() req: ReqWithAuthUser,
    @Param('id') id: string,
  ): Promise<PermissionTemplateResponseDto> {
    return this.permissionTemplatesService.findOne(req.user, id);
  }

  @Authenticated()
  @Patch(':id')
  update(
    @Request() req: ReqWithAuthUser,
    @Param('id') id: string,
    @Body() updateDto: UpdatePermissionTemplateDto,
  ): Promise<PermissionTemplateResponseDto> {
    return this.permissionTemplatesService.update(req.user, id, updateDto);
  }

  @Authenticated()
  @Delete(':id')
  remove(
    @Request() req: ReqWithAuthUser,
    @Param('id') id: string,
  ): Promise<void> {
    return this.permissionTemplatesService.remove(req.user, id);
  }
}
