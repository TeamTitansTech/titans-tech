'use client';

import { MachineCard as SharedMachineCard } from '@/components/shared/MachineCard';

interface MachineCardProps {
  id: string;
  name: string;
  blueprintName: string;
  location?: string;
  lastInspection?: string;
  status?: 'operational' | 'maintenance' | 'offline';
  canViewDetails?: boolean;
}

export function MachineCard(props: MachineCardProps) {
  return <SharedMachineCard {...props} showStatusBadge={true} basePath="/machines" />;
}
