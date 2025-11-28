import { Module } from '@nestjs/common';
import { BlueprintsService } from './blueprints.service';
import { BlueprintsController } from './blueprints.controller';
import { AlertsModule } from '../alerts/alerts.module';

@Module({
  imports: [AlertsModule],
  controllers: [BlueprintsController],
  providers: [BlueprintsService],
  exports: [BlueprintsService],
})
export class BlueprintsModule {}
