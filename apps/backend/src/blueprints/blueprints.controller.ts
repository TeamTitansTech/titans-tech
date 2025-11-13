import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { Prisma } from '@titans-tech/db';
import { BlueprintsService } from './blueprints.service';
import { CreateBlueprintDto } from './dto/create-blueprint.dto';
import { CreateBlueprintWithThresholdsDto } from '@titans-tech/shared';
import { Admin, Authenticated } from 'src/modules/auth/auth.decorators';

@Controller('blueprints')
export class BlueprintsController {
  constructor(private readonly blueprintsService: BlueprintsService) {}

  @Admin()
  @Post()
  create(
    @Body()
    createBlueprintDto: CreateBlueprintDto | CreateBlueprintWithThresholdsDto,
  ): Promise<Prisma.BlueprintGetPayload<object>> {
    return this.blueprintsService.create(createBlueprintDto);
  }

  @Authenticated()
  @Get()
  findAll(): Promise<
    Prisma.BlueprintGetPayload<{
      include: { _count: { select: { machines: true } } };
    }>[]
  > {
    return this.blueprintsService.findAll();
  }

  @Authenticated()
  @Get(':id')
  findOne(@Param('id') id: string): Promise<
    Prisma.BlueprintGetPayload<{
      include: { machines: { include: { fields: true } } };
    }>
  > {
    return this.blueprintsService.findOne(id);
  }

  @Admin()
  @Delete(':id')
  softDelete(
    @Param('id') id: string,
  ): Promise<Prisma.BlueprintGetPayload<object>> {
    return this.blueprintsService.softDelete(id);
  }
}
