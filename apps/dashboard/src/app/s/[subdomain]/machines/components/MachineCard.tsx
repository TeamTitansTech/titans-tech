'use client';

import { MachineCard as SharedMachineCard } from '@/components/shared/MachineCard';

interface MachineCardProps {
  id: string;
  name: string;
  blueprintName: string;
  imageUrl?: string | null;
  location?: string;
  lastInspection?: string;
  status?: 'operational' | 'maintenance' | 'offline';
  canViewDetails?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function MachineCard(props: MachineCardProps) {
  // Use status circle like admin (showStatusBadge={false} is the default)
  return <SharedMachineCard {...props} basePath="/machines" />;
}
