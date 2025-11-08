import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { BlueprintsService } from './blueprints.service';
import { CreateBlueprintDto } from './dto/create-blueprint.dto';

@Controller('blueprints')
export class BlueprintsController {
  constructor(private readonly blueprintsService: BlueprintsService) {}

  @Post()
  create(@Body() createBlueprintDto: CreateBlueprintDto) {
    return this.blueprintsService.create(createBlueprintDto);
  }

  @Get()
  findAll() {
    return this.blueprintsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.blueprintsService.findOne(id);
  }

  @Delete(':id')
  softDelete(@Param('id') id: string) {
    return this.blueprintsService.softDelete(id);
  }
}
