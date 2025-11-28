import { getInspectionsByMachine } from '@/data/services/inspections.api';
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
    const [inspectionsResponse, machineResponse] = await Promise.all([
      getInspectionsByMachine(machineId),
      getMachineById(machineId),
    ]);

    if (inspectionsResponse.errors) {
      console.error('Errors fetching inspections:', inspectionsResponse.errors);
      inspections = [];
    } else {
      inspections = (inspectionsResponse.data || []) as unknown as LubricationInspectionData[];
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
