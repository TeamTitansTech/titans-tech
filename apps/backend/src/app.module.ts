import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BlueprintsModule } from './blueprints/blueprints.module';
import { MachinesModule } from './machines/machines.module';
import { ServicesModule } from './services/services.module';
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
import { ProductionLinesModule } from './production-lines/production-lines.module';
import { PermissionTemplatesModule } from './permission-templates/permission-templates.module';

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
    AlertsModule,
    EmailModule,
    NotificationsModule,
    TasksModule,
    ProductionLinesModule,
    PermissionTemplatesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
