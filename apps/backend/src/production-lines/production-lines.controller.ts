import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { Prisma } from '@titans-tech/db';
import { ProductionLinesService } from './production-lines.service';
import { CreateProductionLineDto } from './dto/create-production-line.dto';
import { UpdateProductionLineDto } from './dto/update-production-line.dto';
import { Authenticated } from 'src/modules/auth/auth.decorators';

@Controller('production-lines')
export class ProductionLinesController {
  constructor(
    private readonly productionLinesService: ProductionLinesService,
  ) {}

  /**
   * POST /production-lines
   * Cria uma nova linha de produção
   */
  @Authenticated()
  @Post()
  create(
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

  /**
   * GET /production-lines
   * Busca todas as linhas de produção
   */
  @Authenticated()
  @Get()
  findAll(): Promise<
    Prisma.ProductionLineGetPayload<{
      include: {
        branch: true;
        machines: { include: { machine: true } };
      };
    }>[]
  > {
    return this.productionLinesService.findAll();
  }

  /**
   * GET /production-lines/:id
   * Busca uma linha de produção específica por ID
   */
  @Authenticated()
  @Get(':id')
  findOne(@Param('id') id: string): Promise<
    Prisma.ProductionLineGetPayload<{
      include: {
        branch: true;
        machines: { include: { machine: { include: { blueprint: true } } } };
      };
    }>
  > {
    return this.productionLinesService.findOne(id);
  }

  /**
   * PATCH /production-lines/:id
   * Atualiza uma linha de produção existente
   */
  @Authenticated()
  @Patch(':id')
  update(
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
    return this.productionLinesService.update(id, updateProductionLineDto);
  }

  /**
   * DELETE /production-lines/:id
   * Deleta uma linha de produção
   */
  @Authenticated()
  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.productionLinesService.remove(id);
  }
}
