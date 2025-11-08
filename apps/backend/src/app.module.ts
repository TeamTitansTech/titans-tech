import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BlueprintsModule } from './blueprints/blueprints.module';
import { MachinesModule } from './machines/machines.module';
import { InspectionsModule } from './inspections/inspections.module';

@Module({
  imports: [BlueprintsModule, MachinesModule, InspectionsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
