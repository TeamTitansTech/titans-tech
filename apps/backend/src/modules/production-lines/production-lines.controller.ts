import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Request,
} from '@nestjs/common';
import { Prisma } from '@titans-tech/db';
import { ProductionLinesService } from './production-lines.service';
import {
  CreateProductionLineDto,
  createProductionLineSchema,
  UpdateProductionLineDto,
  updateProductionLineSchema,
} from '@titans-tech/shared/backend-dtos';
import { ZodValidationPipe } from '../../errors/zod-validation.pipe';
import { Authenticated, BranchPermission } from '../auth/auth.decorators';
import { ReqWithAuthUser, isSysAdmin } from '../../types/request';

@Controller('production-lines')
export class ProductionLinesController {
  constructor(
    private readonly productionLinesService: ProductionLinesService,
  ) {}

  /**
   * Create a new production line
   * Requires createProductionLines permission for the target branch (branchId in body)
   */
  @BranchPermission('createProductionLines')
  @Post()
  create(
    @Request() req: ReqWithAuthUser,
    @Body(new ZodValidationPipe(createProductionLineSchema))
    createProductionLineDto: CreateProductionLineDto,
  ): Promise<
    Prisma.ProductionLineGetPayload<{
      include: {
        branch: true;
        machines: { include: { machine: true } };
      };
    }>
  > {
    return this.productionLinesService.create(createProductionLineDto);
  }

  @Authenticated()
  @Get()
  findAll(@Request() req: ReqWithAuthUser): Promise<
    Prisma.ProductionLineGetPayload<{
      include: {
        branch: true;
        machines: { include: { machine: true } };
      };
    }>[]
  > {
    if (isSysAdmin(req.user)) {
      return this.productionLinesService.findAllForSysAdmin();
    }
    return this.productionLinesService.findAll(req.user.id);
  }

  @Authenticated()
  @Get(':id')
  findOne(
    @Request() req: ReqWithAuthUser,
    @Param('id') id: string,
  ): Promise<
    Prisma.ProductionLineGetPayload<{
      include: {
        branch: true;
        machines: { include: { machine: { include: { blueprint: true } } } };
      };
    }>
  > {
    if (isSysAdmin(req.user)) {
      return this.productionLinesService.findOneForSysAdmin(id);
    }
    return this.productionLinesService.findOne(req.user.id, id);
  }

  @Authenticated()
  @Patch(':id')
  update(
    @Request() req: ReqWithAuthUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateProductionLineSchema))
    updateProductionLineDto: UpdateProductionLineDto,
  ): Promise<
    Prisma.ProductionLineGetPayload<{
      include: {
        branch: true;
        machines: {
          include: { machine: { include: { blueprint: true; fields: true } } };
        };
      };
    }>
  > {
    if (isSysAdmin(req.user)) {
      return this.productionLinesService.updateForSysAdmin(
        id,
        updateProductionLineDto,
      );
    }
    return this.productionLinesService.update(
      req.user.id,
      id,
      updateProductionLineDto,
    );
  }

  @Authenticated()
  @Delete(':id')
  remove(
    @Request() req: ReqWithAuthUser,
    @Param('id') id: string,
  ): Promise<void> {
    if (isSysAdmin(req.user)) {
      return this.productionLinesService.removeForSysAdmin(id);
    }
    return this.productionLinesService.remove(req.user.id, id);
  }
}
