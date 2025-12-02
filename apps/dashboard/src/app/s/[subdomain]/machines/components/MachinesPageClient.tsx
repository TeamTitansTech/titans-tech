'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { MachineCard } from './MachineCard';
import { MachineCardSkeleton } from './MachineCardSkeleton';
import { BrandedSkeleton } from '@/components/ui/branded-skeleton';
import { MachineCreationModal } from './MachineCreationModal';
import { MachineEditModal } from './MachineEditModal';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import { NoPermission } from '@/components/no-permission/NoPermission';
import { calculateStatusFromLatestReport, type AlertStatus } from '@/lib/alertStatus';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Plus, Search, Cog, Activity, MapPin } from 'lucide-react';
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
import { useCompanyUser } from '@/contexts/CompanyUserContext';
import { useBranch } from '@/contexts/BranchContext';
import { getMachines, deleteMachine } from '@/data/services/machines.api';
import { getLatestReport } from '@/data/services/services.api';
import { getBranchesWithPermission, filterByBranchPermission } from '@/lib/branchFilters';
import { useLazyQuery } from '@/hooks/useLazyQuery';
import { toast } from 'sonner';
import {
  FoundationType,
  FrameType,
  MachineClutchType,
  PneumaticSystemType,
  PressMountingType,
  MachineFeaturesType,
  type Blueprint,
} from '@titans-tech/shared/types';
import type { LatestReport } from '@/data/types/services.types';

interface Machine {
  id: string;
  name: string;
  blueprintId: string;
  branchId: string;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  fields: { fieldSlug: string; value: string | number }[];
  blueprint?: Blueprint;
  branch?: {
    id: string;
    name: string;
    companyId: string;
  };
  location?: string;
  lastInspection?: string;
  status?: 'operational' | 'maintenance' | 'offline';
  manufacturer?: string;
  model?: string;
  sizeTonnage?: string;
  serialNumber?: string;
  stroke?: string;
  foundationType?: FoundationType;
  frameType?: FrameType;
  clutchType?: MachineClutchType;
  pneumaticSystem?: PneumaticSystemType;
  pressMounting?: PressMountingType;
  features?: MachineFeaturesType;
}

interface MachineWithStatus extends Machine {
  latestReport?: LatestReport | null;
  alertStatus?: AlertStatus;
}

