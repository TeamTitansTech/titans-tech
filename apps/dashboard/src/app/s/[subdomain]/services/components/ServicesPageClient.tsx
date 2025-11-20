'use client';

import { useEffect, useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, CalendarX } from 'lucide-react';
import { getServices } from '@/data/services/services.api';
import { ServiceCard } from './ServiceCard';
import { ServiceStatsCards } from './ServiceStatsCards';
import { ServiceFilters } from './ServiceFilters';
import { ServiceSummaryModal } from '@/app/admin/machines/[id]/components/ServiceSummaryModal';

interface Service {
  id: string;
  date: Date | string;
  type: 'INSPECTION' | 'MAINTENANCE';
  status: 'PENDING' | 'COMPLETED';
  performedBy?: string | null;
  currentStep?: string | null;
  machine: {
    id: string;
    name: string;
    branch: {
      id: string;
      name: string;
    };
  };
}

export function ServicesPageClient() {
  const t = useTranslations('services');

  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMachine, setSelectedMachine] = useState('all');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState('all');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');

  // Fetch services
  useEffect(() => {
    async function loadServices() {
      setIsLoading(true);
      try {
        const response = await getServices();
        if (!response.errors && response.data) {
          setServices(response.data as Service[]);
        }
      } catch (error) {
        console.error('Error loading services:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadServices();
  }, []);

  // Apply branch filter
  const branchServices = useMemo(() => {
    if (selectedBranchFilter === 'all') return services;
    return services.filter((service) => service.machine.branch.id === selectedBranchFilter);
  }, [services, selectedBranchFilter]);

  // Get unique branches for filter
  const branches = useMemo(() => {
    const uniqueBranches = new Map();
    services.forEach((service) => {
      if (!uniqueBranches.has(service.machine.branch.id)) {
        uniqueBranches.set(service.machine.branch.id, {
          id: service.machine.branch.id,
          name: service.machine.branch.name,
        });
      }
    });
    return Array.from(uniqueBranches.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [services]);

  // Get unique machines for filter
  const machines = useMemo(() => {
    const uniqueMachines = new Map();
    branchServices.forEach((service) => {
      if (!uniqueMachines.has(service.machine.id)) {
        uniqueMachines.set(service.machine.id, {
          id: service.machine.id,
          name: service.machine.name,
        });
      }
    });
    return Array.from(uniqueMachines.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [branchServices]);

  // Apply filters and search
  const filteredServices = useMemo(() => {
    return branchServices.filter((service) => {
      // Machine filter
      if (selectedMachine !== 'all' && service.machine.id !== selectedMachine) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          service.machine.name.toLowerCase().includes(query) ||
          service.machine.branch.name.toLowerCase().includes(query) ||
          (service.performedBy?.toLowerCase().includes(query) ?? false)
        );
      }

      return true;
    });
  }, [branchServices, selectedMachine, searchQuery]);

  // Categorize services
  const { upcomingServices, historyServices, allServices } = useMemo(() => {
    const upcoming = filteredServices.filter((service) => service.status === 'PENDING');
    const history = filteredServices.filter((service) => service.status === 'COMPLETED');

    return {
      upcomingServices: upcoming.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      ),
      historyServices: history.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      ),
      allServices: filteredServices.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      ),
    };
  }, [filteredServices]);

  // Calculate stats
  const stats = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const completedThisMonth = branchServices.filter((service) => {
      if (service.status !== 'COMPLETED') return false;
      const serviceDate = new Date(service.date);
      return serviceDate >= startOfMonth && serviceDate <= endOfMonth;
    }).length;

    return {
      totalServices: branchServices.length,
      upcomingServices: upcomingServices.length,
      completedThisMonth,
    };
  }, [branchServices, upcomingServices]);

  const handleServiceClick = (service: Service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedService(null);
  };

  const renderServiceGrid = (servicesList: Service[]) => {
    if (servicesList.length === 0) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CalendarX className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 text-center">{t('noServicesFound')}</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {servicesList.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            onClick={() => handleServiceClick(service)}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <ServiceStatsCards
        totalServices={stats.totalServices}
        upcomingServices={stats.upcomingServices}
        completedThisMonth={stats.completedThisMonth}
      />

      {/* Filters */}
      <ServiceFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedMachine={selectedMachine}
        onMachineChange={setSelectedMachine}
        machines={machines}
        selectedBranch={selectedBranchFilter}
        onBranchChange={setSelectedBranchFilter}
        branches={branches}
      />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="w-full md:w-auto">
          <TabsTrigger value="upcoming" className="flex-1 md:flex-none">
            {t('tabs.upcoming')} ({upcomingServices.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="flex-1 md:flex-none">
            {t('tabs.history')} ({historyServices.length})
          </TabsTrigger>
          <TabsTrigger value="all" className="flex-1 md:flex-none">
            {t('tabs.all')} ({allServices.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          {renderServiceGrid(upcomingServices)}
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          {renderServiceGrid(historyServices)}
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          {renderServiceGrid(allServices)}
        </TabsContent>
      </Tabs>

      {/* Service Summary Modal */}
      {selectedService && (
        <ServiceSummaryModal
          service={selectedService}
          open={isModalOpen}
          onOpenChange={handleCloseModal}
        />
      )}
    </div>
  );
}
