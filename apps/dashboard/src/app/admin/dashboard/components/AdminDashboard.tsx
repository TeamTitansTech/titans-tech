'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Building2,
  Wrench,
  ClipboardList,
  FolderKanban,
  Calendar,
  ExternalLink,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';
import { Badge } from '@/components/ui/badge';
import { getBlueprints } from '@/data/services/blueprints.api';
import { DashboardSkeleton } from './DashboardSkeleton';
import { Spinner } from '@/components/ui/spinner';
import { getMachines } from '@/data/services/machines.api';
import { getAllCompanies, type Company } from '@/data/services/companies.api';
import { getServices, getServiceById } from '@/data/services/services.api';
import { ServiceSummaryModal } from '@/app/admin/machines/[id]/components/ServiceSummaryModal';
import type { Service as FullService } from '@/data/types/services.types';
import {
  getAllBranchesForSysAdmin,
  type CompanyBranch,
} from '@/data/services/company-branches.api';
import { getProductionLines } from '@/data/services/production-lines.api';
import Link from 'next/link';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { ServiceType, ServiceStatus } from '@titans-tech/shared/enums';

interface DashboardStats {
  totalModels: number;
  activeCompanies: number;
  totalMachines: number;
  totalBranches: number;
  pendingServices: number;
  completedServices: number;
  productionLines: number;
}

interface CompanyWithStats extends Company {
  branchCount: number;
  machineCount: number;
  serviceCount: number;
}

interface Service {
  id: string;
  date: string;
  type: string;
  status: string;
  machine: {
    id: string;
    name: string;
    branch?: {
      id: string;
      name: string;
      company?: {
        id: string;
        name: string;
      };
    };
  };
}

interface MonthlyData {
  month: string;
  inspections: number;
  maintenance: number;
  total: number;
}

