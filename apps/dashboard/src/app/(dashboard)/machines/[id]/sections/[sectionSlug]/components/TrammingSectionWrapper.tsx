import { getInspectionsByMachine } from '@/data/services/inspections.api';
import { getMachineById } from '@/data/services/machines.api';
import { TrammingSection } from './TrammingSection';
import { LengthUnitFromEnum, UnitManagerProvider } from '@/contexts/UnitManagerContext';

interface TrammingSectionWrapperProps {
  machineId: string;
}

interface TrammingData {
  topTop: number | null;
  topBottom: number | null;
  topLeft: number | null;
  topRight: number | null;
  bottomTop: number | null;
  bottomBottom: number | null;
  bottomLeft: number | null;
  bottomRight: number | null;
  leftTop: number | null;
  leftBottom: number | null;
  leftLeft: number | null;
  leftRight: number | null;
  rightTop: number | null;
  rightBottom: number | null;
  rightLeft: number | null;
  rightRight: number | null;
}

export interface TrammingInspectionData {
  id: string;
  date: string;
  tramming: Array<{
    id: string;
    outerData: TrammingData | null;
    innerData: TrammingData | null;
    slideTram: string | null;
    notes: string | null;
  }>;
}

export async function TrammingSectionWrapper({ machineId }: TrammingSectionWrapperProps) {
  let inspections: TrammingInspectionData[] = [];
  let machineName = '';
  let branchDefaultUnit: LengthUnitFromEnum;

  try {
    const [inspectionsResponse, machineResponse] = await Promise.all([
      getInspectionsByMachine(machineId),
      getMachineById(machineId),
    ]);

    if (inspectionsResponse.errors) {
      console.error('Errors fetching inspections:', inspectionsResponse.errors);
      inspections = [];
    } else {
      inspections = (inspectionsResponse.data || []) as unknown as TrammingInspectionData[];
    }

    if (machineResponse.errors) {
      console.error('Errors fetching machine:', machineResponse.errors);
      machineName = '';
      branchDefaultUnit = 'INCHES';
    } else {
      machineName = machineResponse.data?.name || '';
      branchDefaultUnit = machineResponse.data?.branch?.defaultMeasurementUnit || 'INCHES';
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    inspections = [];
    machineName = '';
    branchDefaultUnit = 'INCHES';
  }

  return (
    <UnitManagerProvider defaultLengthUnit={branchDefaultUnit}>
      <TrammingSection machineId={machineId} inspections={inspections} machineName={machineName} />
    </UnitManagerProvider>
  );
}
