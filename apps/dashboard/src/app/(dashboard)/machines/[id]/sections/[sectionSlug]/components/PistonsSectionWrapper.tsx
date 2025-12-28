import { getInspectionsByMachine } from '@/data/services/inspections.api';
import { getMachineById } from '@/data/services/machines.api';
import { PistonsSection } from './PistonsSection';
import { BranchAwareUnitManagerProvider } from '@/components/providers/BranchAwareUnitManagerProvider';

interface PistonsSectionWrapperProps {
  machineId: string;
}

interface PistonsData {
  lhTop: number | null;
  lhBottom: number | null;
  lhLeft: number | null;
  lhRight: number | null;
  rhTop: number | null;
  rhBottom: number | null;
  rhLeft: number | null;
  rhRight: number | null;
}

export interface PistonsInspectionData {
  id: string;
  date: string;
  pistons: Array<{
    id: string;
    outerData: PistonsData | null;
    innerData: PistonsData | null;
    guideSeals: string | null;
    pistonSeals: string | null;
    vacuumSystem: string | null;
    vacuumSystemAirPressureSetting: number | null;
    notes: string | null;
  }>;
}

export async function PistonsSectionWrapper({ machineId }: PistonsSectionWrapperProps) {
  let inspections: PistonsInspectionData[] = [];
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
      inspections = (inspectionsResponse.data || []) as unknown as PistonsInspectionData[];
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
    <BranchAwareUnitManagerProvider>
      <PistonsSection machineId={machineId} inspections={inspections} machineName={machineName} />
    </BranchAwareUnitManagerProvider>
  );
}
