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
  // Use status circle like admin (showStatusBadge={false} is the default)
  return <SharedMachineCard {...props} basePath="/machines" />;
}
