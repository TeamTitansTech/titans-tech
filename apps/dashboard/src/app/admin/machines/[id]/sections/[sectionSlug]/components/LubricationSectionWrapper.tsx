import { getServicesByMachine } from '@/data/services/services.api';
import { getMachineById } from '@/data/services/machines.api';
import { LubricationSection } from './LubricationSection';

interface LubricationSectionWrapperProps {
  machineId: string;
}

interface LubricationHydraulicsGauge {
  system: string;
  gaugeSwitchIdentifier: string | null;
  psi: string | null;
}

interface LubricationHydraulicsData {
  changedOil: string;
  oilTemperature: number | null;
  oilTemperatureUnit: string;
  oilMfgType: string | null;
  changedFilter: string;
  gauges: LubricationHydraulicsGauge[];
}

export interface LubricationInspectionData {
  id: string;
  date: string;
  lubricationHydraulics: Array<{
    id: string;
    data: LubricationHydraulicsData | null;
  }>;
}

export async function LubricationSectionWrapper({ machineId }: LubricationSectionWrapperProps) {
  let inspections: LubricationInspectionData[] = [];
  let machineName = '';

  try {
    const [servicesResponse, machineResponse] = await Promise.all([
      getServicesByMachine(machineId),
      getMachineById(machineId),
    ]);

    if (servicesResponse.errors) {
      console.error('Errors fetching services:', servicesResponse.errors);
      inspections = [];
    } else {
      // Include both inspections and maintenances for lubrication data
      inspections = (servicesResponse.data || []) as unknown as LubricationInspectionData[];
    }

    if (machineResponse.errors) {
      console.error('Errors fetching machine:', machineResponse.errors);
      machineName = '';
    } else {
      machineName = machineResponse.data?.name || '';
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    inspections = [];
    machineName = '';
  }

  return (
    <LubricationSection machineId={machineId} inspections={inspections} machineName={machineName} />
  );
}
