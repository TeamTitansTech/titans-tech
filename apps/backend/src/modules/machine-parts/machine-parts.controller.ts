import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MachinePartsService } from './machine-parts.service';
import {
  CreateSubsectionDto,
  CreateSubsectionSchema,
  UpdateSubsectionDto,
  UpdateSubsectionSchema,
  UpdateSubsectionPartsDto,
  UpdateSubsectionPartsSchema,
  InitializePartsConfigDto,
  InitializePartsConfigSchema,
  PartsConfigResponseDto,
  SectionPartsResponseDto,
  SubsectionResponseDto,
} from '@titans-tech/shared/backend-dtos';
import { Admin, Authenticated } from '../auth/auth.decorators';
import { ZodValidationPipe } from '../../errors/zod-validation.pipe';

@Controller('machines/:machineId/parts')
export class MachinePartsController {
  constructor(private readonly machinePartsService: MachinePartsService) {}

  /**
   * Get machine parts configuration
   * Returns custom config or indicates fallback to defaults
   */
  @Authenticated()
  @Get()
  getPartsConfig(
    @Param('machineId') machineId: string,
  ): Promise<PartsConfigResponseDto> {
    return this.machinePartsService.getPartsConfig(machineId);
  }

  /**
   * Get parts for a specific section
   */
  @Authenticated()
  @Get('sections/:sectionKey')
  getSectionParts(
    @Param('machineId') machineId: string,
    @Param('sectionKey') sectionKey: string,
  ): Promise<SectionPartsResponseDto> {
    return this.machinePartsService.getSectionParts(machineId, sectionKey);
  }

  /**
   * Initialize custom config from defaults (SysAdmin only)
   */
  @Admin()
  @Post('initialize')
  initializeFromDefaults(
    @Param('machineId') machineId: string,
    @Body(new ZodValidationPipe(InitializePartsConfigSchema))
    dto: InitializePartsConfigDto,
  ): Promise<PartsConfigResponseDto> {
    return this.machinePartsService.initializeFromDefaults(machineId, dto);
  }

  /**
   * Create a new subsection (SysAdmin only)
   */
  @Admin()
  @Post('sections/:sectionKey/subsections')
  createSubsection(
    @Param('machineId') machineId: string,
    @Param('sectionKey') sectionKey: string,
    @Body(new ZodValidationPipe(CreateSubsectionSchema))
    dto: CreateSubsectionDto,
  ): Promise<SubsectionResponseDto> {
    return this.machinePartsService.createSubsection(
      machineId,
      sectionKey,
      dto,
    );
  }

  /**
   * Update a subsection (SysAdmin only)
   */
  @Admin()
  @Put('subsections/:subsectionId')
  updateSubsection(
    @Param('machineId') machineId: string,
    @Param('subsectionId') subsectionId: string,
    @Body(new ZodValidationPipe(UpdateSubsectionSchema))
    dto: UpdateSubsectionDto,
  ): Promise<SubsectionResponseDto> {
    return this.machinePartsService.updateSubsection(
      machineId,
      subsectionId,
      dto,
    );
  }

  /**
   * Delete a subsection (SysAdmin only)
   */
  @Admin()
  @Delete('subsections/:subsectionId')
  deleteSubsection(
    @Param('machineId') machineId: string,
    @Param('subsectionId') subsectionId: string,
  ): Promise<void> {
    return this.machinePartsService.deleteSubsection(machineId, subsectionId);
  }

  /**
   * Update parts in a subsection (SysAdmin only)
   */
  @Admin()
  @Put('subsections/:subsectionId/parts')
  updateSubsectionParts(
    @Param('machineId') machineId: string,
    @Param('subsectionId') subsectionId: string,
    @Body(new ZodValidationPipe(UpdateSubsectionPartsSchema))
    dto: UpdateSubsectionPartsDto,
  ): Promise<SubsectionResponseDto> {
    return this.machinePartsService.updateSubsectionParts(
      machineId,
      subsectionId,
      dto,
    );
  }

  /**
   * Upload diagram image for a subsection (SysAdmin only)
   */
  @Admin()
  @Post('subsections/:subsectionId/diagram')
  @UseInterceptors(FileInterceptor('file'))
  uploadDiagram(
    @Param('machineId') machineId: string,
    @Param('subsectionId') subsectionId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<SubsectionResponseDto> {
    return this.machinePartsService.uploadDiagram(
      machineId,
      subsectionId,
      file,
    );
  }

  /**
   * Reset section to defaults (SysAdmin only)
   * Deletes all custom subsections for this section
   */
  @Admin()
  @Delete('sections/:sectionKey')
  resetSectionToDefaults(
    @Param('machineId') machineId: string,
    @Param('sectionKey') sectionKey: string,
  ): Promise<SectionPartsResponseDto> {
    return this.machinePartsService.resetSectionToDefaults(
      machineId,
      sectionKey,
    );
  }
}