export function AdminDashboard() {
  const t = useTranslations('dashboard.admin');
  const [stats, setStats] = useState<DashboardStats>({
    totalModels: 0,
    activeCompanies: 0,
    totalMachines: 0,
    totalBranches: 0,
    pendingServices: 0,
    completedServices: 0,
    productionLines: 0,
  });
  const [companies, setCompanies] = useState<CompanyWithStats[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<FullService | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingService, setIsLoadingService] = useState(false);

  const handleServiceClick = async (serviceId: string) => {
    setIsLoadingService(true);
    try {
      const response = await getServiceById(serviceId);
      if (response.data) {
        setSelectedService(response.data as FullService);
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error('Error fetching service:', error);
    } finally {
      setIsLoadingService(false);
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);

        const [
          blueprintsRes,
          machinesRes,
          companiesRes,
          servicesRes,
          branchesRes,
          productionLinesRes,
        ] = await Promise.all([
          getBlueprints(),
          getMachines(),
          getAllCompanies(),
          getServices(),
          getAllBranchesForSysAdmin(),
          getProductionLines(),
        ]);

        const totalModels = blueprintsRes.data?.length || 0;
        const machines = machinesRes.data || [];
        const totalMachines = machines.length;
        const companiesData = companiesRes.data || [];
        const activeCompanies = companiesData.length;
        const branches = branchesRes.data || [];
        const totalBranches = branches.length;
        const productionLines = productionLinesRes.data?.length || 0;

        const servicesData = (servicesRes.data as unknown as Service[]) || [];
        const pendingServices = servicesData.filter(
          (s) => s.status === ServiceStatus.PENDING,
        ).length;
        const completedServices = servicesData.filter(
          (s) => s.status === ServiceStatus.COMPLETED,
        ).length;

        setStats({
          totalModels,
          activeCompanies,
          totalMachines,
          totalBranches,
          pendingServices,
          completedServices,
          productionLines,
        });

        // Calculate companies with stats
        const companiesWithStats = companiesData.map((company) => {
          const companyBranches = branches.filter((b: CompanyBranch) => b.companyId === company.id);
          const branchIds = companyBranches.map((b: CompanyBranch) => b.id);
          const companyMachines = machines.filter((m: { branchId?: string }) =>
            branchIds.includes(m.branchId || ''),
          );
          const companyServices = servicesData.filter((s) =>
            branchIds.includes(s.machine?.branch?.id || ''),
          );

          return {
            ...company,
            branchCount: companyBranches.length,
            machineCount: companyMachines.length,
            serviceCount: companyServices.length,
          };
        });

        setCompanies(companiesWithStats);
        setServices(servicesData.slice(0, 10)); // Recent 10 services

        // Calculate monthly trends for last 6 months
        const monthlyTrends: MonthlyData[] = [];
        for (let i = 5; i >= 0; i--) {
          const monthDate = subMonths(new Date(), i);
          const monthStart = startOfMonth(monthDate);
          const monthEnd = endOfMonth(monthDate);
          const monthLabel = format(monthDate, 'MMM');

          const monthServices = servicesData.filter((service) => {
            const serviceDate = parseISO(service.date);
            return (
              service.status === ServiceStatus.COMPLETED &&
              serviceDate >= monthStart &&
              serviceDate <= monthEnd
            );
          });

          const inspections = monthServices.filter((s) => s.type === ServiceType.INSPECTION).length;
          const maintenance = monthServices.filter(
            (s) => s.type === ServiceType.MAINTENANCE,
          ).length;

          monthlyTrends.push({
            month: monthLabel,
            inspections,
            maintenance,
            total: inspections + maintenance,
          });
        }
        setMonthlyData(monthlyTrends);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div>
        <Typography variant="h2">{t('title')}</Typography>
        <Typography variant="muted" className="mt-1">
          {t('description')}
        </Typography>
      </div>

      {/* Overview Stats - Hero Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/admin/companies">
          <Card className="border-2 cursor-pointer hover:border-primary/50 hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    {t('overview.companies')}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold tracking-tight">
                      {stats.activeCompanies}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{t('overview.registered')}</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/machines">
          <Card className="border-2 cursor-pointer hover:border-primary/50 hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    {t('overview.machines')}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold tracking-tight">{stats.totalMachines}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{t('overview.operating')}</p>
                </div>
                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950">
                  <Wrench className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/services">
          <Card className="border-2 cursor-pointer hover:border-primary/50 hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    {t('overview.services')}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold tracking-tight">
                      {stats.pendingServices}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{t('overview.pending')}</p>
                </div>
                <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950">
                  <Calendar className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/blueprints">
          <Card className="border-2 cursor-pointer hover:border-primary/50 hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    {t('stats.totalModels')}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold tracking-tight">{stats.totalModels}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">blueprints</p>
                </div>
                <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950">
                  <FolderKanban className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Companies Overview */}
      <Card>
        <CardHeader>
          <CardTitle>{t('companiesOverview.title')}</CardTitle>
          <CardDescription>{t('companiesOverview.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {companies.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {t('companiesOverview.noCompanies')}
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {companies.slice(0, 6).map((company) => (
                <div
                  key={company.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{company.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {company.branchCount} {t('companiesOverview.branches')} •{' '}
                        {company.machineCount} {t('companiesOverview.machines')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">{company.serviceCount}</p>
                      <p className="text-xs text-muted-foreground">
                        {t('companiesOverview.services')}
                      </p>
                    </div>
                    <Link href={`/admin/companies/${company.id}`}>
                      <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-primary" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Service Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle>{t('serviceTrends.title')}</CardTitle>
          <CardDescription>{t('serviceTrends.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={monthlyData}
                margin={{
                  top: 10,
                  right: 10,
                  left: 0,
                  bottom: 0,
                }}
              >
                <defs>
                  <linearGradient id="colorInspectionsAdmin" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorMaintenanceAdmin" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="month"
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Area
                  type="monotone"
                  dataKey="inspections"
                  stackId="1"
                  stroke="#3b82f6"
                  fill="url(#colorInspectionsAdmin)"
                  name={t('serviceTrends.legend.inspections')}
                />
                <Area
                  type="monotone"
                  dataKey="maintenance"
                  stackId="1"
                  stroke="#f97316"
                  fill="url(#colorMaintenanceAdmin)"
                  name={t('serviceTrends.legend.maintenance')}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {monthlyData.reduce((sum, month) => sum + month.inspections, 0)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {t('serviceTrends.stats.totalInspections')}
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {monthlyData.reduce((sum, month) => sum + month.maintenance, 0)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {t('serviceTrends.stats.totalMaintenance')}
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {monthlyData.reduce((sum, month) => sum + month.total, 0)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {t('serviceTrends.stats.totalServices')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('recentActivity.title')}</CardTitle>
              <CardDescription>{t('recentActivity.description')}</CardDescription>
            </div>
            {services.length > 0 && (
              <Link
                href="/admin/services"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                {t('recentActivity.viewAll')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {services.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {t('recentActivity.noActivity')}
            </p>
          ) : (
            <div className="space-y-4">
              {services.slice(0, 5).map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between p-4 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleServiceClick(service.id)}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-2 rounded-lg ${
                        service.type === ServiceType.INSPECTION
                          ? 'bg-blue-100 dark:bg-blue-950'
                          : 'bg-orange-100 dark:bg-orange-950'
                      }`}
                    >
                      <ClipboardList
                        className={`h-5 w-5 ${
                          service.type === ServiceType.INSPECTION
                            ? 'text-blue-600'
                            : 'text-orange-600'
                        }`}
                      />
                    </div>
                    <div>
                      <p className="font-medium">{service.machine?.name || 'Unknown Machine'}</p>
                      <p className="text-sm text-muted-foreground">
                        {service.machine?.branch?.company?.name ||
                          service.machine?.branch?.name ||
                          'Unknown'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge
                      variant={service.type === ServiceType.INSPECTION ? 'default' : 'secondary'}
                    >
                      {service.type === ServiceType.INSPECTION
                        ? t('recentActivity.inspection')
                        : t('recentActivity.maintenance')}
                    </Badge>
                    <Badge
                      variant={
                        service.status === ServiceStatus.COMPLETED ? 'outline' : 'destructive'
                      }
                    >
                      {service.status === ServiceStatus.COMPLETED
                        ? t('recentActivity.completed')
                        : t('recentActivity.pending')}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {format(parseISO(service.date), 'dd/MM/yyyy')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Service Summary Modal */}
      {selectedService && (
        <ServiceSummaryModal
          service={selectedService}
          open={isModalOpen}
          onOpenChange={(open) => {
            setIsModalOpen(open);
            if (!open) setSelectedService(null);
          }}
        />
      )}

      {/* Loading overlay for service fetch */}
      {isLoadingService && (
        <div className="fixed inset-0 bg-background/50 flex items-center justify-center z-50">
          <Spinner size="lg" className="text-primary" />
        </div>
      )}
    </div>
  );
}
