import { getServicesByMachine } from '@/data/services/services.api';
import type { Service } from '@/data/types/services.types';
import { ServiceHistoryWrapper } from './ServiceHistoryWrapper';

interface ServiceHistoryProps {
  machineId: string;
  blueprintSections: string[];
}

export async function ServiceHistory({ machineId, blueprintSections }: ServiceHistoryProps) {
  let services: Service[] = [];

  try {
    const response = await getServicesByMachine(machineId);

    if (response.errors) {
      console.error('❌ Erros ao buscar inspeções:', response.errors);
      services = [];
    } else {
      services = response.data || [];
    }
  } catch (error) {
    console.error('❌ Erro ao buscar inspeções:', error);
    services = [];
  }

  return <ServiceHistoryWrapper machineId={machineId} blueprintSections={blueprintSections} services={services} />;
}
