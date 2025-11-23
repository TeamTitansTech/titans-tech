'use client';

import {
  MachineCard as SharedMachineCard,
  type MachineCardProps as SharedMachineCardProps,
} from '@/components/shared/MachineCard';

export interface MachineCardProps extends Omit<SharedMachineCardProps, 'basePath'> {}

export function MachineCard(props: MachineCardProps) {
  return <SharedMachineCard {...props} basePath="/admin/machines" />;
}
