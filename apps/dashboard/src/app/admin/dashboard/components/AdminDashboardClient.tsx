'use client';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { FolderKanban, Users, Wrench, ClipboardList } from 'lucide-react';
import { StatCard } from '@/app/s/[subdomain]/home/components/StatCard';
import { getBlueprints } from '@/data/services/blueprints.api';
import { getMachines } from '@/data/services/machines.api';
import { getAllCompanies } from '@/data/services/companies.api';
import { getInspections } from '@/data/services/inspections.api';

interface DashboardStats {
  totalModels: number;
  activeCompanies: number;
  totalMachines: number;
  pendingServices: number;
}

export function AdminDashboardClient() {
  const t = useTranslations('dashboard.admin');
  const [stats, setStats] = useState<DashboardStats>({
    totalModels: 0,
    activeCompanies: 0,
    totalMachines: 0,
    pendingServices: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);

        const [blueprintsRes, machinesRes, companiesRes, inspectionsRes] = await Promise.all([
          getBlueprints(),
          getMachines(),
          getAllCompanies(),
          getInspections(),
        ]);

        const totalModels = blueprintsRes.data?.length || 0;
        const totalMachines = machinesRes.data?.length || 0;
        const activeCompanies = companiesRes.data?.length || 0;

        // Count inspections that are not maintenance (routine inspections = pending services)
        const pendingServices =
          inspectionsRes.data?.filter((inspection) => !inspection.isMaintenance)?.length || 0;

        setStats({
          totalModels,
          activeCompanies,
          totalMachines,
          pendingServices,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{t('title')}</h1>
        <p className="text-muted-foreground mt-1">{t('description')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard
          title={t('stats.totalModels')}
          value={isLoading ? '...' : stats.totalModels}
          icon={FolderKanban}
          iconColor="text-orange-500"
        />
        <StatCard
          title={t('stats.activeCompanies')}
          value={isLoading ? '...' : stats.activeCompanies}
          icon={Users}
          iconColor="text-blue-500"
        />
        <StatCard
          title={t('stats.machines')}
          value={isLoading ? '...' : stats.totalMachines}
          icon={Wrench}
          iconColor="text-green-500"
        />
        <StatCard
          title={t('stats.pendingServices')}
          value={isLoading ? '...' : stats.pendingServices}
          icon={ClipboardList}
          iconColor="text-yellow-500"
        />
      </div>
    </div>
  );
}
