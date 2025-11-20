'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Typography } from '@/components/ui/typography';
import { FleetHealthScore } from './FleetHealthScore';
import { ActiveAlerts } from './ActiveAlerts';
import { UpcomingServicesTimeline } from './UpcomingServicesTimeline';
import { ServiceTrendsChart } from './ServiceTrendsChart';
import { MachineStatusChart } from './MachineStatusChart';
import { QuickActions } from './QuickActions';
import { getServices } from '@/data/services/services.api';
import { getMachines } from '@/data/services/machines.api';
import { Loader2 } from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth, parseISO } from 'date-fns';

interface Service {
  id: string;
  date: string;
  type: 'INSPECTION' | 'MAINTENANCE';
  status: 'PENDING' | 'COMPLETED';
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
  severity: 'RED' | 'YELLOW' | 'GREEN';
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
          setServices(servicesResponse.data as Service[]);
        }

        if (machinesResponse.data) {
          setMachines(machinesResponse.data as Machine[]);
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
    const criticalCount = alerts.filter((alert) => alert.severity === 'RED').length;
    const warningCount = alerts.filter((alert) => alert.severity === 'YELLOW').length;

    // Calculate fleet health score (mock calculation)
    const completedServices = services.filter((s) => s.status === 'COMPLETED').length;
    const totalServices = services.length;
    const completionRate = totalServices > 0 ? (completedServices / totalServices) * 100 : 100;
    const fleetHealthScore = Math.round(
      completionRate * 0.7 + // 70% weight on service completion
        ((totalMachines - criticalCount - warningCount) / Math.max(totalMachines, 1)) * 30 // 30% weight on machine health
    );

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
          service.status === 'COMPLETED' &&
          serviceDate >= monthStart &&
          serviceDate <= monthEnd
        );
      });

      const inspections = monthServices.filter((s) => s.type === 'INSPECTION').length;
      const maintenance = monthServices.filter((s) => s.type === 'MAINTENANCE').length;

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
        return service.status === 'PENDING' && new Date(service.date) >= new Date();
      })
      .map((service) => ({
        id: service.id,
        machineName: service.machine.name,
        machineId: service.machine.id,
        branchName: service.machine.branch.name,
        date: service.date,
        type: service.type,
      }));

    return {
      fleetHealth: {
        score: fleetHealthScore,
        trend: 'stable' as const,
        criticalCount,
        warningCount,
        totalMachines,
      },
      machineStatus: {
        operational: totalMachines - criticalCount - warningCount,
        warning: warningCount,
        critical: criticalCount,
      },
      monthlyTrends: monthlyData,
      upcomingServices,
      alerts: alerts,
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

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fleet Health Score - spans 2 columns */}
        <FleetHealthScore
          score={dashboardData.fleetHealth.score}
          trend={dashboardData.fleetHealth.trend}
          criticalCount={dashboardData.fleetHealth.criticalCount}
          warningCount={dashboardData.fleetHealth.warningCount}
          totalMachines={dashboardData.fleetHealth.totalMachines}
        />

        {/* Active Alerts - spans 1 column */}
        <ActiveAlerts alerts={dashboardData.alerts} />

        {/* Upcoming Services Timeline - spans 2 columns */}
        <UpcomingServicesTimeline services={dashboardData.upcomingServices} />

        {/* Machine Status Chart - spans 1 column */}
        <MachineStatusChart data={dashboardData.machineStatus} />

        {/* Service Trends Chart - spans full width */}
        <ServiceTrendsChart data={dashboardData.monthlyTrends} />

        {/* Quick Actions - spans full width */}
        <QuickActions />
      </div>
    </div>
  );
}
