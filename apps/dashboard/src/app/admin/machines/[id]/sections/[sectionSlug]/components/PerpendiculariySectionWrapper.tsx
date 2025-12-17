import { getInspectionsByMachine } from '@/data/services/inspections.api';
import { getMachineById } from '@/data/services/machines.api';
import { PerpendiculariySection } from './PerpendiculariySection';
import { UnitManagerProvider } from '@/contexts/UnitManagerContext';

interface PerpendiculariySectionWrapperProps {
  machineId: string;
}

export interface PerpendicularityInspectionData {
  id: string;
  date: string;
  perpendicularity: Array<{
    id: string;
    hasBeenAdjusted: string | null;
    beforeFR: number | null;
    beforeLR: number | null;
    afterFR: number | null;
    afterLR: number | null;
    notes: string | null;
  }>;
}

export async function PerpendiculariySectionWrapper({
  machineId,
}: PerpendiculariySectionWrapperProps) {
  let inspections: PerpendicularityInspectionData[] = [];
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
      inspections = (inspectionsResponse.data || []) as unknown as PerpendicularityInspectionData[];
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
      <PerpendiculariySection
        machineId={machineId}
        inspections={inspections}
        machineName={machineName}
      />
    </UnitManagerProvider>
  );
}
