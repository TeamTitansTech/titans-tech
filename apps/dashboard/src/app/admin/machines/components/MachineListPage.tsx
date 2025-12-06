'use client';

import { useState, useMemo } from 'react';
import { useInternalRouter } from '@/hooks/useInternalRouter';
import { useTranslations } from 'next-intl';
import { MachineCard } from './MachineCard';
import { MachineCreationModal } from './MachineCreationModal';
import { MachineEditModal } from './MachineEditModal';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, Cog, Activity, Building2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { deleteMachine } from '@/data/services/machines.api';
import { useLazyQuery } from '@/hooks/useLazyQuery';
import { toast } from 'sonner';
import {
  FoundationType,
  FrameType,
  MachineClutchType,
  PneumaticSystemType,
  PressMountingType,
  MachineFeaturesType,
} from '@titans-tech/shared/types';
import type { AlertStatus } from '@/lib/alertStatus';
import type { LatestReport } from '@/data/types/services.types';

interface Machine {
  id: string;
  name: string;
  blueprintId: string;
  branchId: string;
  imageUrl?: string | null;
  fields: { fieldSlug: string; value: string | number }[];
  blueprint?: {
    name: string;
  };
  branch?: {
    id: string;
    name: string;
    companyId: string;
    company?: {
      id: string;
      name: string;
    };
  };
  location?: string;
  lastInspection?: string;
  status?: 'operational' | 'maintenance' | 'offline';
  manufacturer?: string | null;
  model?: string | null;
  sizeTonnage?: string | null;
  serialNumber?: string | null;
  stroke?: string | null;
  foundationType?: FoundationType | null;
  frameType?: FrameType | null;
  clutchType?: MachineClutchType | null;
  pneumaticSystem?: PneumaticSystemType | null;
  pressMounting?: PressMountingType | null;
  features?: MachineFeaturesType | null;
}

interface MachineWithStatus extends Machine {
  latestReport?: LatestReport | null;
  alertStatus?: AlertStatus;
}

// Helper to map alert status to machine card status
const mapAlertStatusToCardStatus = (
  alertStatus: AlertStatus,
): 'operational' | 'maintenance' | 'offline' => {
  switch (alertStatus) {
    case 'ok':
      return 'operational';
    case 'warning':
      return 'maintenance';
    case 'critical':
      return 'offline';
    default:
      return 'operational';
  }
};

interface MachineListPageProps {
  machines: MachineWithStatus[];
}

