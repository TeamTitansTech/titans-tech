import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BlueprintsModule } from './blueprints/blueprints.module';
import { MachinesModule } from './machines/machines.module';
import { ServicesModule } from './services/services.module';
import { ProductionLinesModule } from './production-lines/production-lines.module';
import { SharedModule } from './modules/shared/shared.module';
import { AuthModule } from './modules/auth/auth.module';
import { SysAdminModule } from './modules/sysadmin/sysadmin.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { CompanyBranchesModule } from './modules/company-branches/company-branches.module';
import { UsersModule } from './modules/users/users.module';
import { AlertsModule } from './modules/alerts/alerts.module';
import { EmailModule } from './modules/email/email.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { TasksModule } from './modules/tasks/tasks.module';

@Module({
  imports: [
    SharedModule,
    AuthModule,
    SysAdminModule,
    CompaniesModule,
    CompanyBranchesModule,
    UsersModule,
    BlueprintsModule,
    MachinesModule,
    ServicesModule,
    ProductionLinesModule,
    AlertsModule,
    EmailModule,
    NotificationsModule,
    TasksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
