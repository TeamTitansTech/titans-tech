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
import { CreateProductionLineDto } from './dto/create-production-line.dto';
import { UpdateProductionLineDto } from './dto/update-production-line.dto';
import { Authenticated, BranchPermission } from '../auth/auth.decorators';
import { ReqWithAuthUser } from '../../types/request';

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
    @Body() createProductionLineDto: CreateProductionLineDto,
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
    return this.productionLinesService.findOne(req.user.id, id);
  }

  @Authenticated()
  @Patch(':id')
  update(
    @Request() req: ReqWithAuthUser,
    @Param('id') id: string,
    @Body() updateProductionLineDto: UpdateProductionLineDto,
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
    return this.productionLinesService.remove(req.user.id, id);
  }
}
