import { getInspectionsByMachine } from '@/data/services/inspections.api';
import { getMachineById } from '@/data/services/machines.api';
import { GibsSection } from './GibsSection';
import { UnitManagerProvider } from '@/contexts/UnitManagerContext';

interface GibsSectionWrapperProps {
  machineId: string;
  hideThresholdValues?: boolean;
}

interface GibsStageData {
  point1: number | null;
  point2: number | null;
  point3: number | null;
  point4: number | null;
  point5: number | null;
  point6: number | null;
  point7: number | null;
  point8: number | null;
  point9: number | null;
  point10: number | null;
  point11: number | null;
  point12: number | null;
  point13: number | null;
  point14: number | null;
  point15: number | null;
  point16: number | null;
}

export interface GibsInspectionData {
  id: string;
  date: string;
  gibs: Array<{
    id: string;
    outerData: GibsStageData | null;
    outerBefore: GibsStageData | null;
    outerFreeHangingData: GibsStageData | null;
    innerData: GibsStageData | null;
    innerBefore: GibsStageData | null;
    innerBeforeTool: GibsStageData | null;
    innerDataTool: GibsStageData | null;
    notes: string | null;
  }>;
}

export async function GibsSectionWrapper({
  machineId,
  hideThresholdValues = false,
}: GibsSectionWrapperProps) {
  let inspections: GibsInspectionData[] = [];
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
      inspections = (inspectionsResponse.data || []) as unknown as GibsInspectionData[];
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
      <GibsSection
        machineId={machineId}
        inspections={inspections}
        machineName={machineName}
        blueprintId={blueprintId}
        hideThresholdValues={hideThresholdValues}
      />
    </UnitManagerProvider>
  );
}
