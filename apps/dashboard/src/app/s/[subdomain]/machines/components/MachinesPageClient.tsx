'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { MachineCard } from './MachineCard';
import { MachineCreationModal } from './MachineCreationModal';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import { Plus } from 'lucide-react';

interface Machine {
  id: string;
  name: string;
  blueprintId: string;
  fields: { fieldSlug: string; value: string | number }[];
  blueprint?: {
    name: string;
  };
  location?: string;
  lastInspection?: string;
  status?: 'operational' | 'maintenance' | 'offline';
}

interface MachinesPageClientProps {
  machines: Machine[];
}

export function MachinesPageClient({ machines }: MachinesPageClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const t = useTranslations('machines');

  const handleSuccess = () => {
    router.refresh();
  };

  return (
    <>
      <div className="space-y-6 p-8">
        <div className="flex items-center justify-between">
          <div>
            <Typography variant="h2">{t('pageTitle')}</Typography>
            <Typography variant="muted">{t('pageDescription')}</Typography>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {t('newButton')}
          </Button>
        </div>

        {machines.length === 0 ? (
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
