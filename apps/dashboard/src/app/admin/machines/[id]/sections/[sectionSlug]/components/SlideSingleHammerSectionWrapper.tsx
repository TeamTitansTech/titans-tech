import { getInspectionsByMachine } from '@/data/services/inspections.api';
import { getMachineById } from '@/data/services/machines.api';
import { SlideSingleHammerSection } from './SlideSingleHammerSection';
import { UnitManagerProvider } from '@/contexts/UnitManagerContext';

interface SlideSingleHammerSectionWrapperProps {
  machineId: string;
  hideThresholdValues?: boolean;
}

interface SlideData {
  position1: number | null;
  position2: number | null;
  position3: number | null;
  position4: number | null;
  position5: number | null;
  parallelism: string | null;
  hasParallelismBeenAdjusted: string | null;
  shutheightIndicatorsChecked: string | null;
  overloadsOnTonnageMonitor: string | null;
  shutheightActualSh: string | null;
  indicatorReading: string | null;
}

export interface SlideInspectionData {
  id: string;
  date: string;
  // Single hammer uses slideSingleHammer array (Prisma returns array for relation)
  slideSingleHammer: Array<{
    id: string;
    data: SlideData | null;
    beforeData: SlideData | null;
  }>;
}

export async function SlideSingleHammerSectionWrapper({
  machineId,
  hideThresholdValues = false,
}: SlideSingleHammerSectionWrapperProps) {
  let inspections: SlideInspectionData[] = [];
  let machineName = '';
  let blueprintId = '';

  try {
    const [inspectionsResponse, machineResponse] = await Promise.all([
      getInspectionsByMachine(machineId),
      getMachineById(machineId),
    ]);

    if (inspectionsResponse.errors) {
      console.error('Errors fetching inspections:', inspectionsResponse.errors);
      inspections = [];
    } else {
      inspections = (inspectionsResponse.data || []) as unknown as SlideInspectionData[];
    }

    if (machineResponse.errors) {
      console.error('Errors fetching machine:', machineResponse.errors);
      machineName = '';
      blueprintId = '';
    } else {
      machineName = machineResponse.data?.name || '';
      blueprintId = machineResponse.data?.blueprintId || '';
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    inspections = [];
    machineName = '';
    blueprintId = '';
  }

  return (
    <UnitManagerProvider>
      <SlideSingleHammerSection
        machineId={machineId}
        inspections={inspections}
        machineName={machineName}
        blueprintId={blueprintId}
        hideThresholdValues={hideThresholdValues}
      />
    </UnitManagerProvider>
  );
}
