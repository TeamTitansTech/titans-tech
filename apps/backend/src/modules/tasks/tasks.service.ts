import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../shared/prisma.service';
import { EmailService } from '../email/email.service';
import { appEnv } from '../../config/env';
import { NotificationType } from '@titans-tech/db';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async handleServiceReminders() {
    this.logger.log('Running daily service reminder job...');

    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      const machinesNeedingService = await this.prisma.machine.findMany({
        where: {
          OR: [
            {
              services: {
                none: {},
              },
            },

            {
              services: {
                some: {
                  date: {
                    lte: thirtyDaysAgo,
                  },
                },
                none: {
                  date: {
                    gte: thirtyDaysAgo,
                  },
                },
              },
            },
          ],
        },
        include: {
          services: {
            orderBy: {
              date: 'desc',
            },
            take: 1,
          },
          branch: {
            include: {
              company: true,
              users: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      });

      this.logger.log(
        `Found ${machinesNeedingService.length} machines needing service reminders`,
      );

      for (const machine of machinesNeedingService) {
        const lastService = machine.services[0];
        const lastServiceDate = lastService?.date;

        let daysOverdue = 0;
        if (lastServiceDate) {
          const daysSinceLastService = Math.floor(
            (new Date().getTime() - lastServiceDate.getTime()) /
              (1000 * 60 * 60 * 24),
          );
          daysOverdue = Math.max(0, daysSinceLastService - 30);
        } else {
          daysOverdue = 0;
        }

        const notificationType =
          daysOverdue > 0
            ? NotificationType.SERVICE_OVERDUE
            : NotificationType.SERVICE_REMINDER;

        const branchUsers = machine.branch.users.map((ub) => ub.user);

        for (const user of branchUsers) {
          const existingNotification =
            await this.prisma.clientNotification.findFirst({
              where: {
                userId: user.id,
                machineId: machine.id,
                isRead: false,
                type: {
                  in: [
                    NotificationType.SERVICE_REMINDER,
                    NotificationType.SERVICE_OVERDUE,
                  ],
                },
              },
            });

          if (existingNotification) {
            this.logger.debug(
              `User ${user.email} already has unread notification for machine ${machine.id}`,
            );
            continue;
          }

          const message =
            daysOverdue > 0
              ? `Machine "${machine.name}" is overdue for service by ${daysOverdue} days.`
              : `Machine "${machine.name}" is due for service.`;

          const companySlug = machine.branch.company.slug;
          const redirectUrl = `${appEnv.FRONTEND_URL}/s/${companySlug}/machines/${machine.id}`;

          await this.prisma.clientNotification.create({
            data: {
              userId: user.id,
              machineId: machine.id,
              message,
              type: notificationType,
              redirectUrl,
              metadata: {
                lastServiceDate: lastServiceDate?.toISOString() || null,
                daysOverdue,
              },
            },
          });

          try {
            await this.emailService.sendClientReminderEmail(
              user.email,
              {
                userName: user.name || user.email,
                machineName: machine.name,
                branchName: machine.branch.name,
                lastServiceDate: lastServiceDate
                  ? lastServiceDate.toLocaleDateString()
                  : undefined,
                daysOverdue: daysOverdue > 0 ? daysOverdue : undefined,
                machineUrl: redirectUrl,
              },
              machine.id,
            );

            this.logger.debug(
              `Sent service reminder email to ${user.email} for machine ${machine.id}`,
            );
          } catch (error) {
            this.logger.error(
              `Failed to send service reminder email to ${user.email}`,
              error,
            );
          }
        }
      }

      this.logger.log('Daily service reminder job completed successfully');
    } catch (error) {
      this.logger.error('Error in daily service reminder job', error);
    }
  }

  @Cron(CronExpression.EVERY_WEEK)
  async retryFailedEmails() {
    this.logger.log('Running weekly failed email retry job...');

    try {
      const successCount = await this.emailService.retryFailedEmails(50);
      this.logger.log(
        `Weekly failed email retry job completed. ${successCount} emails retried successfully.`,
      );
    } catch (error) {
      this.logger.error('Error in weekly failed email retry job', error);
    }
  }

  async triggerServiceRemindersManually() {
    this.logger.log('Manually triggering service reminder job...');
    await this.handleServiceReminders();
  }
}
