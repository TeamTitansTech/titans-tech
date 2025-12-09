import { getServicesByMachine } from '@/data/services/services.api';
import type { Service } from '@/data/types/services.types';
import { UpcomingServicesClient } from './UpcomingServicesClient';

interface UpcomingServicesProps {
  machineId: string;
  blueprintSections: string[];
  companyId?: string;
  canCreateServices?: boolean;
  canUpdateServices?: boolean;
  canDeleteServices?: boolean;
}

export async function UpcomingServices({
  machineId,
  blueprintSections,
  companyId,
  canCreateServices = true,
  canUpdateServices = true,
  canDeleteServices = true,
}: UpcomingServicesProps) {
  let services: Service[] = [];

  try {
    const response = await getServicesByMachine(machineId);

    if (response.errors) {
      console.error('❌ Erros ao buscar serviços:', response.errors);
      services = [];
    } else {
      services = response.data || [];
    }
  } catch (error) {
    console.error('❌ Erro ao buscar serviços:', error);
    services = [];
  }

  return (
    <UpcomingServicesClient
      machineId={machineId}
      blueprintSections={blueprintSections}
      services={services}
      companyId={companyId}
      canCreateServices={canCreateServices}
      canUpdateServices={canUpdateServices}
      canDeleteServices={canDeleteServices}
    />
  );
}
