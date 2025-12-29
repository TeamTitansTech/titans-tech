import { getServicesByMachine } from '@/data/services/services.api';
import type { Service } from '@/data/types/services.types';
import { ServiceHistoryClient } from './ServiceHistoryClient';
import type { LengthUnitFromEnum } from '@/contexts/UnitManagerContext';

interface ServiceHistoryProps {
  machineId: string;
  defaultMeasurementUnit: LengthUnitFromEnum;
}

export async function ServiceHistory({ machineId, defaultMeasurementUnit }: ServiceHistoryProps) {
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
    <ServiceHistoryClient services={services} defaultMeasurementUnit={defaultMeasurementUnit} />
  );
}
