'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { MachineCard } from './MachineCard';
import { MachineCreationModal } from './MachineCreationModal';
import { MachineEditModal } from './MachineEditModal';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import { NoPermission } from '@/components/no-permission/NoPermission';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, MapPin } from 'lucide-react';
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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useCompanyUser } from '@/contexts/CompanyUserContext';
import { getMachines, deleteMachine } from '@/data/services/machines.api';
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

interface Machine {
  id: string;
  name: string;
  blueprintId: string;
  branchId: string;
  fields: { fieldSlug: string; value: string | number }[];
  blueprint?: {
    name: string;
  };
  branch?: {
    id: string;
    name: string;
    companyId: string;
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

export function MachinesPageClient() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [machineToDelete, setMachineToDelete] = useState<{ id: string; name: string } | null>(null);
  const t = useTranslations('machines');
  const { companyUser } = useCompanyUser();

  const { execute: executeDelete, isLoading: isDeleting } = useLazyQuery((id: string) =>
    deleteMachine(id),
  );

  // Get branches where user has permission to read machines
  const userBranches = useMemo(() => {
    if (!companyUser) return [];
    // Company admins and managers can see all branches
    if (companyUser.isCompanyAdmin || companyUser.isCompanyManager) {
      return companyUser.branches.map((ub) => ({
        id: ub.branchId,
        name: ub.branch.name,
      }));
    }
    // Regular users only see branches where they have readMachines permission
    return companyUser.branches
      .filter((ub) => ub.readMachines)
      .map((ub) => ({
        id: ub.branchId,
        name: ub.branch.name,
      }));
  }, [companyUser]);

  // Filter machines by selected branch
  const filteredMachines = useMemo(() => {
    if (selectedBranchFilter === 'all') return machines;
    return machines.filter((machine) => machine.branchId === selectedBranchFilter);
  }, [machines, selectedBranchFilter]);

  // Check if user has permission to create machines in the selected branch
  const canCreateMachines = () => {
    if (!companyUser) return false;
    if (selectedBranchFilter === 'all') return false; // Need to select a specific branch to create

    // Company admin and manager can create machines
    if (companyUser.isCompanyAdmin || companyUser.isCompanyManager) return true;

    // Check branch-specific permission
    const userBranch = companyUser.branches.find((ub) => ub.branchId === selectedBranchFilter);
    return userBranch?.createMachines || false;
  };

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

  // Fetch all machines on mount
  useEffect(() => {
    const fetchMachines = async () => {
      setIsLoading(true);
      setError(null);
      setErrorStatus(null);
      const response = await getMachines();

      if (response.errors) {
        setError(response.errors.join(', '));
        setErrorStatus(response.status);
        setMachines([]);
      } else {
        setMachines(response.data || []);
      }
      setIsLoading(false);
    };

    fetchMachines();
  }, []);

  const handleSuccess = () => {
    // Refresh machines list
    getMachines().then((response) => {
      if (response.data) {
        setMachines(response.data);
      }
    });
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
      <div className="space-y-6 p-8">
        <div className="flex items-center justify-between">
          <div>
            <Typography variant="h2">{t('pageTitle')}</Typography>
            <Typography variant="muted" className="mt-1">
              {t('pageDescription')}
            </Typography>
          </div>
          <div className="flex items-center gap-4">
            {/* Branch Filter */}
            <Select value={selectedBranchFilter} onValueChange={setSelectedBranchFilter}>
              <SelectTrigger className="w-[200px]">
                <MapPin className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                {userBranches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Button onClick={() => setIsModalOpen(true)} disabled={!canCreateMachines()}>
                    <Plus className="w-4 h-4 mr-2" />
                    {t('newButton')}
                  </Button>
                </div>
              </TooltipTrigger>
              {!canCreateMachines() && (
                <TooltipContent>
                  <p>{t('selectBranchToCreate')}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <Typography variant="muted">Loading machines...</Typography>
          </div>
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
              {selectedBranchFilter === 'all' ? t('emptyState') : 'No machines in this branch'}
            </Typography>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMachines.map((machine) => (
              <MachineCard
                key={machine.id}
                id={machine.id}
                name={machine.name}
                blueprintName={machine.blueprint?.name || t('noBlueprint')}
                location={machine.branch?.name}
                lastInspection={machine.lastInspection}
                status={machine.status}
                onEdit={canUpdateMachine(machine.branchId) ? () => handleEdit(machine) : undefined}
                onDelete={
                  canDeleteMachine(machine.branchId)
                    ? () => handleDeleteClick({ id: machine.id, name: machine.name })
                    : undefined
                }
              />
            ))}
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