export function MachinesPageClient() {
  const [machines, setMachines] = useState<MachineWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const { selectedBranchId } = useBranch();
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>(
    selectedBranchId || 'all',
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [blueprintFilter, setBlueprintFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [machineToDelete, setMachineToDelete] = useState<{ id: string; name: string } | null>(null);
  const t = useTranslations('machines');
  const { companyUser } = useCompanyUser();

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

  const { execute: executeDelete, isLoading: isDeleting } = useLazyQuery((id: string) =>
    deleteMachine(id),
  );

  // Get branches where user has permission to read machines
  const userBranches = useMemo(
    () => getBranchesWithPermission(companyUser, 'readMachines'),
    [companyUser],
  );

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

  // Filter machines based on all filters
  const filteredMachines = useMemo(() => {
    // First apply branch permission filter
    const branchFiltered = filterByBranchPermission(
      machines,
      companyUser,
      selectedBranchFilter,
      'readMachines',
    );

    // Then apply additional filters
    return branchFiltered.filter((machine) => {
      // Search filter - match name or blueprint name
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = machine.name.toLowerCase().includes(query);
        const matchesBlueprint = machine.blueprint?.name?.toLowerCase().includes(query);
        if (!matchesName && !matchesBlueprint) return false;
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
  }, [machines, companyUser, selectedBranchFilter, searchQuery, blueprintFilter, statusFilter]);

  // Check if user has permission to create machines in ANY branch (to show/hide button)
  const hasCreateMachinesPermission = useMemo(() => {
    if (!companyUser) return false;

    // Company admin and manager can create machines
    if (companyUser.isCompanyAdmin || companyUser.isCompanyManager) return true;

    // Check if user has createMachines permission in at least one branch
    return companyUser.branches.some((ub) => ub.createMachines);
  }, [companyUser]);

  // Check if user has permission to update machines
  const canUpdateMachine = (machinebranchId: string) => {
    if (!companyUser) return false;

    // Company admin and manager can update machines
    if (companyUser.isCompanyAdmin || companyUser.isCompanyManager) return true;

    // Check branch-specific permission
    const userBranch = companyUser.branches.find((ub) => ub.branchId === machinebranchId);
    return userBranch?.updateMachines || false;
  };

  // Check if user has permission to delete machines
  const canDeleteMachine = (machineBranchId: string) => {
    if (!companyUser) return false;

    // Company admin and manager can delete machines
    if (companyUser.isCompanyAdmin || companyUser.isCompanyManager) return true;

    // Check branch-specific permission
    const userBranch = companyUser.branches.find((ub) => ub.branchId === machineBranchId);
    return userBranch?.deleteMachines || false;
  };

  // Fetch all machines on mount and their latest reports
  useEffect(() => {
    const fetchMachinesWithStatus = async () => {
      setIsLoading(true);
      setError(null);
      setErrorStatus(null);

      // 1. Fetch all machines
      const response = await getMachines();

      if (response.errors) {
        setError(response.errors.join(', '));
        setErrorStatus(response.status);
        setMachines([]);
        setIsLoading(false);
        return;
      }

      const machinesData = response.data || [];

      // 2. Fetch latest report for each machine
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
            // If report fetch fails, return machine with unknown status
            return {
              ...machine,
              latestReport: null,
              alertStatus: 'unknown' as AlertStatus,
            };
          }
        }),
      );

      setMachines(machinesWithStatus);
      setIsLoading(false);
    };

    fetchMachinesWithStatus();
  }, []);

  const handleSuccess = async () => {
    // Refresh machines list with latest reports
    const response = await getMachines();
    if (response.data) {
      const machinesData = response.data;

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
              alertStatus: 'unknown' as AlertStatus,
            };
          }
        }),
      );

      setMachines(machinesWithStatus);
    }
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
      setMachines((prevMachines) =>
        prevMachines.filter((machine) => machine.id !== machineToDelete.id),
      );
      toast.success(t('deletedSuccessfully'));
    } else {
      toast.error(response.errors.join(', '));
    }

    setIsDeleteDialogOpen(false);
    setMachineToDelete(null);
  };

  return (
    <>
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0">
              <Typography variant="h2">{t('pageTitle')}</Typography>
              <Typography variant="muted" className="mt-1">
                {t('pageDescription')}
              </Typography>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              {hasCreateMachinesPermission && (
                <Button onClick={() => setIsModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t('newButton')}
                </Button>
              )}
            </div>
          </div>

          {/* Filters - Responsive layout */}
          <div className="flex flex-wrap gap-2 sm:gap-4">
            {/* Search */}
            <div className="relative w-full sm:w-auto sm:flex-1 sm:min-w-[200px] sm:max-w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('searchPlaceholder') || 'Search machines...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Branch Filter */}
            <Select value={selectedBranchFilter} onValueChange={setSelectedBranchFilter}>
              <SelectTrigger className="w-full sm:w-[200px] [&_.branch-location]:hidden">
                <MapPin className="w-4 h-4 mr-2 shrink-0" />
                <SelectValue placeholder={t('allBranches') || 'All Branches'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allBranches')}</SelectItem>
                {userBranches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id} textValue={branch.name}>
                    <div className="flex flex-col">
                      <span>{branch.name}</span>
                      {branch.location && (
                        <span className="branch-location text-xs text-muted-foreground truncate max-w-[180px]">
                          {branch.location}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Blueprint Filter */}
            <Select value={blueprintFilter} onValueChange={setBlueprintFilter}>
              <SelectTrigger className="w-[calc(50%-0.25rem)] sm:w-[200px]">
                <Cog className="w-4 h-4 mr-2 shrink-0" />
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
              <SelectTrigger className="w-[calc(50%-0.25rem)] sm:w-[180px]">
                <Activity className="w-4 h-4 mr-2 shrink-0" />
                <SelectValue placeholder={t('filterByStatus') || 'All Status'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allStatus') || 'All Status'}</SelectItem>
                <SelectItem value="operational">
                  {t('statusOperational') || 'Operational'}
                </SelectItem>
                <SelectItem value="maintenance">{t('statusMaintenance') || 'Warning'}</SelectItem>
                <SelectItem value="offline">{t('statusOffline') || 'Critical'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <BrandedSkeleton>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <MachineCardSkeleton key={i} />
              ))}
            </div>
          </BrandedSkeleton>
        ) : error ? (
          errorStatus === 403 ? (
            <NoPermission />
          ) : (
            <div className="text-center py-12">
              <p className="text-destructive">
                {t('errorLoading')}: {error}
              </p>
            </div>
          )
        ) : filteredMachines.length === 0 ? (
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

              return (
                <MachineCard
                  key={machine.id}
                  id={machine.id}
                  name={machine.name}
                  blueprintName={machine.blueprint?.name || t('noBlueprint')}
                  imageUrl={machine.imageUrl}
                  location={machine.branch?.name}
                  lastInspection={machine.lastInspection}
                  status={cardStatus}
                  onEdit={
                    canUpdateMachine(machine.branchId) ? () => handleEdit(machine) : undefined
                  }
                  onDelete={
                    canDeleteMachine(machine.branchId)
                      ? () => handleDeleteClick({ id: machine.id, name: machine.name })
                      : undefined
                  }
                />
              );
            })}
          </div>
        )}
      </div>

      <MachineCreationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
        branchId={selectedBranchFilter !== 'all' ? selectedBranchFilter : undefined}
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
            <AlertDialogCancel disabled={isDeleting}>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? t('deleting') : t('confirmDelete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
