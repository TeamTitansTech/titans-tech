import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BlueprintsModule } from './modules/blueprints/blueprints.module';
import { MachinesModule } from './modules/machines/machines.module';
import { ServicesModule } from './modules/services/services.module';
import { SharedModule } from './modules/shared/shared.module';
import { AuthModule } from './modules/auth/auth.module';
import { SysAdminModule } from './modules/sysadmin/sysadmin.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { CompanyBranchesModule } from './modules/company-branches/company-branches.module';
import { UsersModule } from './modules/users/users.module';
import { AlertsModule } from './modules/alerts/alerts.module';
import { UploadModule } from './modules/upload/upload.module';
import { EmailModule } from './modules/email/email.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { ProductionLinesModule } from './modules/production-lines/production-lines.module';
import { PermissionTemplatesModule } from './modules/permission-templates/permission-templates.module';
import { ServiceRequestsModule } from './modules/service-requests/service-requests.module';
import { PasswordResetModule } from './modules/password-reset/password-reset.module';
import { MachinePartsModule } from './modules/machine-parts/machine-parts.module';

@Module({
  imports: [
    SharedModule,
    AuthModule,
    PasswordResetModule,
    SysAdminModule,
    CompaniesModule,
    CompanyBranchesModule,
    UsersModule,
    UploadModule,
    BlueprintsModule,
    MachinesModule,
    ServicesModule,
    AlertsModule,
    EmailModule,
    NotificationsModule,
    TasksModule,
    ProductionLinesModule,
    PermissionTemplatesModule,
    ServiceRequestsModule,
    MachinePartsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
