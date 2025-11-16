import { getInspectionsByMachine } from '@/data/services/inspections.api';
import { getMachineById } from '@/data/services/machines.api';
import { GibsSection } from './GibsSection';

interface GibsSectionWrapperProps {
  machineId: string;
}

interface GibsData {
  point1: number;
  point2: number;
  point3: number;
  point4: number;
  point5: number;
  point6: number;
  point7: number;
  point8: number;
  point9: number;
  point10: number;
  point11: number;
  point12: number;
  point13: number;
  point14: number;
  point15: number;
  point16: number;
  leftTop?: number;
  leftBottom?: number;
  rightTop?: number;
  rightBottom?: number;
  frontTop?: number;
  frontBottom?: number;
  backTop?: number;
  backBottom?: number;
  hasBeenAdjusted?: string;
  usable?: string;
}

export interface InspectionData {
  id: string;
  date: string;
  gibsChecks: Array<{
    id: string;
    after: GibsData | null;
    before: GibsData | null;
  }>;
}

export async function GibsSectionWrapper({ machineId }: GibsSectionWrapperProps) {
  let inspections: InspectionData[] = [];
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
      inspections = (inspectionsResponse.data || []) as unknown as InspectionData[];
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
    <GibsSection machineId={machineId} inspections={inspections} machineName={machineName} />
  );
}
