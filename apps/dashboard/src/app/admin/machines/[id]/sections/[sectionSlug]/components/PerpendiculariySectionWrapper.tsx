import { getInspectionsByMachine } from '@/data/services/inspections.api';
import { getMachineById } from '@/data/services/machines.api';
import { PerpendiculariySection } from './PerpendiculariySection';
import { LengthUnitFromEnum, UnitManagerProvider } from '@/contexts/UnitManagerContext';

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
      inspections = (inspectionsResponse.data || []) as unknown as PerpendicularityInspectionData[];
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
      <PerpendiculariySection
        machineId={machineId}
        inspections={inspections}
        machineName={machineName}
      />
    </UnitManagerProvider>
  );
}
