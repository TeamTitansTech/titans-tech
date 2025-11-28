import { getServicesByMachine } from '@/data/services/services.api';
import type { Service } from '@/data/types/services.types';
import { UpcomingServicesWrapper } from './UpcomingServicesWrapper';

interface UpcomingServicesProps {
  machineId: string;
  blueprintSections: string[];
  companyId?: string;
}

export async function UpcomingServices({
  machineId,
  blueprintSections,
  companyId,
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
    <UpcomingServicesWrapper
      machineId={machineId}
      blueprintSections={blueprintSections}
      services={services}
      companyId={companyId}
    />
  );
}