export function MachineListPage({ machines }: MachineListPageProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [machineToDelete, setMachineToDelete] = useState<{ id: string; name: string } | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [companyFilter, setCompanyFilter] = useState<string>('all');
  const [blueprintFilter, setBlueprintFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const router = useInternalRouter();
  const t = useTranslations('machines');
  const tActions = useTranslations('actions');

  const { execute: executeDelete, isLoading: isDeleting } = useLazyQuery((id: string) =>
    deleteMachine(id),
  );

  // Get unique companies for filter dropdown
  const companyOptions = useMemo(() => {
    const companies = new Map<string, string>();
    machines.forEach((m) => {
      if (m.branch?.company?.id && m.branch?.company?.name) {
        companies.set(m.branch.company.id, m.branch.company.name);
      }
    });
    return Array.from(companies.entries()).map(([id, name]) => ({ id, name }));
  }, [machines]);

  // Get unique blueprints for filter dropdown
  const blueprintOptions = useMemo(() => {
    const blueprints = new Map<string, string>();
    machines.forEach((m) => {
      if (m.blueprint?.name && m.blueprintId) {
        blueprints.set(m.blueprintId, m.blueprint.name);
      }
    });
    return Array.from(blueprints.entries()).map(([id, name]) => ({ id, name }));
  }, [machines]);

  // Filter machines based on search and filters
  const filteredMachines = useMemo(() => {
    return machines.filter((machine) => {
      // Search filter - match name or blueprint name
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = machine.name.toLowerCase().includes(query);
        const matchesBlueprint = machine.blueprint?.name?.toLowerCase().includes(query);
        if (!matchesName && !matchesBlueprint) return false;
      }

      // Company filter
      if (companyFilter !== 'all' && machine.branch?.company?.id !== companyFilter) {
        return false;
      }

      // Blueprint filter
      if (blueprintFilter !== 'all' && machine.blueprintId !== blueprintFilter) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'all') {
        const alertStatus = machine.alertStatus || 'unknown';
        const cardStatus = mapAlertStatusToCardStatus(alertStatus);
        if (cardStatus !== statusFilter) return false;
      }

      return true;
    });
  }, [machines, searchQuery, companyFilter, blueprintFilter, statusFilter]);

  const handleSuccess = () => {
    router.refresh();
  };

  const handleEdit = (machine: Machine) => {
    setSelectedMachine(machine);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (machine: { id: string; name: string }) => {
    setMachineToDelete(machine);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!machineToDelete) return;

    const response = await executeDelete(machineToDelete.id);

    if (!response.errors) {
      toast.success(t('deletedSuccessfully'));
      router.refresh();
    } else {
      toast.error(response.errors.join(', '));
    }

    setIsDeleteDialogOpen(false);
    setMachineToDelete(null);
  };

  return (
    <>
      <div className="space-y-6 p-8">
        <div className="flex items-center justify-between">
          <div>
            <Typography variant="h2">{t('pageTitle')}</Typography>
            <Typography variant="muted">{t('pageDescription')}</Typography>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {t('newButton')}
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('searchPlaceholder') || 'Search machines...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Company Filter */}
          <Select value={companyFilter} onValueChange={setCompanyFilter}>
            <SelectTrigger className="w-[200px]">
              <Building2 className="w-4 h-4 mr-2" />
              <SelectValue placeholder={t('filterByCompany') || 'All Companies'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allCompanies') || 'All Companies'}</SelectItem>
              {companyOptions.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Blueprint Filter */}
          <Select value={blueprintFilter} onValueChange={setBlueprintFilter}>
            <SelectTrigger className="w-[200px]">
              <Cog className="w-4 h-4 mr-2" />
              <SelectValue placeholder={t('filterByBlueprint') || 'All Models'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allModels') || 'All Models'}</SelectItem>
              {blueprintOptions.map((bp) => (
                <SelectItem key={bp.id} value={bp.id}>
                  {bp.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Activity className="w-4 h-4 mr-2" />
              <SelectValue placeholder={t('filterByStatus') || 'All Status'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allStatus') || 'All Status'}</SelectItem>
              <SelectItem value="operational">{t('statusOperational') || 'Operational'}</SelectItem>
              <SelectItem value="maintenance">{t('statusMaintenance') || 'Warning'}</SelectItem>
              <SelectItem value="offline">{t('statusOffline') || 'Critical'}</SelectItem>
            </SelectContent>
          </Select>

          {/* Results count */}
          <div className="flex items-center text-sm text-muted-foreground">
            {filteredMachines.length} of {machines.length} machines
          </div>
        </div>

        {filteredMachines.length === 0 ? (
          <div className="text-center py-12">
            <Typography variant="muted">
              {machines.length === 0
                ? t('emptyState')
                : t('noResults') || 'No machines match your filters'}
            </Typography>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMachines.map((machine) => {
              // Use calculated alert status from latest report
              const alertStatus = machine.alertStatus || 'unknown';
              const cardStatus = mapAlertStatusToCardStatus(alertStatus);

              // Build location string: "Company Name - Branch Name"
              const locationParts = [];
              if (machine.branch?.company?.name) locationParts.push(machine.branch.company.name);
              if (machine.branch?.name) locationParts.push(machine.branch.name);
              const locationDisplay = locationParts.join(' - ') || machine.location;

              return (
                <MachineCard
                  key={machine.id}
                  id={machine.id}
                  name={machine.name}
                  blueprintName={machine.blueprint?.name || t('noBlueprint')}
                  imageUrl={machine.imageUrl}
                  location={locationDisplay}
                  lastInspection={machine.lastInspection}
                  status={cardStatus}
                  onEdit={() => handleEdit(machine)}
                  onDelete={() => handleDeleteClick({ id: machine.id, name: machine.name })}
                />
              );
            })}
          </div>
        )}
      </div>

      <MachineCreationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleSuccess}
      />

      {selectedMachine && (
        <MachineEditModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedMachine(null);
          }}
          onSuccess={handleSuccess}
          machine={selectedMachine}
        />
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteConfirmDescription', { name: machineToDelete?.name || '' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>{tActions('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? tActions('deleting') : t('confirmDelete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
