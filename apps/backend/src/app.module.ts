import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BlueprintsModule } from './blueprints/blueprints.module';
import { MachinesModule } from './machines/machines.module';
import { InspectionsModule } from './inspections/inspections.module';
import { SharedModule } from './modules/shared/shared.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    SharedModule,
    AuthModule,
    BlueprintsModule,
    MachinesModule,
    InspectionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
