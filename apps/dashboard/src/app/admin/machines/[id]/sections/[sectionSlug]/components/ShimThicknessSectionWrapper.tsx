import { getInspectionsByMachine } from '@/data/services/inspections.api';
import { getMachineById } from '@/data/services/machines.api';
import { ShimThicknessSection } from './ShimThicknessSection';
import { UnitManagerProvider } from '@/contexts/UnitManagerContext';

interface ShimThicknessSectionWrapperProps {
  machineId: string;
}

export interface ShimThicknessData {
  top: number | null;
  bottom: number | null;
  left: number | null;
  right: number | null;
}

export interface ShimThicknessInspectionData {
  id: string;
  date: string;
  shimThickness: Array<{
    id: string;
    hasBeenAdjusted: string | null;
    outerLhData: ShimThicknessData | null;
    outerRhData: ShimThicknessData | null;
    innerLhData: ShimThicknessData | null;
    innerRhData: ShimThicknessData | null;
    notes: string | null;
  }>;
}

export async function ShimThicknessSectionWrapper({ machineId }: ShimThicknessSectionWrapperProps) {
  let inspections: ShimThicknessInspectionData[] = [];
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
      inspections = (inspectionsResponse.data || []) as unknown as ShimThicknessInspectionData[];
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
    <UnitManagerProvider>
      <ShimThicknessSection
        machineId={machineId}
        inspections={inspections}
        machineName={machineName}
      />
    </UnitManagerProvider>
  );
}
