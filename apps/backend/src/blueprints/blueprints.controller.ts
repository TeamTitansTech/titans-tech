import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { BlueprintsService } from './blueprints.service';
import { CreateBlueprintDto } from './dto/create-blueprint.dto';
import { Public } from 'src/modules/auth/auth.decorators';

@Controller('blueprints')
export class BlueprintsController {
  constructor(private readonly blueprintsService: BlueprintsService) {}

  @Public()
  @Post()
  create(@Body() createBlueprintDto: CreateBlueprintDto) {
    return this.blueprintsService.create(createBlueprintDto);
  }

  @Public()
  @Get()
  findAll() {
    return this.blueprintsService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.blueprintsService.findOne(id);
  }

  @Public()
  @Delete(':id')
  softDelete(@Param('id') id: string) {
    return this.blueprintsService.softDelete(id);
  }
}
