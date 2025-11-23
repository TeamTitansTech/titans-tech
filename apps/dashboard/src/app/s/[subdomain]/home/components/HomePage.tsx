'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Typography } from '@/components/ui/typography';
import { OverviewHeroSection } from './OverviewHeroSection';
import { RequiresAttention } from './RequiresAttention';
import { Next7DaysTimeline } from './Next7DaysTimeline';
import { MonthPerformance } from './MonthPerformance';
import { MachineHealthGrid } from './MachineHealthGrid';
import { ServiceTrendsChart } from './ServiceTrendsChart';
import { ProductionLinesCarousel } from './ProductionLinesCarousel';
import { getServices } from '@/data/services/services.api';
import { getMachines } from '@/data/services/machines.api';
import { Loader2 } from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import {
  ServiceType,
  ServiceStatus,
  AlertSeverity,
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
    };
  };
}

interface Machine {
  id: string;
  name: string;
  branchId: string;
}

interface Alert {
  id: string;
  machineName: string;
  machineId: string;
  severity: AlertSeverityEnum;
  message: string;
  createdAt: string;
}

export function HomePage() {
  const t = useTranslations('dashboard.client');
  const [services, setServices] = useState<Service[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
          setMachines(machinesResponse.data as unknown as Machine[]);
        }

        // TODO: Fetch alerts from alerts API when available
        // For now, we'll generate mock alerts based on service data
        const mockAlerts: Alert[] = [];
        setAlerts(mockAlerts);
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

    // Calculate alert counts from real alerts
    const criticalCount = alerts.filter((alert) => alert.severity === AlertSeverity.RED).length;
    const warningCount = alerts.filter((alert) => alert.severity === AlertSeverity.YELLOW).length;

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

    // Get upcoming services (PENDING status, future dates)
    const upcomingServices = services
      .filter((service) => {
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

    // Calculate current month performance
    const currentMonthStart = startOfMonth(new Date());
    const currentMonthEnd = endOfMonth(new Date());
    const currentMonthServices = services.filter((service) => {
      const serviceDate = parseISO(service.date);
      return (
        service.status === ServiceStatus.COMPLETED &&
        serviceDate >= currentMonthStart &&
        serviceDate <= currentMonthEnd
      );
    });

    const preventiveCount = currentMonthServices.filter(
      (s) => s.type === ServiceType.INSPECTION,
    ).length;
    const correctiveCount = currentMonthServices.filter(
      (s) => s.type === ServiceType.MAINTENANCE,
    ).length;

    // Mock availability calculation (would need real uptime data)
    const availability = totalMachines > 0 ? 98.5 : 100;

    return {
      totalMachines,
      upcomingServicesCount: upcomingServices.length,
      activeAlertsCount: alerts.length,
      criticalCount,
      warningCount,
      monthlyTrends: monthlyData,
      upcomingServices,
      alerts: alerts,
      monthPerformance: {
        preventiveCount,
        correctiveCount,
        availability,
      },
    };
  };

  const dashboardData = calculateDashboardData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
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

      {/* Machine Health Grid - Full width */}
      <MachineHealthGrid
        machines={machines}
        criticalCount={dashboardData.criticalCount}
        warningCount={dashboardData.warningCount}
      />

      {/* Production Lines Carousel */}
      <ProductionLinesCarousel />

      {/* Next 7 Days + Month Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Next7DaysTimeline services={dashboardData.upcomingServices} />
        <MonthPerformance
          preventiveCount={dashboardData.monthPerformance.preventiveCount}
          correctiveCount={dashboardData.monthPerformance.correctiveCount}
          availability={dashboardData.monthPerformance.availability}
        />
      </div>

      {/* Service Trends Chart */}
      <ServiceTrendsChart data={dashboardData.monthlyTrends} />
    </div>
  );
}
