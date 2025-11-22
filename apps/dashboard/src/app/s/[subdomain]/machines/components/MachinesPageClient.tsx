'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { MachineCard } from './MachineCard';
import { MachineCreationModal } from './MachineCreationModal';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import { Plus } from 'lucide-react';
import { useBranch } from '@/contexts/BranchContext';
import { useCompanyUser } from '@/contexts/CompanyUserContext';
import { getMachinesByBranch } from '@/data/services/machines.api';

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
}

export function MachinesPageClient() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const t = useTranslations('machines');
  const { selectedBranchId, setSelectedBranchId, selectedBranchName } = useBranch();
  const { companyUser } = useCompanyUser();
  const searchParams = useSearchParams();
  const branchIdFromUrl = searchParams.get('branchId');

  // Check if user has permission to create machines in the selected branch
  const canCreateMachines = () => {
    if (!companyUser || !selectedBranchId) return false;

    // Company admin and manager can create machines
    if (companyUser.isCompanyAdmin || companyUser.isCompanyManager) return true;

    // Check branch-specific permission
    const userBranch = companyUser.branches.find((ub) => ub.branchId === selectedBranchId);
    return userBranch?.createMachines || false;
  };

  // Set branch ID from URL if available
  useEffect(() => {
    if (branchIdFromUrl && branchIdFromUrl !== selectedBranchId) {
      setSelectedBranchId(branchIdFromUrl);
    }
  }, [branchIdFromUrl, selectedBranchId, setSelectedBranchId]);

  // Fetch machines when selected branch changes
  useEffect(() => {
    const fetchMachines = async () => {
      if (!selectedBranchId) {
        setMachines([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      const response = await getMachinesByBranch(selectedBranchId);

      if (response.errors) {
        setError(response.errors.join(', '));
        setMachines([]);
      } else {
        setMachines(response.data || []);
      }
      setIsLoading(false);
    };

    fetchMachines();
  }, [selectedBranchId]);

  const handleSuccess = () => {
    // Refresh machines list
    if (selectedBranchId) {
      getMachinesByBranch(selectedBranchId).then((response) => {
        if (response.data) {
          setMachines(response.data);
        }
      });
    }
  };

  return (
    <>
      <div className="space-y-6 p-8">
        <div className="flex items-center justify-between">
          <div>
            <Typography variant="h2">{t('pageTitle')}</Typography>
            <Typography variant="muted">
              {selectedBranchName
                ? `${selectedBranchName} - ${t('pageDescription')}`
                : t('pageDescription')}
            </Typography>
          </div>
          {canCreateMachines() && (
            <Button onClick={() => setIsModalOpen(true)} disabled={!selectedBranchId}>
              <Plus className="w-4 h-4 mr-2" />
              {t('newButton')}
            </Button>
          )}
        </div>

        {!selectedBranchId ? (
          <div className="text-center py-12">
            <Typography variant="muted">Please select a branch to view machines</Typography>
          </div>
        ) : isLoading ? (
          <div className="text-center py-12">
            <Typography variant="muted">Loading machines...</Typography>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-destructive">
              {t('errorLoading')}: {error}
            </p>
          </div>
        ) : machines.length === 0 ? (
          <div className="text-center py-12">
            <Typography variant="muted">{t('emptyState')}</Typography>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {machines.map((machine) => (
              <MachineCard
                key={machine.id}
                id={machine.id}
                name={machine.name}
                blueprintName={machine.blueprint?.name || t('noBlueprint')}
                location={machine.location}
                lastInspection={machine.lastInspection}
                status={machine.status}
              />
            ))}
          </div>
        )}
      </div>

      <MachineCreationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
}
