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
  UpdateNodePositionsDto,
  updateNodePositionsSchema,
  UpdateEdgesDto,
  updateEdgesSchema,
} from '@titans-tech/shared/backend-dtos';
import { ZodValidationPipe } from '../../errors/zod-validation.pipe';
import {
  Authenticated,
  BranchPermission,
  ResourcePermission,
} from '../auth/auth.decorators';
import { ReqWithAuthUser, isSysAdmin } from '../../types/request';

@Controller('production-lines')
export class ProductionLinesController {
  constructor(
    private readonly productionLinesService: ProductionLinesService,
  ) {}

  /**
   * Helper to dispatch operations based on user type
   * @param user - The authenticated user from the request
   * @param sysAdminAction - Action to execute for SysAdmin users
   * @param userAction - Action to execute for regular users (receives userId)
   */
  private dispatchByUserType<T>(
    user: ReqWithAuthUser['user'],
    sysAdminAction: () => T,
    userAction: (userId: string) => T,
  ): T {
    if (isSysAdmin(user)) {
      return sysAdminAction();
    }
    return userAction(user.id);
  }

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
    return this.dispatchByUserType(
      req.user,
      () => this.productionLinesService.findAllForSysAdmin(),
      (userId) => this.productionLinesService.findAll(userId),
    );
  }

  @ResourcePermission('productionLine', 'readProductionLines')
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
    return this.dispatchByUserType(
      req.user,
      () => this.productionLinesService.findOneForSysAdmin(id),
      (userId) => this.productionLinesService.findOne(userId, id),
    );
  }

  @ResourcePermission('productionLine', 'updateProductionLines')
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
    return this.dispatchByUserType(
      req.user,
      () =>
        this.productionLinesService.updateForSysAdmin(
          id,
          updateProductionLineDto,
        ),
      (userId) =>
        this.productionLinesService.update(userId, id, updateProductionLineDto),
    );
  }

  @ResourcePermission('productionLine', 'deleteProductionLines')
  @Delete(':id')
  remove(
    @Request() req: ReqWithAuthUser,
    @Param('id') id: string,
  ): Promise<void> {
    return this.dispatchByUserType(
      req.user,
      () => this.productionLinesService.removeForSysAdmin(id),
      (userId) => this.productionLinesService.remove(userId, id),
    );
  }

  /**
   * Update node positions for React Flow canvas
   * Requires updateProductionLines permission
   */
  @ResourcePermission('productionLine', 'updateProductionLines')
  @Patch(':id/positions')
  updatePositions(
    @Request() req: ReqWithAuthUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateNodePositionsSchema))
    updateNodePositionsDto: UpdateNodePositionsDto,
  ) {
    return this.dispatchByUserType(
      req.user,
      () =>
        this.productionLinesService.updateNodePositions(
          id,
          updateNodePositionsDto,
        ),
      (userId) =>
        this.productionLinesService.updateNodePositionsForUser(
          userId,
          id,
          updateNodePositionsDto,
        ),
    );
  }

  /**
   * Update edges for React Flow canvas (bulk replace)
   * Requires updateProductionLines permission
   */
  @ResourcePermission('productionLine', 'updateProductionLines')
  @Patch(':id/edges')
  updateEdges(
    @Request() req: ReqWithAuthUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateEdgesSchema))
    updateEdgesDto: UpdateEdgesDto,
  ) {
    return this.dispatchByUserType(
      req.user,
      () => this.productionLinesService.updateEdges(id, updateEdgesDto),
      (userId) =>
        this.productionLinesService.updateEdgesForUser(
          userId,
          id,
          updateEdgesDto,
        ),
    );
  }
}
