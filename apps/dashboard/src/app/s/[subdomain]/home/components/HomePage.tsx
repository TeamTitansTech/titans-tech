'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Typography } from '@/components/ui/typography';
import { OverviewHeroSection } from './OverviewHeroSection';
import { RequiresAttention } from './RequiresAttention';
import { Next30DaysTimeline } from './Next30DaysTimeline';
import { RecentCompletedServices } from './RecentCompletedServices';
import { ServiceTrendsChart } from './ServiceTrendsChart';
import { ProductionLinesCarousel } from './ProductionLinesCarousel';
import { getServices, getLatestReport } from '@/data/services/services.api';
import { getMachines } from '@/data/services/machines.api';
import type { Machine } from '@/data/services/machines.api';
import { calculateStatusFromLatestReport, type AlertStatus } from '@/lib/alertStatus';
import type { LatestReport } from '@/data/types/services.types';
import { BrandedSkeleton } from '@/components/ui/branded-skeleton';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { format, subMonths, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { useCompanyUser } from '@/contexts/CompanyUserContext';
import { hasPermissionInAnyBranch } from '@titans-tech/shared/types';
import {
  ServiceType,
  ServiceStatus,
  type ServiceType as ServiceTypeEnum,
  type ServiceStatus as ServiceStatusEnum,
  type AlertSeverity as AlertSeverityEnum,
} from '@titans-tech/shared/enums';

interface Service {
  id: string;
  date: string;
  type: ServiceTypeEnum;
  status: ServiceStatusEnum;
  machine: {
    id: string;
    name: string;
    branch: {
      id: string;
      name: string;
      companyId: string;
    };
  };
}

interface Alert {
  id: string;
  machineName: string;
  machineId: string;
  severity: AlertSeverityEnum;
  message: string;
  createdAt: string;
}

interface MachineWithStatus extends Machine {
  latestReport?: LatestReport | null;
  alertStatus?: AlertStatus;
}

export function HomePage() {
  const t = useTranslations('dashboard.client');
  const { companyUser } = useCompanyUser();
  const [services, setServices] = useState<Service[]>([]);
  const [machines, setMachines] = useState<MachineWithStatus[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user has permission to view production lines
  const canViewProductionLines = hasPermissionInAnyBranch(companyUser, 'readProductionLines');

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [servicesResponse, machinesResponse] = await Promise.all([
          getServices(),
          getMachines(),
        ]);

        if (servicesResponse.data) {
          setServices(servicesResponse.data as unknown as Service[]);
        }

        if (machinesResponse.data) {
          const machinesData = machinesResponse.data as unknown as Machine[];

          // Fetch latest report for each machine
          const machinesWithStatus = await Promise.all(
            machinesData.map(async (machine) => {
              try {
                const reportResponse = await getLatestReport(machine.id);
                const latestReport = reportResponse.data || null;
                const alertStatus = calculateStatusFromLatestReport(latestReport);

                return {
                  ...machine,
                  latestReport,
                  alertStatus,
                };
              } catch (error) {
                console.error(error);
                return {
                  ...machine,
                  latestReport: null,
                  alertStatus: 'ok' as AlertStatus,
                };
              }
            }),
          );

          setMachines(machinesWithStatus);

          // Generate alerts from machines with critical or warning status
          const generatedAlerts: Alert[] = machinesWithStatus
            .filter((m) => m.alertStatus === 'critical' || m.alertStatus === 'warning')
            .map((m) => ({
              id: m.id,
              machineName: m.name,
              machineId: m.id,
              severity:
                m.alertStatus === 'critical'
                  ? ('RED' as AlertSeverityEnum)
                  : ('YELLOW' as AlertSeverityEnum),
              message: m.alertStatus === 'critical' ? 'Critical alert' : 'Warning alert',
              createdAt: new Date().toISOString(),
            }));
          setAlerts(generatedAlerts);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  // Calculate dashboard data
  const calculateDashboardData = () => {
    // Use real machines data
    const totalMachines = machines.length;

    // Calculate monthly trends for last 6 months
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(new Date(), i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      const monthLabel = format(monthDate, 'MMM');

      const monthServices = services.filter((service) => {
        const serviceDate = parseISO(service.date);
        return (
          service.status === ServiceStatus.COMPLETED &&
          serviceDate >= monthStart &&
          serviceDate <= monthEnd
        );
      });

      const inspections = monthServices.filter((s) => s.type === ServiceType.INSPECTION).length;
      const maintenance = monthServices.filter((s) => s.type === ServiceType.MAINTENANCE).length;

      monthlyData.push({
        month: monthLabel,
        inspections,
        maintenance,
        total: inspections + maintenance,
      });
    }

    // Get user's company ID and accessible branch IDs
    const userCompanyId = companyUser?.companyId;
    const userBranchIds = companyUser?.isCompanyAdmin
      ? null // Company admins can see all branches in their company
      : (companyUser?.branches?.map((b) => b.branchId) ?? []);

    // Get upcoming services (PENDING status, future dates, filtered by company and branches)
    const upcomingServices = services
      .filter((service) => {
        // Always filter by company (most important filter)
        if (userCompanyId && service.machine.branch.companyId !== userCompanyId) {
          return false;
        }
        // For non-company-admins, also filter by accessible branches
        if (userBranchIds !== null && !userBranchIds.includes(service.machine.branch.id)) {
          return false;
        }
        return service.status === ServiceStatus.PENDING && new Date(service.date) >= new Date();
      })
      .map((service) => ({
        id: service.id,
        machineName: service.machine.name,
        machineId: service.machine.id,
        branchName: service.machine.branch.name,
        date: service.date,
        type: service.type,
      }));

    // Get recent completed services (last 5, filtered by company)
    const recentCompletedServices = services
      .filter((service) => {
        // Filter by company
        if (userCompanyId && service.machine.branch.companyId !== userCompanyId) {
          return false;
        }
        // Filter by branches for non-company-admins
        if (userBranchIds !== null && !userBranchIds.includes(service.machine.branch.id)) {
          return false;
        }
        return service.status === ServiceStatus.COMPLETED;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
      .map((service) => ({
        id: service.id,
        machineName: service.machine.name,
        machineId: service.machine.id,
        date: service.date,
        type: service.type,
      }));

    return {
      totalMachines,
      upcomingServicesCount: upcomingServices.length,
      activeAlertsCount: alerts.length,
      monthlyTrends: monthlyData,
      upcomingServices,
      alerts: alerts,
      recentCompletedServices,
    };
  };

  const dashboardData = calculateDashboardData();

  if (isLoading) {
    return (
      <BrandedSkeleton>
        <div className="flex flex-col gap-6 p-6">
          {/* Header */}
          <div>
            <Skeleton className="h-9 w-40 mb-2" />
            <Skeleton className="h-5 w-72" />
          </div>

          {/* Overview Hero Section - 3 stat cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <Skeleton className="h-4 w-24 mb-3" />
                      <Skeleton className="h-8 w-12 mb-1" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-12 w-12 rounded-lg" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Production Lines Carousel */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-6 w-40" />
                </div>
                <Skeleton className="h-5 w-20" />
              </div>
              <div className="space-y-4">
                <Skeleton className="h-6 w-48 mb-2" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                      <Skeleton className="aspect-video w-full" />
                      <CardContent className="pt-3">
                        <Skeleton className="h-4 w-3/4 mb-2" />
                        <div className="flex gap-1">
                          {[...Array(4)].map((_, j) => (
                            <Skeleton key={j} className="h-2 w-2 rounded-full" />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next 30 Days + Recent Completed Services */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardContent className="pt-6">
                <Skeleton className="h-6 w-40 mb-4" />
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-3/4 mb-1" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <Skeleton className="h-6 w-48 mb-4" />
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Service Trends Chart */}
          <Card>
            <CardContent className="pt-6">
              <Skeleton className="h-6 w-48 mb-4" />
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </BrandedSkeleton>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div>
        <Typography variant="h1" className="text-3xl font-bold text-foreground">
          {t('title')}
        </Typography>
        <Typography variant="muted" className="mt-1">
          {t('description')}
        </Typography>
      </div>

      {/* Overview Hero Section */}
      <OverviewHeroSection
        totalMachines={dashboardData.totalMachines}
        upcomingServicesCount={dashboardData.upcomingServicesCount}
        activeAlertsCount={dashboardData.activeAlertsCount}
      />

      {/* Requires Attention - Only shows when there are alerts */}
      <RequiresAttention alerts={dashboardData.alerts} />

      {/* Production Lines Carousel - Only show if user has permission */}
      {canViewProductionLines && <ProductionLinesCarousel />}

      {/* Next 30 Days + Recent Completed Services */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Next30DaysTimeline services={dashboardData.upcomingServices} />
        <RecentCompletedServices services={dashboardData.recentCompletedServices} />
      </div>

      {/* Service Trends Chart */}
      <ServiceTrendsChart data={dashboardData.monthlyTrends} />
    </div>
  );
}
