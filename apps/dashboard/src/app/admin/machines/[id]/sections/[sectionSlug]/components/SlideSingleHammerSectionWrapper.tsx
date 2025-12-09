import { getInspectionsByMachine } from '@/data/services/inspections.api';
import { getMachineById } from '@/data/services/machines.api';
import { SlideSingleHammerSection } from './SlideSingleHammerSection';

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
  parallelism: number | null;
  hasParallelismBeenAdjusted: boolean | null;
  shutheightIndicatorsChecked: boolean | null;
  overloadsOnTonnageMonitor: boolean | null;
  shutheightActualSh: number | null;
  indicatorReading: number | null;
}

export interface SlideInspectionData {
  id: string;
  date: string;
  slide: Array<{
    id: string;
    outerData: SlideData | null;
    innerData: SlideData | null;
    outerBefore: SlideData | null;
    innerBefore: SlideData | null;
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
    <SlideSingleHammerSection
      machineId={machineId}
      inspections={inspections}
      machineName={machineName}
      blueprintId={blueprintId}
      hideThresholdValues={hideThresholdValues}
    />
  );
}
