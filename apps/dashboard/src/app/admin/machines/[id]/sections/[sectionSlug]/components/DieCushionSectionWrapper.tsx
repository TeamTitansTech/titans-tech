import { getInspectionsByMachine } from '@/data/services/inspections.api';
import { getMachineById } from '@/data/services/machines.api';
import { DieCushionSection } from './DieCushionSection';

interface DieCushionSectionWrapperProps {
  machineId: string;
}

export interface DieCushionInspectionData {
  id: string;
  date: string;
  dieCushion: Array<{
    id: string;
    airLeaks: string | null;
    airLeaksLocation: string | null;
    pneumaticsPlumbing: string | null;
    lubrication: string | null;
    notes: string | null;
  }>;
}

export async function DieCushionSectionWrapper({ machineId }: DieCushionSectionWrapperProps) {
  let inspections: DieCushionInspectionData[] = [];
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
      inspections = (inspectionsResponse.data || []) as unknown as DieCushionInspectionData[];
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
    <DieCushionSection machineId={machineId} inspections={inspections} machineName={machineName} />
  );
}
